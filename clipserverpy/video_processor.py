#!/usr/bin/env python3
"""
视频处理器模块
包含字幕检测、生成和搜索功能
"""

import sqlite3
import subprocess
import json
import re
import os
from pathlib import Path
from typing import List, Dict, Optional, Tuple, Union
from datetime import datetime, timedelta
import logging

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class VideoProcessor:
    """视频处理器类"""
    
    def __init__(self, db_path: str = "data/video_metadata.db"):
        self.supported_video_formats = {'.mp4', '.avi', '.mov', '.mkv', '.webm', '.flv', '.wmv'}
        self.supported_subtitle_formats = {'.srt', '.ass', '.ssa', '.vtt', '.sub'}
        self.db_path = db_path
        self.init_subtitle_processing_table()
    
    def init_subtitle_processing_table(self):
        """初始化字幕处理相关的数据库表"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            # 创建字幕处理记录表
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS subtitle_processing (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    video_id TEXT NOT NULL,
                    video_path TEXT NOT NULL,
                    subtitle_source TEXT NOT NULL,  -- 'embedded', 'external', 'whisper'
                    subtitle_path TEXT,
                    subtitle_language TEXT,
                    processing_status TEXT NOT NULL,  -- 'success', 'failed', 'processing'
                    error_message TEXT,
                    whisper_model TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (video_id) REFERENCES video_metadata (id)
                )
            ''')
            
            # 创建索引
            cursor.execute('''
                CREATE INDEX IF NOT EXISTS idx_subtitle_video_id 
                ON subtitle_processing(video_id)
            ''')
            
            cursor.execute('''
                CREATE INDEX IF NOT EXISTS idx_subtitle_status 
                ON subtitle_processing(processing_status)
            ''')
            
            # 为原视频表添加字幕准备状态字段
            cursor.execute('''
                ALTER TABLE video_metadata 
                ADD COLUMN subtitle_ready BOOLEAN DEFAULT FALSE
            ''')
            
            conn.commit()
            logging.info("字幕处理表初始化完成")
            
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e):
                # 列已存在，忽略错误
                pass
            else:
                logging.error(f"初始化字幕处理表失败: {e}")
        finally:
            conn.close()
    
    def extract_embedded_subtitles(self, video_path: str, output_dir: Optional[str] = None, 
                                 stream_index: int = 0) -> Dict:
        """
        从视频中提取内嵌字幕
        
        Args:
            video_path: 视频文件路径
            output_dir: 输出目录，默认为视频所在目录
            stream_index: 字幕流索引，默认为0（第一个字幕流）
            
        Returns:
            Dict: 提取结果
        """
        if not os.path.exists(video_path):
            return {
                'success': False,
                'error': f'视频文件不存在: {video_path}',
                'subtitle_path': None
            }
        
        if not self.check_ffmpeg_installed():
            return {
                'success': False,
                'error': 'ffmpeg 未安装',
                'subtitle_path': None
            }
        
        try:
            # 设置输出路径
            if not output_dir:
                output_dir = Path(video_path).parent
            else:
                os.makedirs(output_dir, exist_ok=True)
            
            video_name = Path(video_path).stem
            subtitle_path = Path(output_dir) / f"{video_name}_embedded.srt"
            
            # 构建ffmpeg命令提取字幕
            cmd = [
                'ffmpeg',
                '-i', video_path,
                '-map', f'0:s:{stream_index}',  # 选择字幕流
                '-c:s', 'srt',  # 转换为SRT格式
                str(subtitle_path),
                '-y'  # 覆盖输出文件
            ]
            
            logging.info(f"执行字幕提取命令: {' '.join(cmd)}")
            
            # 执行命令
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            
            if subtitle_path.exists():
                return {
                    'success': True,
                    'subtitle_path': str(subtitle_path),
                    'stream_index': stream_index,
                    'message': f'内嵌字幕提取成功: {subtitle_path}'
                }
            else:
                return {
                    'success': False,
                    'error': '字幕文件未生成',
                    'subtitle_path': None
                }
                
        except subprocess.CalledProcessError as e:
            return {
                'success': False,
                'error': f'ffmpeg执行失败: {e.stderr if e.stderr else str(e)}',
                'subtitle_path': None
            }
        except Exception as e:
            return {
                'success': False,
                'error': f'提取字幕时发生错误: {e}',
                'subtitle_path': None
            }
    
    def save_subtitle_processing_record(self, video_id: str, video_path: str, 
                                      subtitle_source: str, subtitle_path: Optional[str] = None,
                                      processing_status: str = 'success', 
                                      error_message: Optional[str] = None,
                                      subtitle_language: Optional[str] = None,
                                      whisper_model: Optional[str] = None) -> bool:
        """
        保存字幕处理记录到数据库
        
        Args:
            video_id: 视频ID
            video_path: 视频路径
            subtitle_source: 字幕来源 ('embedded', 'external', 'whisper')
            subtitle_path: 字幕文件路径
            processing_status: 处理状态 ('success', 'failed', 'processing')
            error_message: 错误信息
            subtitle_language: 字幕语言
            whisper_model: 使用的Whisper模型
            
        Returns:
            bool: 是否保存成功
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            # 删除该视频的旧记录
            cursor.execute('DELETE FROM subtitle_processing WHERE video_id = ?', (video_id,))
            
            # 插入新记录
            cursor.execute('''
                INSERT INTO subtitle_processing 
                (video_id, video_path, subtitle_source, subtitle_path, subtitle_language,
                 processing_status, error_message, whisper_model)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                video_id, video_path, subtitle_source, subtitle_path, subtitle_language,
                processing_status, error_message, whisper_model
            ))
            
            # 更新视频表的字幕准备状态
            subtitle_ready = processing_status == 'success'
            cursor.execute('''
                UPDATE video_metadata 
                SET subtitle_ready = ?, subtitle_processed = ?
                WHERE id = ?
            ''', (subtitle_ready, subtitle_ready, video_id))
            
            conn.commit()
            logging.info(f"字幕处理记录保存成功: video_id={video_id}, source={subtitle_source}")
            return True
            
        except Exception as e:
            conn.rollback()
            logging.error(f"保存字幕处理记录失败: {e}")
            return False
        finally:
            conn.close()
    
    def get_subtitle_processing_status(self, video_id: str) -> Optional[Dict]:
        """获取视频的字幕处理状态"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                SELECT * FROM subtitle_processing 
                WHERE video_id = ? 
                ORDER BY created_at DESC 
                LIMIT 1
            ''', (video_id,))
            
            result = cursor.fetchone()
            return dict(result) if result else None
            
        except Exception as e:
            logging.error(f"获取字幕处理状态失败: {e}")
            return None
        finally:
            conn.close()
    
    def prepare_video(self, video_id: str, video_path: str, 
                     force_regenerate: bool = False,
                     whisper_model: str = "base",
                     preferred_language: Optional[str] = None) -> Dict:
        """
        准备视频的字幕文件
        
        这个方法会：
        1. 检查视频是否有内嵌字幕，如果有则导出
        2. 如果没有内嵌字幕，检查是否有外部字幕文件
        3. 如果都没有，使用Whisper生成字幕
        4. 将处理结果记录到数据库
        
        Args:
            video_id: 视频ID
            video_path: 视频文件路径
            force_regenerate: 是否强制重新生成字幕
            whisper_model: Whisper模型 ('tiny', 'base', 'small', 'medium', 'large')
            preferred_language: 首选语言代码
            
        Returns:
            Dict: 处理结果
        """
        logging.info(f"开始准备视频字幕: video_id={video_id}, path={video_path}")
        
        # 检查视频文件是否存在
        if not os.path.exists(video_path):
            error_msg = f'视频文件不存在: {video_path}'
            self.save_subtitle_processing_record(
                video_id, video_path, 'unknown', None, 'failed', error_msg
            )
            return {
                'success': False,
                'error': error_msg,
                'video_id': video_id
            }
        
        # 如果不强制重新生成，检查是否已有处理记录
        if not force_regenerate:
            existing_status = self.get_subtitle_processing_status(video_id)
            if existing_status and existing_status['processing_status'] == 'success':
                subtitle_path = existing_status['subtitle_path']
                if subtitle_path and os.path.exists(subtitle_path):
                    logging.info(f"视频 {video_id} 已有字幕文件: {subtitle_path}")
                    return {
                        'success': True,
                        'message': '字幕文件已存在',
                        'subtitle_path': subtitle_path,
                        'subtitle_source': existing_status['subtitle_source'],
                        'video_id': video_id,
                        'from_cache': True
                    }
        
        subtitle_path = None
        subtitle_source = None
        subtitle_language = None
        whisper_model_used = None
        error_message = None
        
        try:
            # 步骤1: 检查内嵌字幕
            logging.info("检查内嵌字幕...")
            embedded_check = self.check_video_subtitles(video_path)
            
            if embedded_check['has_subtitles'] and not embedded_check.get('error'):
                logging.info(f"发现 {len(embedded_check['subtitle_streams'])} 个内嵌字幕流")
                
                # 选择最佳字幕流（优先选择首选语言）
                best_stream = self._select_best_subtitle_stream(
                    embedded_check['subtitle_streams'], preferred_language
                )
                
                # 提取内嵌字幕
                extract_result = self.extract_embedded_subtitles(
                    video_path, stream_index=best_stream['index']
                )
                
                if extract_result['success']:
                    subtitle_path = extract_result['subtitle_path']
                    subtitle_source = 'embedded'
                    subtitle_language = best_stream.get('language', 'unknown')
                    logging.info(f"内嵌字幕提取成功: {subtitle_path}")
                else:
                    logging.warning(f"内嵌字幕提取失败: {extract_result['error']}")
            
            # 步骤2: 如果没有成功提取内嵌字幕，检查外部字幕
            if not subtitle_path:
                logging.info("检查外部字幕文件...")
                external_subtitles = self.check_external_subtitles(video_path)
                
                if external_subtitles:
                    # 优先选择SRT格式的字幕
                    srt_files = [f for f in external_subtitles if f.endswith('.srt')]
                    if srt_files:
                        subtitle_path = srt_files[0]
                        subtitle_source = 'external'
                        subtitle_language = self._detect_subtitle_language(subtitle_path)
                        logging.info(f"使用外部字幕文件: {subtitle_path}")
                    else:
                        subtitle_path = external_subtitles[0]
                        subtitle_source = 'external'
                        subtitle_language = self._detect_subtitle_language(subtitle_path)
                        logging.info(f"使用外部字幕文件: {subtitle_path}")
            
            # 步骤3: 如果仍然没有字幕，使用Whisper生成
            if not subtitle_path:
                logging.info("未找到现有字幕，使用Whisper生成...")
                
                # 确保输出目录存在
                subtitles_dir = Path("data/subtitles")
                subtitles_dir.mkdir(parents=True, exist_ok=True)
                
                whisper_result = self.generate_subtitles_with_whisper(
                    video_path,
                    output_dir=str(subtitles_dir),
                    language=preferred_language,
                    model=whisper_model
                )
                
                if whisper_result['success']:
                    subtitle_path = whisper_result['subtitle_path']
                    subtitle_source = 'whisper'
                    subtitle_language = whisper_result.get('language_detected', preferred_language)
                    whisper_model_used = whisper_model
                    logging.info(f"Whisper字幕生成成功: {subtitle_path}")
                else:
                    error_message = f"Whisper生成字幕失败: {whisper_result['error']}"
                    logging.error(error_message)
            
            # 保存处理结果到数据库
            if subtitle_path:
                success = self.save_subtitle_processing_record(
                    video_id=video_id,
                    video_path=video_path,
                    subtitle_source=subtitle_source,
                    subtitle_path=subtitle_path,
                    processing_status='success',
                    subtitle_language=subtitle_language,
                    whisper_model=whisper_model_used
                )
                
                if success:
                    return {
                        'success': True,
                        'message': f'字幕准备完成，来源: {subtitle_source}',
                        'subtitle_path': subtitle_path,
                        'subtitle_source': subtitle_source,
                        'subtitle_language': subtitle_language,
                        'whisper_model': whisper_model_used,
                        'video_id': video_id,
                        'from_cache': False
                    }
                else:
                    error_message = "保存字幕处理记录失败"
            else:
                error_message = error_message or "无法获取或生成字幕文件"
        
        except Exception as e:
            error_message = f"准备视频字幕时发生错误: {e}"
            logging.error(error_message)
        
        # 记录失败结果
        self.save_subtitle_processing_record(
            video_id=video_id,
            video_path=video_path,
            subtitle_source=subtitle_source or 'unknown',
            processing_status='failed',
            error_message=error_message,
            whisper_model=whisper_model_used
        )
        
        return {
            'success': False,
            'error': error_message,
            'video_id': video_id,
            'subtitle_source': subtitle_source
        }
    
    def _select_best_subtitle_stream(self, subtitle_streams: list, 
                                   preferred_language: Optional[str] = None) -> Dict:
        """选择最佳的字幕流"""
        if not subtitle_streams:
            return {}
        
        # 如果指定了首选语言，优先选择该语言的字幕
        if preferred_language:
            for stream in subtitle_streams:
                if stream.get('language', '').lower().startswith(preferred_language.lower()):
                    return stream
        
        # 否则选择第一个字幕流
        return subtitle_streams[0]
    
    def _detect_subtitle_language(self, subtitle_path: str) -> str:
        """从字幕文件路径或内容检测语言"""
        subtitle_path = subtitle_path.lower()
        
        # 从文件名检测
        if any(lang in subtitle_path for lang in ['zh', 'chi', 'chinese', 'cn']):
            return 'zh'
        elif any(lang in subtitle_path for lang in ['en', 'eng', 'english']):
            return 'en'
        
        # 可以添加更多语言检测逻辑
        # 比如读取文件内容进行语言检测
        
        return 'unknown'
    
    def batch_prepare_videos(self, force_regenerate: bool = False, 
                           whisper_model: str = "base") -> Dict:
        """
        批量准备所有视频的字幕
        
        Args:
            force_regenerate: 是否强制重新生成所有字幕
            whisper_model: Whisper模型
            
        Returns:
            Dict: 批量处理结果
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 获取所有视频记录
        if force_regenerate:
            cursor.execute('SELECT id, file_path FROM video_metadata')
        else:
            cursor.execute('''
                SELECT id, file_path FROM video_metadata 
                WHERE subtitle_ready IS NOT TRUE
            ''')
        
        videos = cursor.fetchall()
        conn.close()
        
        total_videos = len(videos)
        successful = 0
        failed = 0
        skipped = 0
        
        logging.info(f"开始批量处理 {total_videos} 个视频的字幕")
        
        for video_id, file_path in videos:
            try:
                result = self.prepare_video(
                    video_id=video_id,
                    video_path=file_path,
                    force_regenerate=force_regenerate,
                    whisper_model=whisper_model
                )
                
                if result['success']:
                    if result.get('from_cache'):
                        skipped += 1
                        logging.info(f"视频 {video_id} 跳过（已有字幕）")
                    else:
                        successful += 1
                        logging.info(f"视频 {video_id} 处理成功")
                else:
                    failed += 1
                    logging.error(f"视频 {video_id} 处理失败: {result.get('error')}")
                    
            except Exception as e:
                failed += 1
                logging.error(f"处理视频 {video_id} 时发生异常: {e}")
        
        return {
            'total_videos': total_videos,
            'successful': successful,
            'failed': failed,
            'skipped': skipped,
            'message': f'批量处理完成: 成功 {successful}, 失败 {failed}, 跳过 {skipped}'
        }

    
    def check_ffmpeg_installed(self) -> bool:
        """检查ffmpeg是否已安装"""
        try:
            subprocess.run(['ffmpeg', '-version'], capture_output=True, check=True)
            return True
        except (subprocess.CalledProcessError, FileNotFoundError):
            return False
    
    def check_whisper_installed(self) -> bool:
        """检查whisper是否已安装"""
        try:
            subprocess.run(['whisper', '--help'], capture_output=True, check=True)
            return True
        except (subprocess.CalledProcessError, FileNotFoundError):
            return False

    # =================================
    # 1. 字幕检测功能
    # =================================
    
    def check_video_subtitles(self, video_path: str) -> Dict:
        """
        使用ffmpeg检查视频是否包含字幕信息
        
        Args:
            video_path: 视频文件路径
            
        Returns:
            Dict: 字幕信息
        """
        if not os.path.exists(video_path):
            return {
                'error': f'视频文件不存在: {video_path}',
                'has_subtitles': False,
                'subtitle_streams': [],
                'total_streams': 0
            }
        
        if not self.check_ffmpeg_installed():
            return {
                'error': 'ffmpeg 未安装',
                'has_subtitles': False,
                'subtitle_streams': [],
                'total_streams': 0
            }
        
        try:
            # 使用ffprobe获取流信息
            cmd = [
                'ffprobe',
                '-v', 'quiet',
                '-print_format', 'json',
                '-show_streams',
                video_path
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            data = json.loads(result.stdout)
            
            # 筛选字幕流
            subtitle_streams = []
            for stream in data.get('streams', []):
                if stream.get('codec_type') == 'subtitle':
                    subtitle_streams.append({
                        'index': stream.get('index'),
                        'codec_name': stream.get('codec_name'),
                        'language': stream.get('tags', {}).get('language', 'unknown'),
                        'title': stream.get('tags', {}).get('title', ''),
                        'disposition': stream.get('disposition', {}),
                        'duration': stream.get('duration', 'unknown')
                    })
            
            return {
                'has_subtitles': len(subtitle_streams) > 0,
                'subtitle_streams': subtitle_streams,
                'total_streams': len(data.get('streams', [])),
                'video_path': video_path
            }
            
        except subprocess.CalledProcessError as e:
            return {
                'error': f'ffprobe 执行失败: {e}',
                'has_subtitles': False,
                'subtitle_streams': [],
                'total_streams': 0
            }
        except json.JSONDecodeError as e:
            return {
                'error': f'解析ffprobe输出失败: {e}',
                'has_subtitles': False,
                'subtitle_streams': [],
                'total_streams': 0
            }
        except Exception as e:
            return {
                'error': f'未预期的错误: {e}',
                'has_subtitles': False,
                'subtitle_streams': [],
                'total_streams': 0
            }
    
    def check_external_subtitles(self, video_path: str) -> List[str]:
        """
        检查视频文件同目录下的外部字幕文件
        
        Args:
            video_path: 视频文件路径
            
        Returns:
            List[str]: 外部字幕文件路径列表
        """
        video_path = Path(video_path)
        if not video_path.exists():
            return []
        
        video_name = video_path.stem  # 不含扩展名的文件名
        video_dir = video_path.parent
        
        subtitle_files = []
        
        for ext in self.supported_subtitle_formats:
            # 检查同名字幕文件
            subtitle_file = video_dir / f"{video_name}{ext}"
            if subtitle_file.exists():
                subtitle_files.append(str(subtitle_file))
            
            # 检查带语言标识的字幕文件
            for lang in ['zh', 'en', 'chi', 'eng', 'chs', 'cht', 'cn']:
                lang_subtitle_file = video_dir / f"{video_name}.{lang}{ext}"
                if lang_subtitle_file.exists():
                    subtitle_files.append(str(lang_subtitle_file))
        
        return subtitle_files

    # =================================
    # 2. Whisper字幕生成功能
    # =================================
    
    def generate_subtitles_with_whisper(self, video_path: str, output_dir: Optional[str] = None, 
                                      language: Optional[str] = None, model: str = "base") -> Dict:
        """
        使用Whisper生成视频字幕
        
        Args:
            video_path: 视频文件路径
            output_dir: 输出目录，默认为视频所在目录
            language: 语言代码 (如 'zh', 'en')，None为自动检测
            model: Whisper模型大小 ('tiny', 'base', 'small', 'medium', 'large')
            
        Returns:
            Dict: 生成结果
        """
        if not os.path.exists(video_path):
            return {
                'success': False,
                'error': f'视频文件不存在: {video_path}',
                'subtitle_path': None
            }
        
        if not self.check_whisper_installed():
            return {
                'success': False,
                'error': 'whisper 未安装，请运行: pip install openai-whisper',
                'subtitle_path': None
            }
        
        try:
            # 构建whisper命令
            cmd = ['whisper', video_path, '--output_format', 'srt']
            
            # 添加输出目录
            if output_dir:
                os.makedirs(output_dir, exist_ok=True)
                cmd.extend(['--output_dir', output_dir])
            else:
                output_dir = Path(video_path).parent
            
            # 添加语言参数
            if language:
                cmd.extend(['--language', language])
            
            # 添加模型参数
            cmd.extend(['--model', model])
            
            # 添加其他有用的参数
            cmd.extend([
                '--verbose', 'False',  # 减少输出
                '--fp16', 'False'      # 兼容性更好
            ])
            
            logger.info(f"执行Whisper命令: {' '.join(cmd)}")
            
            # 执行whisper命令
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            
            # 确定字幕文件路径
            video_name = Path(video_path).stem
            subtitle_path = Path(output_dir) / f"{video_name}.srt"
            
            if subtitle_path.exists():
                return {
                    'success': True,
                    'subtitle_path': str(subtitle_path),
                    'message': f'字幕生成成功: {subtitle_path}',
                    'model_used': model,
                    'language_detected': self._extract_language_from_whisper_output(result.stderr)
                }
            else:
                return {
                    'success': False,
                    'error': '字幕文件未生成',
                    'subtitle_path': None
                }
                
        except subprocess.CalledProcessError as e:
            return {
                'success': False,
                'error': f'Whisper执行失败: {e.stderr if e.stderr else str(e)}',
                'subtitle_path': None
            }
        except Exception as e:
            return {
                'success': False,
                'error': f'未预期的错误: {e}',
                'subtitle_path': None
            }
    
    def _extract_language_from_whisper_output(self, stderr_output: str) -> Optional[str]:
        """从Whisper输出中提取检测到的语言"""
        if not stderr_output:
            return None
        
        # 寻找语言检测信息
        pattern = r'Detected language:\s*(\w+)'
        match = re.search(pattern, stderr_output)
        return match.group(1) if match else None

    # =================================
    # 3. 字幕搜索功能
    # =================================
    
    def parse_srt_file(self, srt_path: str) -> List[Dict]:
        """
        解析SRT字幕文件
        
        Args:
            srt_path: SRT文件路径
            
        Returns:
            List[Dict]: 字幕条目列表
        """
        if not os.path.exists(srt_path):
            return []
        
        subtitles = []
        
        try:
            with open(srt_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except UnicodeDecodeError:
            # 尝试其他编码
            try:
                with open(srt_path, 'r', encoding='gbk') as f:
                    content = f.read()
            except UnicodeDecodeError:
                with open(srt_path, 'r', encoding='latin-1') as f:
                    content = f.read()
        
        # 分割字幕块
        subtitle_blocks = re.split(r'\n\s*\n', content.strip())
        
        for block in subtitle_blocks:
            lines = block.strip().split('\n')
            if len(lines) >= 3:
                try:
                    # 序号
                    index = int(lines[0])
                    
                    # 时间戳
                    time_line = lines[1]
                    start_time, end_time = self._parse_time_line(time_line)
                    
                    # 字幕文本
                    text = '\n'.join(lines[2:])
                    
                    subtitles.append({
                        'index': index,
                        'start_time': start_time,
                        'end_time': end_time,
                        'text': text,
                        'time_line': time_line
                    })
                except (ValueError, IndexError) as e:
                    logger.warning(f"解析字幕块失败: {block[:50]}... 错误: {e}")
                    continue
        
        return subtitles
    
    def _parse_time_line(self, time_line: str) -> Tuple[str, str]:
        """
        解析时间行，如 "00:01:30,500 --> 00:01:33,400"
        
        Returns:
            Tuple[str, str]: (开始时间, 结束时间)
        """
        # 移除多余空格并分割
        parts = time_line.strip().split(' --> ')
        if len(parts) != 2:
            raise ValueError(f"无效的时间行格式: {time_line}")
        
        start_time = parts[0].strip()
        end_time = parts[1].strip()
        
        return start_time, end_time
    
    def search_in_subtitles(self, srt_path: str, keyword: str, case_sensitive: bool = False) -> List[Dict]:
        """
        在字幕文件中搜索关键词
        
        Args:
            srt_path: SRT文件路径
            keyword: 搜索关键词
            case_sensitive: 是否区分大小写
            
        Returns:
            List[Dict]: 匹配的字幕条目列表
        """
        subtitles = self.parse_srt_file(srt_path)
        matches = []
        
        for subtitle in subtitles:
            text = subtitle['text']
            search_text = text if case_sensitive else text.lower()
            search_keyword = keyword if case_sensitive else keyword.lower()
            
            if search_keyword in search_text:
                # 高亮匹配的关键词
                if case_sensitive:
                    highlighted_text = text.replace(keyword, f"**{keyword}**")
                else:
                    # 保持原始大小写的高亮
                    highlighted_text = re.sub(
                        re.escape(keyword), 
                        f"**{keyword}**", 
                        text, 
                        flags=re.IGNORECASE
                    )
                
                matches.append({
                    **subtitle,
                    'highlighted_text': highlighted_text,
                    'keyword': keyword
                })
        
        return matches
    
    def create_video_clip_from_subtitle(self, video_path: str, subtitle_match: Dict, 
                                      output_path: Optional[str] = None, 
                                      padding_seconds: float = 1.0) -> Dict:
        """
        根据字幕匹配结果创建视频片段
        
        Args:
            video_path: 原视频路径
            subtitle_match: 字幕匹配结果
            output_path: 输出路径，None则自动生成
            padding_seconds: 前后填充秒数
            
        Returns:
            Dict: 剪辑结果
        """
        if not os.path.exists(video_path):
            return {
                'success': False,
                'error': f'视频文件不存在: {video_path}',
                'output_path': None
            }
        
        if not self.check_ffmpeg_installed():
            return {
                'success': False,
                'error': 'ffmpeg 未安装',
                'output_path': None
            }
        
        try:
            # 转换时间格式 (SRT格式 -> ffmpeg格式)
            start_time = self._convert_srt_time_to_seconds(subtitle_match['start_time'])
            end_time = self._convert_srt_time_to_seconds(subtitle_match['end_time'])
            
            # 添加填充时间
            start_time = max(0, start_time - padding_seconds)
            end_time = end_time + padding_seconds
            
            # 生成输出文件名
            if not output_path:
                video_dir = Path(video_path).parent
                keyword = subtitle_match.get('keyword', 'clip')
                # 清理文件名中的特殊字符
                safe_keyword = re.sub(r'[^\w\-_.]', '_', keyword)
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                output_path = video_dir / f"{safe_keyword}_clip_{timestamp}.mp4"
            
            # 构建ffmpeg命令
            cmd = [
                'ffmpeg',
                '-i', video_path,
                '-ss', str(start_time),
                '-to', str(end_time),
                '-c:v', 'libx264',
                '-c:a', 'copy',
                '-avoid_negative_ts', 'make_zero',
                str(output_path),
                '-y'  # 覆盖输出文件
            ]
            
            logger.info(f"执行剪辑命令: {' '.join(cmd)}")
            
            # 执行ffmpeg命令
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            
            return {
                'success': True,
                'output_path': str(output_path),
                'start_time': start_time,
                'end_time': end_time,
                'duration': end_time - start_time,
                'subtitle_text': subtitle_match['text'],
                'message': f'视频片段创建成功: {output_path}'
            }
            
        except subprocess.CalledProcessError as e:
            return {
                'success': False,
                'error': f'ffmpeg执行失败: {e.stderr if e.stderr else str(e)}',
                'output_path': None
            }
        except Exception as e:
            return {
                'success': False,
                'error': f'未预期的错误: {e}',
                'output_path': None
            }
    
    def _convert_srt_time_to_seconds(self, srt_time: str) -> float:
        """
        将SRT时间格式转换为秒数
        例: "00:01:30,500" -> 90.5
        """
        # 替换逗号为点号
        srt_time = srt_time.replace(',', '.')
        
        # 解析时间
        time_parts = srt_time.split(':')
        hours = int(time_parts[0])
        minutes = int(time_parts[1])
        seconds = float(time_parts[2])
        
        return hours * 3600 + minutes * 60 + seconds
    
    def search_and_clip(self, video_path: str, keyword: str, srt_path: Optional[str] = None,
                       output_dir: Optional[str] = None, padding_seconds: float = 1.0) -> Dict:
        """
        搜索关键词并生成视频片段（一体化函数）
        
        Args:
            video_path: 视频文件路径
            keyword: 搜索关键词
            srt_path: 字幕文件路径，None则自动查找
            output_dir: 输出目录
            padding_seconds: 前后填充秒数
            
        Returns:
            Dict: 处理结果
        """
        # 1. 查找字幕文件
        if not srt_path:
            external_subtitles = self.check_external_subtitles(video_path)
            srt_files = [f for f in external_subtitles if f.endswith('.srt')]
            
            if not srt_files:
                return {
                    'success': False,
                    'error': '未找到SRT字幕文件，请先生成字幕或指定字幕文件路径',
                    'clips': []
                }
            srt_path = srt_files[0]  # 使用第一个找到的SRT文件
        
        # 2. 搜索关键词
        matches = self.search_in_subtitles(srt_path, keyword)
        
        if not matches:
            return {
                'success': True,
                'message': f'在字幕中未找到关键词: {keyword}',
                'clips': [],
                'subtitle_file': srt_path
            }
        
        # 3. 为每个匹配生成视频片段
        clips = []
        for i, match in enumerate(matches):
            if output_dir:
                safe_keyword = re.sub(r'[^\w\-_.]', '_', keyword)
                output_path = Path(output_dir) / f"{safe_keyword}_clip_{i+1}.mp4"
            else:
                output_path = None
            
            clip_result = self.create_video_clip_from_subtitle(
                video_path, match, str(output_path) if output_path else None, padding_seconds
            )
            
            clips.append({
                'match_index': i + 1,
                'subtitle_index': match['index'],
                'text': match['text'],
                'highlighted_text': match['highlighted_text'],
                'start_time': match['start_time'],
                'end_time': match['end_time'],
                'clip_result': clip_result
            })
        
        successful_clips = [c for c in clips if c['clip_result']['success']]
        
        return {
            'success': True,
            'message': f'找到 {len(matches)} 个匹配，成功生成 {len(successful_clips)} 个视频片段',
            'keyword': keyword,
            'subtitle_file': srt_path,
            'total_matches': len(matches),
            'successful_clips': len(successful_clips),
            'clips': clips
        }


# =================================
# 便捷函数
# =================================

def quick_subtitle_check(video_path: str) -> Dict:
    """快速检查视频字幕信息"""
    processor = VideoProcessor()
    
    embedded = processor.check_video_subtitles(video_path)
    external = processor.check_external_subtitles(video_path)
    
    return {
        'embedded_subtitles': embedded,
        'external_subtitles': external,
        'has_any_subtitles': embedded['has_subtitles'] or len(external) > 0
    }

def quick_generate_subtitles(video_path: str, language: str = None) -> Dict:
    """快速生成字幕"""
    processor = VideoProcessor()
    return processor.generate_subtitles_with_whisper(video_path, language=language)

def quick_search_and_clip(video_path: str, keyword: str, **kwargs) -> Dict:
    """快速搜索并生成片段"""
    processor = VideoProcessor()
    return processor.search_and_clip(video_path, keyword, **kwargs)


# =================================
# 测试和示例
# =================================

if __name__ == "__main__":
    # 使用示例
    processor = VideoProcessor()
    
    # 示例视频路径
    video_file = "test_video.mp4"
    
    print("=== 视频处理器测试 ===")
    
    # 1. 检查字幕
    print("\n1. 检查字幕信息:")
    subtitle_info = processor.check_video_subtitles(video_file)
    print(f"内嵌字幕: {subtitle_info}")
    
    external_subs = processor.check_external_subtitles(video_file)
    print(f"外部字幕: {external_subs}")
    
    # 2. 生成字幕 (如果需要)
    if not subtitle_info['has_subtitles'] and not external_subs:
        print("\n2. 生成字幕:")
        whisper_result = processor.generate_subtitles_with_whisper(video_file)
        print(f"Whisper结果: {whisper_result}")
    
    # 3. 搜索并生成片段
    print("\n3. 搜索关键词并生成片段:")
    search_result = processor.search_and_clip(video_file, "hello")
    print(f"搜索结果: {search_result}")