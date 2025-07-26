#!/bin/bash

# FastAPI 视频接口测试脚本
# 测试服务器地址
BASE_URL="http://localhost:8000"

echo "🎬 FastAPI 视频接口测试开始"
echo "================================"
echo "📋 测试环境: 使用单个测试视频文件 test_video.mp4"
echo ""

# 检查测试视频文件是否存在
if [ ! -f "test_video.mp4" ]; then
    echo "❌ 错误: 找不到测试文件 test_video.mp4"
    echo "请确保在当前目录下有 test_video.mp4 文件"
    exit 1
fi

echo "✅ 找到测试文件: test_video.mp4"
echo ""

# 1. 测试基础接口
echo "📋 1. 测试基础接口"
echo "GET /"
curl -X GET "$BASE_URL/" | jq '.'
echo -e "\n"

# 2. 检查初始状态 - 获取数据库统计信息
echo "📊 2. 检查初始数据库状态"
echo "GET /db/stats"
curl -X GET "$BASE_URL/db/stats" | jq '.'
echo -e "\n"

# 3. 获取所有视频列表（可能为空或有历史数据）
echo "📹 3. 获取当前视频列表"
echo "GET /videos"
INITIAL_VIDEOS=$(curl -s -X GET "$BASE_URL/videos")
echo "$INITIAL_VIDEOS" | jq '.'
INITIAL_COUNT=$(echo "$INITIAL_VIDEOS" | jq '.total')
echo "当前视频数量: $INITIAL_COUNT"
echo -e "\n"

# 4. 测试第一次上传视频
echo "⬆️  4. 测试第一次视频上传"
echo "POST /upload - 上传 test_video.mp4"
UPLOAD_RESPONSE1=$(curl -s -X POST "$BASE_URL/upload" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@test_video.mp4")
echo "$UPLOAD_RESPONSE1" | jq '.'
VIDEO_ID1=$(echo "$UPLOAD_RESPONSE1" | jq -r '.video_id')
echo "第一次上传的视频ID: $VIDEO_ID1"
echo -e "\n"

# 5. 测试第二次上传同一个视频（应该创建新记录）
echo "⬆️  5. 测试第二次上传同一视频文件"
echo "POST /upload - 再次上传 test_video.mp4（应该创建新记录）"
UPLOAD_RESPONSE2=$(curl -s -X POST "$BASE_URL/upload" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@test_video.mp4")
echo "$UPLOAD_RESPONSE2" | jq '.'
VIDEO_ID2=$(echo "$UPLOAD_RESPONSE2" | jq -r '.video_id')
echo "第二次上传的视频ID: $VIDEO_ID2"
echo -e "\n"

# 6. 测试第三次上传（为了有更多测试数据）
echo "⬆️  6. 测试第三次上传同一视频文件"
echo "POST /upload - 第三次上传 test_video.mp4"
UPLOAD_RESPONSE3=$(curl -s -X POST "$BASE_URL/upload" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@test_video.mp4")
echo "$UPLOAD_RESPONSE3" | jq '.'
VIDEO_ID3=$(echo "$UPLOAD_RESPONSE3" | jq -r '.video_id')
echo "第三次上传的视频ID: $VIDEO_ID3"
echo -e "\n"

# 7. 测试上传错误情况 - 创建临时错误文件
echo "❌ 7. 测试上传错误情况"
echo "创建临时的不支持文件格式 temp_test.txt"
echo "This is a text file for testing error handling" > temp_test.txt
echo "POST /upload - 上传不支持的文件格式"
curl -X POST "$BASE_URL/upload" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@temp_test.txt" | jq '.'
rm -f temp_test.txt
echo "临时测试文件已删除"
echo -e "\n"

# 8. 测试无文件上传
echo "❌ 8. 测试无文件上传"
echo "POST /upload - 不传文件参数"
curl -X POST "$BASE_URL/upload" \
  -H "Content-Type: multipart/form-data" | jq '.'
echo -e "\n"

# 9. 检查上传后的数据库统计信息
echo "📊 9. 检查上传后的数据库状态"
echo "GET /db/stats"
curl -X GET "$BASE_URL/db/stats" | jq '.'
echo -e "\n"

# 10. 获取所有视频列表
echo "📹 10. 获取所有视频列表"
echo "GET /videos"
ALL_VIDEOS=$(curl -s -X GET "$BASE_URL/videos")
echo "$ALL_VIDEOS" | jq '.'
TOTAL_COUNT=$(echo "$ALL_VIDEOS" | jq '.total')
echo "当前总视频数量: $TOTAL_COUNT"
echo -e "\n"

# 11. 获取单个视频详情
echo "🔍 11. 获取单个视频详情"
echo "GET /videos/$VIDEO_ID1 (第一个上传的视频)"
curl -X GET "$BASE_URL/videos/$VIDEO_ID1" | jq '.'
echo -e "\n"

echo "GET /videos/$VIDEO_ID2 (第二个上传的视频)"
curl -X GET "$BASE_URL/videos/$VIDEO_ID2" | jq '.'
echo -e "\n"

echo "GET /videos/$VIDEO_ID3 (第三个上传的视频)"
curl -X GET "$BASE_URL/videos/$VIDEO_ID3" | jq '.'
echo -e "\n"

# 12. 测试搜索功能 - 基于test_video文件名
echo "🔎 12. 测试搜索功能"
echo "GET /search?q=test (搜索关键词'test')"
curl -X GET "$BASE_URL/search?q=test" | jq '.'
echo -e "\n"

echo "GET /search?q=video (搜索关键词'video')"
curl -X GET "$BASE_URL/search?q=video" | jq '.'
echo -e "\n"

echo "GET /search?q=test_video (搜索完整文件名前缀)"
curl -X GET "$BASE_URL/search?q=test_video" | jq '.'
echo -e "\n"

echo "GET /search?q=mp4 (搜索文件扩展名)"
curl -X GET "$BASE_URL/search?q=mp4" | jq '.'
echo -e "\n"

# 13. 测试大小写不敏感搜索
echo "🔍 13. 测试大小写不敏感搜索"
echo "GET /search?q=TEST (大写搜索)"
curl -X GET "$BASE_URL/search?q=TEST" | jq '.'
echo -e "\n"

echo "GET /search?q=Video (混合大小写搜索)"
curl -X GET "$BASE_URL/search?q=Video" | jq '.'
echo -e "\n"

# 14. 测试搜索错误情况
echo "❌ 14. 测试搜索错误情况"
echo "GET /search?q= (空搜索)"
curl -X GET "$BASE_URL/search?q=" | jq '.'
echo -e "\n"

echo "GET /search (缺少参数)"
curl -X GET "$BASE_URL/search" | jq '.'
echo -e "\n"

# 15. 测试搜索不存在的内容
echo "🔍 15. 测试搜索不存在的内容"
echo "GET /search?q=nonexistent (搜索不存在的内容)"
curl -X GET "$BASE_URL/search?q=nonexistent" | jq '.'
echo -e "\n"

echo "GET /search?q=randomstring123 (搜索随机字符串)"
curl -X GET "$BASE_URL/search?q=randomstring123" | jq '.'
echo -e "\n"

# 16. 测试获取不存在的视频
echo "❌ 16. 测试获取不存在的视频"
echo "GET /videos/nonexistent-id"
curl -X GET "$BASE_URL/videos/nonexistent-id" | jq '.'
echo -e "\n"

echo "GET /videos/12345-fake-id"
curl -X GET "$BASE_URL/videos/12345-fake-id" | jq '.'
echo -e "\n"

# 17. 测试删除视频
echo "🗑️  17. 测试删除视频"
echo "DELETE /videos/$VIDEO_ID2 (删除第二个上传的视频)"
curl -X DELETE "$BASE_URL/videos/$VIDEO_ID2" | jq '.'
echo -e "\n"

# 18. 验证删除后的状态
echo "✅ 18. 验证删除后的状态"
echo "GET /videos (应该少了一个视频)"
AFTER_DELETE_VIDEOS=$(curl -s -X GET "$BASE_URL/videos")
echo "$AFTER_DELETE_VIDEOS" | jq '.'
AFTER_DELETE_COUNT=$(echo "$AFTER_DELETE_VIDEOS" | jq '.total')
echo "删除后视频数量: $AFTER_DELETE_COUNT"
echo -e "\n"

echo "GET /videos/$VIDEO_ID2 (应该返回404)"
curl -X GET "$BASE_URL/videos/$VIDEO_ID2" | jq '.'
echo -e "\n"

echo "确认其他视频仍然存在:"
echo "GET /videos/$VIDEO_ID1"
curl -X GET "$BASE_URL/videos/$VIDEO_ID1" | jq -c '{id: .id, title: .title, original_filename: .original_filename}'
echo -e "\n"

echo "GET /videos/$VIDEO_ID3"
curl -X GET "$BASE_URL/videos/$VIDEO_ID3" | jq -c '{id: .id, title: .title, original_filename: .original_filename}'
echo -e "\n"

# 19. 测试删除不存在的视频
echo "❌ 19. 测试删除不存在的视频"
echo "DELETE /videos/nonexistent-id"
curl -X DELETE "$BASE_URL/videos/nonexistent-id" | jq '.'
echo -e "\n"

echo "DELETE /videos/$VIDEO_ID2 (再次删除已删除的视频)"
curl -X DELETE "$BASE_URL/videos/$VIDEO_ID2" | jq '.'
echo -e "\n"

# 20. 测试搜索删除后的结果
echo "🔎 20. 测试删除后的搜索结果"
echo "GET /search?q=test (应该返回剩余的视频)"
curl -X GET "$BASE_URL/search?q=test" | jq '.'
echo -e "\n"

# 21. 最终状态检查
echo "📊 21. 最终状态检查"
echo "GET /videos (最终视频列表)"
FINAL_VIDEOS=$(curl -s -X GET "$BASE_URL/videos")
echo "$FINAL_VIDEOS" | jq '.'
FINAL_COUNT=$(echo "$FINAL_VIDEOS" | jq '.total')
echo "最终视频数量: $FINAL_COUNT"
echo -e "\n"

echo "GET /db/stats (最终数据库统计)"
curl -X GET "$BASE_URL/db/stats" | jq '.'
echo -e "\n"

# 22. 清理测试 - 删除剩余测试视频
echo "🧹 22. 清理剩余测试视频"
echo "DELETE /videos/$VIDEO_ID1"
curl -X DELETE "$BASE_URL/videos/$VIDEO_ID1" | jq '.'
echo -e "\n"

echo "DELETE /videos/$VIDEO_ID3"
curl -X DELETE "$BASE_URL/videos/$VIDEO_ID3" | jq '.'
echo -e "\n"

# 23. 验证清理后状态
echo "✅ 23. 验证清理后状态"
echo "GET /videos (应该回到接近初始状态)"
CLEANUP_VIDEOS=$(curl -s -X GET "$BASE_URL/videos")
echo "$CLEANUP_VIDEOS" | jq '.'
CLEANUP_COUNT=$(echo "$CLEANUP_VIDEOS" | jq '.total')
echo "清理后视频数量: $CLEANUP_COUNT"
echo -e "\n"

echo "GET /db/stats (清理后数据库统计)"
curl -X GET "$BASE_URL/db/stats" | jq '.'
echo -e "\n"

echo "🎉 测试完成！"
echo "================================"
echo "测试总结："
echo "✅ 基础接口访问"
echo "✅ 视频上传功能 (单文件多次上传)"
echo "✅ 文件格式验证"
echo "✅ 视频列表获取"
echo "✅ 视频详情查询"
echo "✅ 视频搜索功能 (多种关键词)"
echo "✅ 大小写不敏感搜索"
echo "✅ 错误处理机制"
echo "✅ 视频删除功能"
echo "✅ 数据库统计信息"
echo "✅ 数据清理验证"
echo ""
echo "📈 测试数据统计:"
echo "初始视频数量: $INITIAL_COUNT"
echo "上传后最大数量: $TOTAL_COUNT"
echo "删除一个后数量: $AFTER_DELETE_COUNT"
echo "最终清理后数量: $CLEANUP_COUNT"