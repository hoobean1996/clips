import asyncio
import logging
import os
import uuid
import sqlite3
from datetime import datetime
from typing import Union, List, Dict, Optional
from pathlib import Path

from video_processor import VideoProcessor

from fastapi import FastAPI, File, UploadFile, HTTPException, Query
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware  # 添加这一行

import aiofiles

app = FastAPI(title="Video Clip API", description="视频片段上传和搜索API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # 允许的前端地址
    allow_credentials=True,
    allow_methods=["*"],  # 允许所有HTTP方法
    allow_headers=["*"],  # 允许所有请求头
)

# 配置文件存储路径
DATA_DIR = Path("data")
VIDEO_DIR = DATA_DIR / "videos"
DATABASE_FILE = DATA_DIR / "video_metadata.db"

# 确保目录存在
DATA_DIR.mkdir(exist_ok=True)
VIDEO_DIR.mkdir(exist_ok=True)

# 支持的视频格式
ALLOWED_VIDEO_EXTENSIONS = {".mp4", ".avi", ".mov", ".mkv", ".webm", ".flv", ".wmv"}

def init_database():
    """初始化数据库和表结构"""
    conn = sqlite3.connect(DATABASE_FILE)
    cursor = conn.cursor()
    
    # 创建视频元数据表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS video_metadata (
            id TEXT PRIMARY KEY,
            original_filename TEXT NOT NULL,
            stored_filename TEXT NOT NULL,
            file_path TEXT NOT NULL,
            file_size INTEGER NOT NULL,
            content_type TEXT,
            upload_time TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT DEFAULT '',
            tags TEXT DEFAULT '',
            likes INTEGER DEFAULT 0,
            duration TEXT DEFAULT '未知'
        )
    ''')
    
    conn.commit()
    conn.close()

def get_db_connection():
    """获取数据库连接"""
    conn = sqlite3.connect(DATABASE_FILE)
    conn.row_factory = sqlite3.Row  # 使返回结果可以像字典一样访问
    return conn

def save_video_metadata(metadata: Dict):
    """保存视频元数据到数据库"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 将tags列表转换为逗号分隔的字符串
    tags_str = ','.join(metadata.get('tags', []))
    
    cursor.execute('''
        INSERT INTO video_metadata 
        (id, original_filename, stored_filename, file_path, file_size, 
         content_type, upload_time, title, description, tags, likes, duration)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        metadata['id'],
        metadata['original_filename'],
        metadata['stored_filename'],
        metadata['file_path'],
        metadata['file_size'],
        metadata['content_type'],
        metadata['upload_time'],
        metadata['title'],
        metadata['description'],
        tags_str,
        metadata['likes'],
        metadata['duration']
    ))
    
    conn.commit()
    conn.close()

def load_all_videos() -> List[Dict]:
    """从数据库加载所有视频元数据"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM video_metadata ORDER BY upload_time DESC')
    rows = cursor.fetchall()
    conn.close()
    
    videos = []
    for row in rows:
        video = dict(row)
        # 将tags字符串转换回列表
        if video['tags']:
            video['tags'] = video['tags'].split(',')
        else:
            video['tags'] = []
        videos.append(video)
    
    return videos

def search_videos_in_db(search_term: str) -> List[Dict]:
    """在数据库中搜索视频"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 使用LIKE进行模糊搜索，搜索标题、描述、原始文件名和标签
    search_pattern = f'%{search_term.lower()}%'
    
    cursor.execute('''
        SELECT * FROM video_metadata 
        WHERE LOWER(title) LIKE ? 
           OR LOWER(description) LIKE ? 
           OR LOWER(original_filename) LIKE ? 
           OR LOWER(tags) LIKE ?
        ORDER BY upload_time DESC
    ''', (search_pattern, search_pattern, search_pattern, search_pattern))
    
    rows = cursor.fetchall()
    conn.close()
    
    videos = []
    for row in rows:
        video = dict(row)
        # 将tags字符串转换回列表
        if video['tags']:
            video['tags'] = video['tags'].split(',')
        else:
            video['tags'] = []
        videos.append(video)
    
    return videos

def get_video_by_id(video_id: str) -> Optional[Dict]:
    """根据ID获取视频信息"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM video_metadata WHERE id = ?', (video_id,))
    row = cursor.fetchone()
    conn.close()
    
    if row:
        video = dict(row)
        # 将tags字符串转换回列表
        if video['tags']:
            video['tags'] = video['tags'].split(',')
        else:
            video['tags'] = []
        return video
    return None

def delete_video_from_db(video_id: str) -> bool:
    """从数据库中删除视频记录"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('DELETE FROM video_metadata WHERE id = ?', (video_id,))
    deleted = cursor.rowcount > 0
    
    conn.commit()
    conn.close()
    
    return deleted

def is_video_file(filename: str) -> bool:
    """检查文件是否为支持的视频格式"""
    return Path(filename).suffix.lower() in ALLOWED_VIDEO_EXTENSIONS

# 在应用启动时初始化数据库
init_database()

@app.get("/")
def read_root():
    return {"message": "Video Clip API", "version": "1.0.0"}

@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}

video_processor = VideoProcessor()

class BackgroundTaskManager:
    def __init__(self):
        self.tasks = {}
    
    def add_task(self, task_id: str, task):
        """添加任务到管理器"""
        self.tasks[task_id] = {
            'task': task,
            'status': 'running',
            'created_at': datetime.now().isoformat()
        }
        
        # 添加完成回调
        task.add_done_callback(lambda t: self._task_done_callback(task_id, t))
    
    def _task_done_callback(self, task_id: str, task):
        """任务完成回调"""
        if task_id in self.tasks:
            if task.exception():
                self.tasks[task_id]['status'] = 'failed'
                self.tasks[task_id]['error'] = str(task.exception())
                logging.error(f"后台任务 {task_id} 失败: {task.exception()}")
            else:
                self.tasks[task_id]['status'] = 'completed'
                self.tasks[task_id]['result'] = task.result()
                logging.info(f"后台任务 {task_id} 完成")
            
            self.tasks[task_id]['completed_at'] = datetime.now().isoformat()
    
    def get_task_status(self, task_id: str):
        """获取任务状态"""
        return self.tasks.get(task_id, {'status': 'not_found'})

# 全局任务管理器
task_manager = BackgroundTaskManager()


async def prepare_video_background_task(video_id: str, video_path: str):
    """后台视频准备任务"""
    try:
        logging.info(f"开始后台处理视频: {video_id}")
        
        result = video_processor.prepare_video(
            video_id=video_id,
            video_path=video_path,
            force_regenerate=False,
            whisper_model="base"
        )
        
        if result['success']:
            logging.info(f"视频 {video_id} 字幕准备完成: {result['subtitle_path']}")
        else:
            logging.error(f"视频 {video_id} 字幕准备失败: {result['error']}")
        
        return result
        
    except Exception as e:
        logging.error(f"后台任务执行异常: {e}")
        raise


@app.post("/upload", summary="上传视频文件")
async def upload_video(file: UploadFile = File(...)):
    """
    上传视频文件到服务器
    
    - **file**: 视频文件 (支持格式: mp4, avi, mov, mkv, webm, flv, wmv)
    """
    # 检查文件是否为空
    if not file.filename:
        raise HTTPException(status_code=400, detail="未选择文件")
    
    # 检查文件格式
    if not is_video_file(file.filename):
        raise HTTPException(
            status_code=400, 
            detail=f"不支持的文件格式。支持的格式: {', '.join(ALLOWED_VIDEO_EXTENSIONS)}"
        )
    
    try:
        # 生成唯一的文件ID和文件名
        file_id = str(uuid.uuid4())
        file_extension = Path(file.filename).suffix.lower()
        stored_filename = f"{file_id}{file_extension}"
        file_path = VIDEO_DIR / stored_filename
        
        # 保存文件
        async with aiofiles.open(file_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        # 获取文件大小
        file_size = len(content)
        
        # 创建视频元数据
        video_metadata = {
            "id": file_id,
            "original_filename": file.filename,
            "stored_filename": stored_filename,
            "file_path": str(file_path),
            "file_size": file_size,
            "content_type": file.content_type,
            "upload_time": datetime.now().isoformat(),
            "title": Path(file.filename).stem,  # 使用文件名作为标题
            "description": "",
            "tags": [],
            "likes": 0,
            "duration": "未知"  # 可以后续通过视频处理库获取真实时长
        }
        
        # 保存元数据到数据库
        save_video_metadata(video_metadata)
        
        background_task = asyncio.create_task(
            prepare_video_background_task(file_id, str(file_path))
        )
        
        # 将任务添加到管理器以便后续跟踪
        task_id = f"prepare_{file_id}"
        task_manager.add_task(task_id, background_task)
        
        logging.info(f"为视频 {file_id} 启动了后台字幕处理任务")
        
        return JSONResponse(
            status_code=201,
            content={
                "message": "视频上传成功",
                "video_id": file_id,
                "filename": file.filename,
                "file_size": file_size,
                "upload_time": video_metadata["upload_time"]
            }
        )
        
    except Exception as e:
        # 如果保存失败，删除可能已创建的文件
        if file_path.exists():
            file_path.unlink()
        
        raise HTTPException(status_code=500, detail=f"文件上传失败: {str(e)}")

@app.get("/search", summary="搜索视频")
def search_videos(q: str = Query(..., description="搜索关键词")):
    """
    根据关键词搜索视频
    
    - **q**: 搜索关键词，会在视频标题、描述、标签中进行模糊匹配
    """
    if not q or not q.strip():
        raise HTTPException(status_code=400, detail="搜索关键词不能为空")
    
    # 从数据库搜索视频
    matching_videos = search_videos_in_db(q.strip())
    
    # 转换为前端需要的格式
    results = []
    for video in matching_videos:
        result_video = {
            "id": video["id"],
            "title": video.get("title", "未命名视频"),
            "cover": f"/api/thumbnail/{video['id']}",  # 缩略图接口（需要另外实现）
            "likes": video.get("likes", 0),
            "duration": video.get("duration", "未知"),
            "upload_time": video.get("upload_time"),
            "file_size": video.get("file_size", 0),
            "original_filename": video.get("original_filename", "")
        }
        results.append(result_video)
    
    return {
        "query": q,
        "total": len(results),
        "results": results
    }

@app.get("/videos", summary="获取所有视频列表")
def get_all_videos():
    """获取所有已上传的视频列表"""
    all_videos = load_all_videos()
    
    # 转换为前端需要的格式
    video_list = []
    for video in all_videos:
        video_info = {
            "id": video["id"],
            "title": video.get("title", "未命名视频"),
            "cover": f"/api/thumbnail/{video['id']}",
            "likes": video.get("likes", 0),
            "duration": video.get("duration", "未知"),
            "upload_time": video.get("upload_time"),
            "file_size": video.get("file_size", 0),
            "original_filename": video.get("original_filename", "")
        }
        video_list.append(video_info)
    
    return {
        "total": len(video_list),
        "videos": video_list
    }

@app.get("/videos/{video_id}", summary="获取视频详情")
def get_video_details(video_id: str):
    """根据视频ID获取视频详细信息"""
    video = get_video_by_id(video_id)
    
    if not video:
        raise HTTPException(status_code=404, detail="视频不存在")
    
    return video

@app.delete("/videos/{video_id}", summary="删除视频")
def delete_video(video_id: str):
    """删除指定的视频文件和元数据"""
    # 先获取视频信息
    video = get_video_by_id(video_id)
    
    if not video:
        raise HTTPException(status_code=404, detail="视频不存在")
    
    try:
        # 删除文件
        file_path = Path(video["file_path"])
        if file_path.exists():
            file_path.unlink()
        
        # 从数据库中删除记录
        deleted = delete_video_from_db(video_id)
        
        if not deleted:
            raise HTTPException(status_code=500, detail="删除数据库记录失败")
        
        return {"message": f"视频 {video_id} 删除成功"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"删除视频失败: {str(e)}")

@app.get("/db/stats", summary="获取数据库统计信息")
def get_database_stats():
    """获取数据库统计信息"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 获取视频总数
    cursor.execute('SELECT COUNT(*) as total_videos FROM video_metadata')
    total_videos = cursor.fetchone()['total_videos']
    
    # 获取总文件大小
    cursor.execute('SELECT SUM(file_size) as total_size FROM video_metadata')
    total_size = cursor.fetchone()['total_size'] or 0
    
    # 获取最新上传的视频
    cursor.execute('SELECT title, upload_time FROM video_metadata ORDER BY upload_time DESC LIMIT 1')
    latest_video = cursor.fetchone()
    
    conn.close()
    
    return {
        "total_videos": total_videos,
        "total_size_bytes": total_size,
        "total_size_mb": round(total_size / (1024 * 1024), 2),
        "latest_video": dict(latest_video) if latest_video else None
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)