package main

import (
	"bufio"
	"context"
	"flag"
	"fmt"
	"io"
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

// 单词片段结构
type WordClip struct {
	Word      string
	StartTime string
	EndTime   string
	Filename  string
}

var videoPath = flag.String("path", "", "视频文件夹路径")

func main() {
	flag.Parse()

	if *videoPath == "" {
		log.Fatal("请使用 -path 参数指定视频文件夹路径")
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

	batchProcessVideos(client, *videoPath)
}

func batchProcessVideos(client *ent.Client, path string) {
	log.Printf("开始处理目录: %s", path)

	// 1. 扫描指定目录的所有mp4视频
	videoFiles, err := scanVideoFiles(path)
	if err != nil {
		log.Printf("扫描视频文件失败: %v", err)
		return
	}

	log.Printf("找到 %d 个视频文件", len(videoFiles))

	for _, videoFile := range videoFiles {
		log.Printf("处理视频: %s", videoFile)
		if strings.Contains(*videoPath, "_") {
			return
		}
		getSubtitleFile(videoFile)
		ensureVideoWithSubtitleHardcoded(videoFile)

		// 2. 检查并获取字幕文件
		subtitleFile := getSubtitleFile(videoFile)

		// 3. 处理字幕文件获取单词列表
		wordClips := processSubtitleFile(videoFile, subtitleFile)

		// 4. 生成视频剪辑并保存到数据库
		for _, wordClip := range wordClips {
			err := generateClipAndSave(client, videoFile, wordClip)
			if err != nil {
				log.Printf("处理单词mp4剪辑失败 %s: %v", wordClip.Word, err)
				continue
			}
			err = generateh264ClipAndSave(client, videoFile, wordClip)
			if err != nil {
				log.Printf("处理单词h264剪辑失败 %s: %v", wordClip.Word, err)
				continue
			}
			log.Printf("成功创建剪辑: %s", wordClip.Filename)
		}
	}

	log.Println("批处理完成")
}

// 扫描目录中的所有mp4文件
func scanVideoFiles(dir string) ([]string, error) {
	var videoFiles []string

	err := filepath.Walk(dir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		if !info.IsDir() && strings.ToLower(filepath.Ext(path)) == ".mp4" {
			videoFiles = append(videoFiles, path)
		}

		return nil
	})

	return videoFiles, err
}

func copyFile(src, dst string) error {
	sourceFile, err := os.Open(src)
	if err != nil {
		return err
	}
	defer sourceFile.Close()

	destFile, err := os.Create(dst)
	if err != nil {
		return err
	}
	defer destFile.Close()

	_, err = io.Copy(destFile, sourceFile)
	return err
}

// 获取或生成字幕文件
func getSubtitleFile(videoFile string) string {
	baseDir := filepath.Dir(videoFile)
	baseName := strings.TrimSuffix(filepath.Base(videoFile), filepath.Ext(videoFile))

	// 检查是否已有提取的字幕文件
	preparedSrt := filepath.Join(baseDir, baseName+"_prepared.srt")
	if _, err := os.Stat(preparedSrt); err == nil {
		log.Printf("使用已存在的字幕文件: %s", preparedSrt)
		return preparedSrt
	}

	// 尝试使用ffmpeg提取内置字幕
	if extractEmbeddedSubtitle(videoFile, preparedSrt) {
		log.Printf("成功提取内置字幕: %s", preparedSrt)
		return preparedSrt
	}

	// 使用whisper生成字幕
	if generateSubtitleWithWhisper(videoFile, preparedSrt) {
		log.Printf("成功生成whisper字幕: %s", preparedSrt)
		return preparedSrt
	}

	log.Printf("字幕文件获取失败: %s", videoFile)
	return ""
}

// 确保MP4视频包含内置字幕，如果没有则将外部SRT字幕写入
// 硬编码字幕版本（字幕直接烧录到视频画面中）
func ensureVideoWithSubtitleHardcoded(videoFile string) error {
	baseDir := filepath.Dir(videoFile)
	baseName := strings.TrimSuffix(filepath.Base(videoFile), filepath.Ext(videoFile))
	srtFile := filepath.Join(baseDir, baseName+".srt")

	if _, err := os.Stat(srtFile); os.IsNotExist(err) {
		return fmt.Errorf("未找到SRT字幕文件: %s", srtFile)
	}

	tempFile := videoFile + ".temp"

	// 硬编码字幕到视频中
	cmd := exec.Command("ffmpeg",
		"-i", videoFile,
		"-vf", fmt.Sprintf("subtitles=%s", srtFile),
		"-c:a", "copy",
		"-y", tempFile,
	)

	if err := cmd.Run(); err != nil {
		os.Remove(tempFile)
		return fmt.Errorf("硬编码字幕失败: %v", err)
	}

	os.Rename(videoFile, videoFile+".backup")
	os.Rename(tempFile, videoFile)

	log.Printf("字幕已硬编码到视频: %s", videoFile)
	return nil
}

// 使用ffmpeg提取内置字幕
func extractEmbeddedSubtitle(videoFile, outputSrt string) bool {
	cmd := exec.Command("ffmpeg", "-i", videoFile, "-map", "0:s:0", "-c:s", "srt", outputSrt, "-y")
	err := cmd.Run()
	if err != nil {
		log.Printf("ffmpeg提取字幕失败: %v", err)
		return false
	}
	return true
}

// 使用whisper生成字幕
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

// 处理字幕文件获取单词片段
func processSubtitleFile(videoFile, subtitleFile string) []WordClip {
	if subtitleFile == "" {
		return nil
	}

	// 解析字幕文件
	subtitles := parseSubtitleFile(subtitleFile)
	if len(subtitles) == 0 {
		log.Printf("字幕文件解析失败: %s", subtitleFile)
		return nil
	}

	// 提取所有单词
	words := extractWordsFromSubtitles(subtitles)

	// 为每个单词查找时间戳
	var wordClips []WordClip
	baseDir := filepath.Dir(videoFile)
	baseName := strings.TrimSuffix(filepath.Base(videoFile), filepath.Ext(videoFile))

	for _, word := range words {
		startTime, endTime := findWordTimestamp(word, subtitles)
		if startTime != "" && endTime != "" {
			filename := fmt.Sprintf("%s_%s.mp4", baseName, word)

			wordClips = append(wordClips, WordClip{
				Word:      word,
				StartTime: startTime,
				EndTime:   endTime,
				Filename:  filepath.Join(baseDir, filename),
			})
		}
	}

	return wordClips
}

// 解析SRT字幕文件
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

// 从字幕中提取所有单词
func extractWordsFromSubtitles(subtitles []SubtitleEntry) []string {
	wordSet := make(map[string]bool)

	// 匹配单词的正则表达式
	wordRegex := regexp.MustCompile(`\b[a-zA-Z]+\b`)

	for _, subtitle := range subtitles {
		words := wordRegex.FindAllString(subtitle.Text, -1)
		for _, word := range words {
			word = strings.ToLower(word)
			if len(word) > 2 { // 只保留长度大于2的单词
				wordSet[word] = true
			}
		}
	}

	// 转换为切片
	var words []string
	for word := range wordSet {
		words = append(words, word)
	}

	return words
}

// 查找单词在字幕中的时间戳
func findWordTimestamp(word string, subtitles []SubtitleEntry) (string, string) {
	wordRegex := regexp.MustCompile(`\b` + regexp.QuoteMeta(strings.ToLower(word)) + `\b`)

	for _, subtitle := range subtitles {
		if wordRegex.MatchString(strings.ToLower(subtitle.Text)) {
			return subtitle.StartTime, subtitle.EndTime
		}
	}

	return "", ""
}

// 生成视频剪辑并保存到数据库
func generateClipAndSave(client *ent.Client, videoFile string, wordClip WordClip) error {
	// 转换时间格式为ffmpeg支持的格式
	startSeconds := timeToSeconds(wordClip.StartTime)
	endSeconds := timeToSeconds(wordClip.EndTime)

	// 验证剪辑参数
	if err := validateClipParams(startSeconds, endSeconds, wordClip.Word); err != nil {
		return fmt.Errorf("参数验证失败: %v", err)
	}

	// 格式化为ffmpeg期望的格式 (秒数)
	startTime := fmt.Sprintf("%.3f", startSeconds)
	duration := fmt.Sprintf("%.3f", endSeconds-startSeconds)

	log.Printf("剪辑 %s: 开始时间=%.3fs, 时长=%.3fs", wordClip.Word, startSeconds, endSeconds-startSeconds)

	// 使用ffmpeg生成剪辑 (-t 参数比 -to 更可靠)
	cmd := exec.Command("ffmpeg",
		"-i", videoFile,
		"-ss", startTime,
		"-t", duration,
		"-c", "copy",
		"-avoid_negative_ts", "make_zero",
		wordClip.Filename,
		"-y")

	// 捕获错误输出以便调试
	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("ffmpeg剪辑失败: %v, 输出: %s", err, string(output))
	}

	// 获取文件信息
	fileInfo, err := os.Stat(wordClip.Filename)
	if err != nil {
		return fmt.Errorf("获取文件信息失败: %v", err)
	}

	// 保存到数据库
	_, err = client.EntClipMetadata.Create().
		SetFileURL(wordClip.Filename).
		SetFilename(filepath.Base(wordClip.Filename)).
		SetFileSize(int64(fileInfo.Size())).
		SetDuration(int(endSeconds) - int(startSeconds)).
		SetFormat("mp4").
		Save(context.Background())

	if err != nil {
		return fmt.Errorf("保存到数据库失败: %v", err)
	}

	return nil
}

// 生成H.264编码的视频剪辑并保存到数据库
func generateh264ClipAndSave(client *ent.Client, videoFile string, wordClip WordClip) error {
	// 转换时间格式为ffmpeg支持的格式
	startSeconds := timeToSeconds(wordClip.StartTime)
	endSeconds := timeToSeconds(wordClip.EndTime)

	// 验证剪辑参数
	if err := validateClipParams(startSeconds, endSeconds, wordClip.Word); err != nil {
		return fmt.Errorf("参数验证失败: %v", err)
	}

	// 格式化为ffmpeg期望的格式 (秒数)
	startTime := fmt.Sprintf("%.3f", startSeconds)
	duration := fmt.Sprintf("%.3f", endSeconds-startSeconds)

	log.Printf("剪辑 %s (H.264): 开始时间=%.3fs, 时长=%.3fs", wordClip.Word, startSeconds, endSeconds-startSeconds)

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
		wordClip.Filename,
		"-y") // 覆盖已存在文件

	// 捕获错误输出以便调试
	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("ffmpeg H.264剪辑失败: %v, 输出: %s", err, string(output))
	}

	// 获取文件信息
	fileInfo, err := os.Stat(wordClip.Filename)
	if err != nil {
		return fmt.Errorf("获取文件信息失败: %v", err)
	}

	// 保存到数据库
	_, err = client.EntClipMetadata.Create().
		SetFileURL(wordClip.Filename).
		SetFilename(filepath.Base(wordClip.Filename)).
		SetFileSize(int64(fileInfo.Size())).
		SetDuration(int(endSeconds) - int(startSeconds)).
		SetFormat("mp4").
		Save(context.Background())

	if err != nil {
		return fmt.Errorf("保存到数据库失败: %v", err)
	}

	log.Printf("H.264剪辑生成成功: %s, 文件大小: %d bytes", wordClip.Filename, fileInfo.Size())
	return nil
}

// 将时间字符串转换为秒数
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
	log.Printf("时间转换: %s -> %.3f秒", timeStr, totalSeconds)
	return totalSeconds
}

// 验证剪辑参数是否合理
func validateClipParams(startSeconds, endSeconds float64, word string) error {
	if startSeconds < 0 {
		return fmt.Errorf("开始时间不能为负数: %.3f", startSeconds)
	}

	if endSeconds <= startSeconds {
		return fmt.Errorf("结束时间必须大于开始时间: start=%.3f, end=%.3f", startSeconds, endSeconds)
	}

	duration := endSeconds - startSeconds
	if duration > 30 {
		return fmt.Errorf("剪辑时长过长 (%.1f秒), 可能是时间戳错误", duration)
	}

	if duration < 0.1 {
		return fmt.Errorf("剪辑时长过短 (%.3f秒)", duration)
	}

	return nil
}
