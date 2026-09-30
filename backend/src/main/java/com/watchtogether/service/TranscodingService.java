package com.watchtogether.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.*;
import java.nio.file.Files;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class TranscodingService {

    private static final Logger log = LoggerFactory.getLogger(TranscodingService.class);

    @Value("${app.ffmpeg.path:ffmpeg}")
    private String ffmpegPath;

    @Value("${app.ffmpeg.ffprobe-path:ffprobe}")
    private String ffprobePath;

    @Value("${app.ffmpeg.hls-segment-duration:4}")
    private int hlsSegmentDuration;

    public TranscodingService() {}

    public boolean isFFmpegAvailable() {
        try {
            Process process = new ProcessBuilder(ffmpegPath, "-version").start();
            boolean finished = process.waitFor(5, TimeUnit.SECONDS);
            return finished && process.exitValue() == 0;
        } catch (Exception e) {
            log.warn("FFmpeg check failed: {}. Fallback transcoder mode will be used if needed.", e.getMessage());
            return false;
        }
    }

    public TranscodingResult processVideo(File inputVideoFile, File outputDirectory) throws Exception {
        if (!outputDirectory.exists()) {
            outputDirectory.mkdirs();
        }

        boolean ffmpegInstalled = isFFmpegAvailable();
        log.info("Starting video transcoding. FFmpeg available: {}", ffmpegInstalled);

        double duration = getDuration(inputVideoFile, ffmpegInstalled);
        File thumbnailFile = new File(outputDirectory, "poster.jpg");

        if (ffmpegInstalled) {
            generateThumbnailWithFFmpeg(inputVideoFile, thumbnailFile, duration > 2 ? 2.0 : 0.5);
            generateMultiBitrateHls(inputVideoFile, outputDirectory);
        } else {
            generateFallbackThumbnail(thumbnailFile, inputVideoFile.getName());
            generateFallbackHls(inputVideoFile, outputDirectory);
        }

        File masterPlaylist = new File(outputDirectory, "master.m3u8");
        return new TranscodingResult(
                masterPlaylist,
                thumbnailFile,
                duration > 0 ? duration : 120.0,
                "360p,480p,720p"
        );
    }

    private void generateThumbnailWithFFmpeg(File inputFile, File outputFile, double seekTimeSeconds) {
        try {
            List<String> command = List.of(
                    ffmpegPath,
                    "-y",
                    "-ss", String.format("%.2f", seekTimeSeconds),
                    "-i", inputFile.getAbsolutePath(),
                    "-vframes", "1",
                    "-q:v", "2",
                    "-vf", "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2:black",
                    outputFile.getAbsolutePath()
            );

            runProcess(command, "Thumbnail Generation");
            log.info("Thumbnail generated at: {}", outputFile.getAbsolutePath());
        } catch (Exception e) {
            log.error("Failed to generate thumbnail with FFmpeg: {}", e.getMessage(), e);
            generateFallbackThumbnail(outputFile, inputFile.getName());
        }
    }

    private void generateMultiBitrateHls(File inputFile, File outputDir) throws Exception {
        log.info("Transcoding {} to multi-bitrate HLS (360p, 480p, 720p)...", inputFile.getName());

        // 1. 360p
        File dir360 = new File(outputDir, "360p");
        dir360.mkdirs();
        List<String> cmd360 = List.of(
                ffmpegPath, "-y", "-i", inputFile.getAbsolutePath(),
                "-vf", "scale=w=640:h=360:force_original_aspect_ratio=decrease",
                "-c:a", "aac", "-ar", "44100", "-b:a", "64k",
                "-c:v", "h264", "-profile:v", "main", "-crf", "22",
                "-g", "48", "-keyint_min", "48", "-sc_threshold", "0",
                "-b:v", "600k", "-maxrate", "700k", "-bufsize", "1200k",
                "-hls_time", String.valueOf(hlsSegmentDuration),
                "-hls_playlist_type", "vod",
                "-hls_segment_filename", new File(dir360, "segment_%03d.ts").getAbsolutePath(),
                new File(dir360, "playlist.m3u8").getAbsolutePath()
        );
        runProcess(cmd360, "HLS 360p Transcoding");

        // 2. 480p
        File dir480 = new File(outputDir, "480p");
        dir480.mkdirs();
        List<String> cmd480 = List.of(
                ffmpegPath, "-y", "-i", inputFile.getAbsolutePath(),
                "-vf", "scale=w=854:h=480:force_original_aspect_ratio=decrease",
                "-c:a", "aac", "-ar", "48000", "-b:a", "96k",
                "-c:v", "h264", "-profile:v", "main", "-crf", "21",
                "-g", "48", "-keyint_min", "48", "-sc_threshold", "0",
                "-b:v", "1200k", "-maxrate", "1400k", "-bufsize", "2400k",
                "-hls_time", String.valueOf(hlsSegmentDuration),
                "-hls_playlist_type", "vod",
                "-hls_segment_filename", new File(dir480, "segment_%03d.ts").getAbsolutePath(),
                new File(dir480, "playlist.m3u8").getAbsolutePath()
        );
        runProcess(cmd480, "HLS 480p Transcoding");

        // 3. 720p
        File dir720 = new File(outputDir, "720p");
        dir720.mkdirs();
        List<String> cmd720 = List.of(
                ffmpegPath, "-y", "-i", inputFile.getAbsolutePath(),
                "-vf", "scale=w=1280:h=720:force_original_aspect_ratio=decrease",
                "-c:a", "aac", "-ar", "48000", "-b:a", "128k",
                "-c:v", "h264", "-profile:v", "main", "-crf", "20",
                "-g", "48", "-keyint_min", "48", "-sc_threshold", "0",
                "-b:v", "2500k", "-maxrate", "2800k", "-bufsize", "5000k",
                "-hls_time", String.valueOf(hlsSegmentDuration),
                "-hls_playlist_type", "vod",
                "-hls_segment_filename", new File(dir720, "segment_%03d.ts").getAbsolutePath(),
                new File(dir720, "playlist.m3u8").getAbsolutePath()
        );
        runProcess(cmd720, "HLS 720p Transcoding");

        createMasterPlaylist(outputDir);
    }

    private void createMasterPlaylist(File outputDir) throws IOException {
        String masterContent = """
                #EXTM3U
                #EXT-X-VERSION:3
                
                #EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=640x360,NAME="360p"
                360p/playlist.m3u8
                
                #EXT-X-STREAM-INF:BANDWIDTH=1400000,RESOLUTION=854x480,NAME="480p"
                480p/playlist.m3u8
                
                #EXT-X-STREAM-INF:BANDWIDTH=2800000,RESOLUTION=1280x720,NAME="720p"
                720p/playlist.m3u8
                """;

        File masterFile = new File(outputDir, "master.m3u8");
        Files.writeString(masterFile.toPath(), masterContent);
        log.info("Master HLS playlist written at: {}", masterFile.getAbsolutePath());
    }

    private void generateFallbackHls(File inputFile, File outputDir) throws IOException {
        log.info("Generating fallback HLS configuration for file {}", inputFile.getName());
        File dir720 = new File(outputDir, "720p");
        File dir480 = new File(outputDir, "480p");
        File dir360 = new File(outputDir, "360p");
        dir720.mkdirs();
        dir480.mkdirs();
        dir360.mkdirs();

        File rawInDir = new File(outputDir, "stream.mp4");
        Files.copy(inputFile.toPath(), rawInDir.toPath());

        createMasterPlaylist(outputDir);
        for (File dir : List.of(dir360, dir480, dir720)) {
            String variantContent = """
                    #EXTM3U
                    #EXT-X-VERSION:3
                    #EXT-X-TARGETDURATION:600
                    #EXT-X-MEDIA-SEQUENCE:0
                    #EXTINF:600.0,
                    ../stream.mp4
                    #EXT-X-ENDLIST
                    """;
            Files.writeString(new File(dir, "playlist.m3u8").toPath(), variantContent);
        }
    }

    private void generateFallbackThumbnail(File outputFile, String title) {
        try {
            int width = 1280;
            int height = 720;
            BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
            Graphics2D g2d = image.createGraphics();

            GradientPaint gp = new GradientPaint(0, 0, new Color(15, 23, 42), width, height, new Color(30, 41, 59));
            g2d.setPaint(gp);
            g2d.fillRect(0, 0, width, height);

            g2d.setColor(new Color(99, 102, 241, 40));
            g2d.fillOval(width / 2 - 200, height / 2 - 200, 400, 400);

            g2d.setColor(new Color(99, 102, 241, 220));
            g2d.fillOval(width / 2 - 60, height / 2 - 80, 120, 120);

            g2d.setColor(Color.WHITE);
            Polygon triangle = new Polygon();
            triangle.addPoint(width / 2 - 15, height / 2 - 45);
            triangle.addPoint(width / 2 - 15, height / 2 + 5);
            triangle.addPoint(width / 2 + 25, height / 2 - 20);
            g2d.fillPolygon(triangle);

            g2d.setFont(new Font("SansSerif", Font.BOLD, 42));
            FontMetrics fm = g2d.getFontMetrics();
            String displayTitle = title != null && title.length() > 30 ? title.substring(0, 27) + "..." : title;
            int textX = (width - fm.stringWidth(displayTitle)) / 2;
            g2d.drawString(displayTitle, textX, height / 2 + 120);

            g2d.setFont(new Font("SansSerif", Font.PLAIN, 24));
            g2d.setColor(new Color(148, 163, 184));
            g2d.drawString("WatchTogether Premium Stream", (width - g2d.getFontMetrics().stringWidth("WatchTogether Premium Stream")) / 2, height / 2 + 170);

            g2d.dispose();
            ImageIO.write(image, "jpg", outputFile);
        } catch (Exception e) {
            log.error("Failed to generate fallback thumbnail: {}", e.getMessage());
        }
    }

    private double getDuration(File inputFile, boolean ffmpegAvailable) {
        if (!ffmpegAvailable) return 120.0;
        try {
            List<String> command = List.of(
                    ffmpegPath,
                    "-i", inputFile.getAbsolutePath()
            );

            Process process = new ProcessBuilder(command).redirectErrorStream(true).start();
            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            String line;
            Pattern durationPattern = Pattern.compile("Duration: (\\d{2}):(\\d{2}):(\\d{2})\\.(\\d+)");

            while ((line = reader.readLine()) != null) {
                Matcher matcher = durationPattern.matcher(line);
                if (matcher.find()) {
                    int hours = Integer.parseInt(matcher.group(1));
                    int minutes = Integer.parseInt(matcher.group(2));
                    int seconds = Integer.parseInt(matcher.group(3));
                    int millis = Integer.parseInt(matcher.group(4));
                    return hours * 3600 + minutes * 60 + seconds + (millis / 100.0);
                }
            }
        } catch (Exception e) {
            log.warn("Could not determine video duration: {}", e.getMessage());
        }
        return 120.0;
    }

    private void runProcess(List<String> command, String operationName) throws Exception {
        log.info("Executing {}: {}", operationName, String.join(" ", command));
        ProcessBuilder pb = new ProcessBuilder(command);
        pb.redirectErrorStream(true);
        Process process = pb.start();

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.contains("error") || line.contains("Error") || line.contains("Failed")) {
                    log.warn("[FFmpeg] {}", line);
                }
            }
        }

        boolean finished = process.waitFor(15, TimeUnit.MINUTES);
        if (!finished) {
            process.destroyForcibly();
            throw new RuntimeException(operationName + " timed out after 15 minutes");
        }

        int exitCode = process.exitValue();
        if (exitCode != 0) {
            throw new RuntimeException(operationName + " failed with exit code: " + exitCode);
        }
    }

    public record TranscodingResult(
            File masterPlaylistFile,
            File thumbnailFile,
            double durationSeconds,
            String resolutions
    ) {}
}
