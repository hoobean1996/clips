package main

import (
	"bufio"
	"context"
	"flag"
	"fmt"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"

	"com.gigaboo/clipserver/ent"
	"com.gigaboo/clipserver/ent/migrate"
	"entgo.io/ent/dialect"
	_ "github.com/mattn/go-sqlite3"
)

// 字幕条目结构
type SubtitleEntry struct {
	StartTime string
	EndTime   string
	Text      string
}

// 句子片段结构
type SentenceClip struct {
	Sentence  string
	StartTime string
	EndTime   string
	Filename  string
}

var (
	dataPath  = flag.String("data", "", "要处理的视频文件夹路径")
	clipsPath = flag.String("clips", "", "处理后的剪辑文件保存路径")
)

func main() {
	flag.Parse()

	if *dataPath == "" {
		log.Fatal("请使用 -data 参数指定视频文件夹路径")
	}

	if *clipsPath == "" {
		log.Fatal("请使用 -clips 参数指定剪辑文件保存路径")
	}

	// 创建剪辑保存目录（如果不存在）
	if err := os.MkdirAll(*clipsPath, 0755); err != nil {
		log.Fatal("创建剪辑目录失败:", err)
	}

	// Create ent.Client and run the schema migration.
	client, err := ent.Open(dialect.SQLite, "file:clips.db?_fk=1")
	if err != nil {
		log.Fatal("opening ent client", err)
	}
	defer client.Close()

	if err := client.Schema.Create(
		context.Background(),
		migrate.WithGlobalUniqueID(true),
	); err != nil {
		log.Fatal("creating schema", err)
	}

	processVideos(client, *dataPath, *clipsPath)
}

func processVideos(client *ent.Client, dataDir, clipsDir string) {
	log.Printf("开始处理目录: %s", dataDir)
	log.Printf("剪辑保存目录: %s", clipsDir)

	// 1. 扫描指定目录的所有视频
	videoFiles := scanVideosUnder(dataDir)
	log.Printf("找到 %d 个视频文件", len(videoFiles))

	for _, videoFile := range videoFiles {
		log.Printf("处理视频: %s", videoFile)

		// 2. 准备视频的字幕信息
		srtFile := prepareVideoSRT(videoFile)
		if srtFile == "" {
			log.Printf("跳过视频 %s (无法获取字幕)", videoFile)
			continue
		}

		// 3. 按句子剪辑视频
		err := clipBySentence(client, videoFile, srtFile, clipsDir)
		if err != nil {
			log.Printf("剪辑视频失败 %s: %v", videoFile, err)
			continue
		}
	}

	log.Println("批处理完成")
}

func scanVideosUnder(path string) []string {
	var videoFiles []string

	err := filepath.Walk(path, func(filePath string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		if !info.IsDir() {
			ext := strings.ToLower(filepath.Ext(filePath))
			filename := info.Name()

			// 支持常见的视频格式
			if ext == ".mp4" || ext == ".avi" || ext == ".mov" || ext == ".mkv" {
				// 跳过文件名包含 "_with_srt" 的视频文件
				if strings.Contains(filename, "_with_srt") {
					log.Printf("跳过带硬编码字幕的视频文件: %s", filename)
					return nil
				}
				videoFiles = append(videoFiles, filePath)
			}
		}

		return nil
	})

	if err != nil {
		log.Printf("扫描视频文件时出错: %v", err)
	}

	return videoFiles
}

// prepareVideoSRT 准备视频的字幕文件
func prepareVideoSRT(videoPath string) string {
	baseDir := filepath.Dir(videoPath)
	baseName := strings.TrimSuffix(filepath.Base(videoPath), filepath.Ext(videoPath))
	srtFile := filepath.Join(baseDir, baseName+".srt")

	// 检查是否已有字幕文件
	if _, err := os.Stat(srtFile); err == nil {
		log.Printf("使用已存在的字幕文件: %s", srtFile)
		return srtFile
	}

	// 1. 尝试提取内置字幕
	if extractEmbeddedSubtitle(videoPath, srtFile) {
		log.Printf("成功提取内置字幕: %s", srtFile)
		return srtFile
	}

	// 2. 使用whisper生成字幕
	if generateSubtitleWithWhisper(videoPath, srtFile) {
		log.Printf("成功生成whisper字幕: %s", srtFile)

		// 生成带硬编码字幕的视频
		videoWithSrtPath := filepath.Join(baseDir, baseName+"_with_srt.mp4")
		if hardcodeSubtitlesToVideo(videoPath, srtFile, videoWithSrtPath) {
			log.Printf("成功生成带硬编码字幕的视频: %s", videoWithSrtPath)
		}

		return srtFile
	}

	log.Printf("字幕文件获取失败: %s", videoPath)
	return ""
}

// clipBySentence 按句子剪辑视频
func clipBySentence(client *ent.Client, videoPath, srtFile, clipsDir string) error {
	// 解析字幕文件
	subtitles := parseSubtitleFile(srtFile)
	if len(subtitles) == 0 {
		return fmt.Errorf("字幕文件解析失败: %s", srtFile)
	}

	baseName := strings.TrimSuffix(filepath.Base(videoPath), filepath.Ext(videoPath))

	// 为每个字幕句子生成剪辑
	for i, subtitle := range subtitles {
		// 清理句子文本，用于文件名
		cleanText := cleanTextForFilename(subtitle.Text)
		if cleanText == "" {
			continue
		}

		// 生成剪辑文件名
		clipFilename := fmt.Sprintf("%s_sentence_%03d_%s.mp4", baseName, i+1, cleanText)
		clipPath := filepath.Join(clipsDir, clipFilename)

		sentenceClip := SentenceClip{
			Sentence:  subtitle.Text,
			StartTime: subtitle.StartTime,
			EndTime:   subtitle.EndTime,
			Filename:  clipPath,
		}

		// 生成剪辑
		err := generateSentenceClip(client, videoPath, sentenceClip)
		if err != nil {
			log.Printf("生成句子剪辑失败 (句子 %d): %v", i+1, err)
			continue
		}

		log.Printf("成功创建句子剪辑: %s", clipFilename)
	}

	return nil
}

// extractEmbeddedSubtitle 使用ffmpeg提取内置字幕
func extractEmbeddedSubtitle(videoFile, outputSrt string) bool {
	cmd := exec.Command("ffmpeg", "-i", videoFile, "-map", "0:s:0", "-c:s", "srt", outputSrt, "-y")
	err := cmd.Run()
	if err != nil {
		log.Printf("ffmpeg提取字幕失败: %v", err)
		return false
	}
	return true
}

// generateSubtitleWithWhisper 使用whisper生成字幕
func generateSubtitleWithWhisper(videoFile, outputSrt string) bool {
	cmd := exec.Command("whisper", videoFile, "--output_format", "srt", "--output_dir", filepath.Dir(outputSrt))
	err := cmd.Run()
	if err != nil {
		log.Printf("whisper生成字幕失败: %v", err)
		return false
	}

	// whisper生成的文件需要重命名
	baseName := strings.TrimSuffix(filepath.Base(videoFile), filepath.Ext(videoFile))
	whisperOutput := filepath.Join(filepath.Dir(outputSrt), baseName+".srt")

	if _, err := os.Stat(whisperOutput); err == nil {
		return os.Rename(whisperOutput, outputSrt) == nil
	}

	return false
}

// hardcodeSubtitlesToVideo 将字幕硬编码到视频中
func hardcodeSubtitlesToVideo(videoFile, srtFile, outputVideo string) bool {
	cmd := exec.Command("ffmpeg",
		"-i", videoFile,
		"-vf", fmt.Sprintf("subtitles=%s", srtFile),
		"-c:a", "copy",
		"-y", outputVideo,
	)

	err := cmd.Run()
	if err != nil {
		log.Printf("硬编码字幕失败: %v", err)
		return false
	}

	return true
}

// parseSubtitleFile 解析SRT字幕文件
func parseSubtitleFile(filename string) []SubtitleEntry {
	file, err := os.Open(filename)
	if err != nil {
		log.Printf("打开字幕文件失败: %v", err)
		return nil
	}
	defer file.Close()

	var subtitles []SubtitleEntry
	scanner := bufio.NewScanner(file)

	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())

		// 跳过序号行和空行
		if line == "" || regexp.MustCompile(`^\d+$`).MatchString(line) {
			continue
		}

		// 时间戳行
		if strings.Contains(line, "-->") {
			parts := strings.Split(line, " --> ")
			if len(parts) == 2 {
				startTime := strings.TrimSpace(parts[0])
				endTime := strings.TrimSpace(parts[1])

				// 读取文本内容
				var textLines []string
				for scanner.Scan() {
					textLine := strings.TrimSpace(scanner.Text())
					if textLine == "" {
						break
					}
					textLines = append(textLines, textLine)
				}

				if len(textLines) > 0 {
					subtitles = append(subtitles, SubtitleEntry{
						StartTime: startTime,
						EndTime:   endTime,
						Text:      strings.Join(textLines, " "),
					})
				}
			}
		}
	}

	return subtitles
}

// cleanTextForFilename 清理文本用于文件名
func cleanTextForFilename(text string) string {
	// 移除HTML标签
	text = regexp.MustCompile(`<[^>]*>`).ReplaceAllString(text, "")

	// 只保留字母、数字和空格
	text = regexp.MustCompile(`[^a-zA-Z0-9\s]`).ReplaceAllString(text, "")

	// 替换多个空格为单个空格
	text = regexp.MustCompile(`\s+`).ReplaceAllString(text, " ")

	// 去除首尾空格
	text = strings.TrimSpace(text)

	// 替换空格为下划线，并限制长度
	text = strings.ReplaceAll(text, " ", "_")
	if len(text) > 50 {
		text = text[:50]
	}

	return text
}

// extractWordsFromSentence 从句子中提取单词
func extractWordsFromSentence(sentence string) []string {
	// 匹配单词的正则表达式
	wordRegex := regexp.MustCompile(`\b[a-zA-Z]+\b`)

	words := wordRegex.FindAllString(sentence, -1)

	// 转换为小写并去重
	wordSet := make(map[string]bool)
	for _, word := range words {
		word = strings.ToLower(word)
		if len(word) > 1 { // 只保留长度大于1的单词
			wordSet[word] = true
		}
	}

	// 转换为切片
	var uniqueWords []string
	for word := range wordSet {
		uniqueWords = append(uniqueWords, word)
	}

	return uniqueWords
}

// generateThumbnail 为视频剪辑生成缩略图
func generateThumbnail(videoPath string) (string, error) {
	// 生成缩略图文件路径
	baseDir := filepath.Dir(videoPath)
	baseName := strings.TrimSuffix(filepath.Base(videoPath), filepath.Ext(videoPath))
	thumbnailPath := filepath.Join(baseDir, baseName+"_thumb.jpg")

	// 检查缩略图是否已存在
	if _, err := os.Stat(thumbnailPath); err == nil {
		log.Printf("缩略图已存在: %s", thumbnailPath)
		return thumbnailPath, nil
	}

	// 使用ffmpeg从视频开始位置截取一帧作为缩略图
	cmd := exec.Command("ffmpeg",
		"-i", videoPath,
		"-ss", "0.1", // 从视频开始0.1秒截取
		"-vframes", "1", // 只截取一帧
		"-q:v", "2", // 高质量JPEG (1-31, 2是高质量)
		"-vf", "scale=320:240", // 缩放到合适的缩略图尺寸
		thumbnailPath,
		"-y") // 覆盖已存在文件

	// 捕获错误输出以便调试
	output, err := cmd.CombinedOutput()
	if err != nil {
		return "", fmt.Errorf("ffmpeg生成缩略图失败: %v, 输出: %s", err, string(output))
	}

	// 验证缩略图文件是否生成成功
	if _, err := os.Stat(thumbnailPath); err != nil {
		return "", fmt.Errorf("缩略图文件生成失败: %v", err)
	}

	return thumbnailPath, nil
}

// generateSentenceClip 生成句子剪辑
func generateSentenceClip(client *ent.Client, videoFile string, sentenceClip SentenceClip) error {
	// 转换时间格式为ffmpeg支持的格式
	startSeconds := timeToSeconds(sentenceClip.StartTime)
	endSeconds := timeToSeconds(sentenceClip.EndTime)

	// 验证剪辑参数
	if err := validateClipParams(startSeconds, endSeconds); err != nil {
		return fmt.Errorf("参数验证失败: %v", err)
	}

	// 格式化为ffmpeg期望的格式 (秒数)
	startTime := fmt.Sprintf("%.3f", startSeconds)
	duration := fmt.Sprintf("%.3f", endSeconds-startSeconds)

	log.Printf("剪辑句子: 开始时间=%.3fs, 时长=%.3fs", startSeconds, endSeconds-startSeconds)

	// 使用ffmpeg生成H.264编码的剪辑，优化移动端兼容性
	cmd := exec.Command("ffmpeg",
		"-i", videoFile,
		"-ss", startTime,
		"-t", duration,
		// H.264 编码参数
		"-c:v", "libx264", // 使用H.264编码器
		"-profile:v", "main", // 使用main profile (兼容性好)
		"-level", "4.0", // H.264 level 4.0 (移动端兼容)
		"-preset", "medium", // 编码速度与质量平衡
		"-crf", "23", // 恒定质量因子 (18-28, 23是好的平衡点)
		// 音频编码参数
		"-c:a", "aac", // AAC音频编码
		"-b:a", "128k", // 音频码率128k
		// 移动端优化
		"-movflags", "+faststart", // 元数据前置，支持边下载边播放
		"-pix_fmt", "yuv420p", // 像素格式，兼容性最好
		// 其他参数
		"-avoid_negative_ts", "make_zero",
		sentenceClip.Filename,
		"-y") // 覆盖已存在文件

	// 捕获错误输出以便调试
	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("ffmpeg剪辑失败: %v, 输出: %s", err, string(output))
	}

	// 获取文件信息
	fileInfo, err := os.Stat(sentenceClip.Filename)
	if err != nil {
		return fmt.Errorf("获取文件信息失败: %v", err)
	}

	// 生成缩略图
	thumbnailPath, err := generateThumbnail(sentenceClip.Filename)
	if err != nil {
		log.Printf("生成缩略图失败: %v", err)
		// 缩略图生成失败不阻止整个流程，继续处理
		thumbnailPath = ""
	}

	words := extractWordsFromSentence(sentenceClip.Sentence)

	for _, word := range words {
		// 保存到数据库
		_, err = client.EntClipMetadata.Create().
			SetFileURL(sentenceClip.Filename).
			SetWord(word).
			SetSentence(sentenceClip.Sentence).
			SetFilename(filepath.Base(sentenceClip.Filename)).
			SetFileSize(int64(fileInfo.Size())).
			SetDuration(int(endSeconds) - int(startSeconds) + 1).
			SetFormat("mp4").
			SetThumbnail(thumbnailPath).
			Save(context.Background())

		if err != nil {
			log.Printf("保存单词 '%s' 到数据库失败: %v", word, err)
			continue
		}
	}

	log.Printf("句子剪辑生成成功: %s, 文件大小: %d bytes", sentenceClip.Filename, fileInfo.Size())
	return nil
}

// timeToSeconds 将时间字符串转换为秒数
func timeToSeconds(timeStr string) float64 {
	// 移除可能的空格并标准化格式
	timeStr = strings.TrimSpace(timeStr)
	// SRT格式: 00:00:10,500 -> 转换为 00:00:10.500
	timeStr = strings.ReplaceAll(timeStr, ",", ".")

	// 分割时间部分
	parts := strings.Split(timeStr, ":")
	if len(parts) != 3 {
		log.Printf("警告: 时间格式不正确: %s", timeStr)
		return 0
	}

	hours, err1 := strconv.ParseFloat(parts[0], 64)
	minutes, err2 := strconv.ParseFloat(parts[1], 64)
	seconds, err3 := strconv.ParseFloat(parts[2], 64)

	if err1 != nil || err2 != nil || err3 != nil {
		log.Printf("警告: 时间解析失败: %s (错误: %v, %v, %v)", timeStr, err1, err2, err3)
		return 0
	}

	totalSeconds := hours*3600 + minutes*60 + seconds
	return totalSeconds
}

// validateClipParams 验证剪辑参数是否合理
func validateClipParams(startSeconds, endSeconds float64) error {
	if startSeconds < 0 {
		return fmt.Errorf("开始时间不能为负数: %.3f", startSeconds)
	}

	if endSeconds <= startSeconds {
		return fmt.Errorf("结束时间必须大于开始时间: start=%.3f, end=%.3f", startSeconds, endSeconds)
	}

	duration := endSeconds - startSeconds
	if duration > 60 {
		return fmt.Errorf("剪辑时长过长 (%.1f秒), 可能是时间戳错误", duration)
	}

	if duration < 0.1 {
		return fmt.Errorf("剪辑时长过短 (%.3f秒)", duration)
	}

	return nil
}
