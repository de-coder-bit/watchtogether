package com.watchtogether.config;

import com.watchtogether.model.entity.User;
import com.watchtogether.model.entity.Video;
import com.watchtogether.model.enums.VideoStatus;
import com.watchtogether.repository.UserRepository;
import com.watchtogether.repository.VideoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final VideoRepository videoRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, VideoRepository videoRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.videoRepository = videoRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() == 0) {
            log.info("Seeding initial demo users and video library...");

            // Create Demo User 1 (Alex)
            User alex = User.builder()
                    .email("alex@watchtogether.io")
                    .username("Alex Vance")
                    .password(passwordEncoder.encode("password123"))
                    .avatarUrl("https://api.dicebear.com/7.x/bottts/svg?seed=Alex")
                    .role("ROLE_USER")
                    .build();
            alex = userRepository.save(alex);

            // Create Demo User 2 (Sam)
            User sam = User.builder()
                    .email("sam@watchtogether.io")
                    .username("Sam Rivera")
                    .password(passwordEncoder.encode("password123"))
                    .avatarUrl("https://api.dicebear.com/7.x/bottts/svg?seed=Sam")
                    .role("ROLE_USER")
                    .build();
            sam = userRepository.save(sam);

            // Pair Alex and Sam as partners by default
            alex.setPartner(sam);
            sam.setPartner(alex);
            userRepository.save(alex);
            userRepository.save(sam);

            log.info("Initialized default paired partner accounts: alex@watchtogether.io & sam@watchtogether.io (password: password123)");

            // Seed Sample Videos
            Video v1 = Video.builder()
                    .title("Big Buck Bunny - Cinema Edition")
                    .description("A large, lovable rabbit deals with bullying forest creatures in this gorgeous open-source animated comedy.")
                    .genres("Animation, Comedy, Adventure")
                    .durationSeconds(596.0)
                    .originalFilename("big_buck_bunny.mp4")
                    .hlsMasterUrl("https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8")
                    .thumbnailUrl("https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80")
                    .status(VideoStatus.READY)
                    .fileSizeBytes(158000000L)
                    .resolutions("360p, 480p, 720p, 1080p")
                    .uploader(alex)
                    .build();

            Video v2 = Video.builder()
                    .title("Tears of Steel - Cyberpunk Sci-Fi")
                    .description("Set in a dystopian future Amsterdam, a group of scientists attempt to stage a crucial memory to save planet Earth.")
                    .genres("Sci-Fi, Cyberpunk, Action")
                    .durationSeconds(734.0)
                    .originalFilename("tears_of_steel.mp4")
                    .hlsMasterUrl("https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8")
                    .thumbnailUrl("https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80")
                    .status(VideoStatus.READY)
                    .fileSizeBytes(240000000L)
                    .resolutions("360p, 480p, 720p, 1080p")
                    .uploader(sam)
                    .build();

            Video v3 = Video.builder()
                    .title("Sintel - The Dragon's Bond")
                    .description("A lonely young girl named Sintel discovers a wounded baby dragon, nursing it back to health in a treacherous fantasy world.")
                    .genres("Fantasy, Animation, Drama")
                    .durationSeconds(888.0)
                    .originalFilename("sintel.mp4")
                    .hlsMasterUrl("https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8")
                    .thumbnailUrl("https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80")
                    .status(VideoStatus.READY)
                    .fileSizeBytes(195000000L)
                    .resolutions("360p, 480p, 720p")
                    .uploader(alex)
                    .build();

            Video v4 = Video.builder()
                    .title("Cosmic Odyssey: Journey Through the Stars")
                    .description("An immersive visual exploration of distant galaxies, glowing nebulae, and the mysterious origins of the cosmos.")
                    .genres("Documentary, Space, Nature")
                    .durationSeconds(650.0)
                    .originalFilename("cosmic_odyssey.mp4")
                    .hlsMasterUrl("https://test-streams.mux.dev/test_001/stream.m3u8")
                    .thumbnailUrl("https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80")
                    .status(VideoStatus.READY)
                    .fileSizeBytes(310000000L)
                    .resolutions("360p, 480p, 720p, 1080p")
                    .uploader(sam)
                    .build();

            videoRepository.save(v1);
            videoRepository.save(v2);
            videoRepository.save(v3);
            videoRepository.save(v4);

            log.info("Initialized 4 sample streaming catalog titles with working adaptive HLS playback!");
        }
    }
}
