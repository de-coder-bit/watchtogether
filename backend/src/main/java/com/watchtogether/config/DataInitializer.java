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

import java.util.List;

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
    public void run(String... args) {
        if (userRepository.count() == 0) {
            log.info("Initializing demo users and videos...");

            // Create User 1: Alex
            User alex = User.builder()
                    .username("Alex")
                    .email("alex@watchtogether.app")
                    .password(passwordEncoder.encode("password123"))
                    .avatarUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80")
                    .role("ROLE_USER")
                    .build();
            alex = userRepository.save(alex);

            // Create User 2: Sam (Paired partner)
            User sam = User.builder()
                    .username("Sam")
                    .email("sam@watchtogether.app")
                    .password(passwordEncoder.encode("password123"))
                    .avatarUrl("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80")
                    .role("ROLE_USER")
                    .partner(alex)
                    .build();
            sam = userRepository.save(sam);

            alex.setPartner(sam);
            userRepository.save(alex);

            log.info("Created paired demo users: alex@watchtogether.app & sam@watchtogether.app (password: password123)");

            // Seed Sample Videos (Creative Commons open source films with public multi-bitrate HLS streams)
            Video v1 = Video.builder()
                    .title("Big Buck Bunny")
                    .description("A large and lovable rabbit deals with bullying forest creatures in this iconic open-source animated short film.")
                    .genres("Animation,Comedy,Short")
                    .durationSeconds(596.0)
                    .originalFilename("big_buck_bunny.mp4")
                    .hlsMasterUrl("https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8")
                    .thumbnailUrl("https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80")
                    .status(VideoStatus.READY)
                    .fileSizeBytes(158000000L)
                    .resolutions("360p,480p,720p,1080p")
                    .uploader(alex)
                    .build();

            Video v2 = Video.builder()
                    .title("Tears of Steel")
                    .description("Set in a dystopian future Amsterdam, a group of warriors and scientists try to save the planet from destructive robotic entities.")
                    .genres("Sci-Fi,Action,VFX")
                    .durationSeconds(734.0)
                    .originalFilename("tears_of_steel.mp4")
                    .hlsMasterUrl("https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8")
                    .thumbnailUrl("https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80")
                    .status(VideoStatus.READY)
                    .fileSizeBytes(240000000L)
                    .resolutions("360p,480p,720p,1080p")
                    .uploader(sam)
                    .build();

            Video v3 = Video.builder()
                    .title("Sintel - The Dragon Quest")
                    .description("A lonely young woman searches for a baby dragon she befriended and nursed back to health after it is snatched by an adult dragon.")
                    .genres("Fantasy,Adventure,Drama")
                    .durationSeconds(888.0)
                    .originalFilename("sintel.mp4")
                    .hlsMasterUrl("https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8")
                    .thumbnailUrl("https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80")
                    .status(VideoStatus.READY)
                    .fileSizeBytes(310000000L)
                    .resolutions("360p,480p,720p,1080p")
                    .uploader(alex)
                    .build();

            Video v4 = Video.builder()
                    .title("Cosmos - Deep Space Odyssey")
                    .description("An ambient cinematic voyage exploring distant nebulae, interstellar gravitational waves, and supermassive black holes.")
                    .genres("Documentary,Sci-Fi,Nature")
                    .durationSeconds(420.0)
                    .originalFilename("cosmos.mp4")
                    .hlsMasterUrl("https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8")
                    .thumbnailUrl("https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80")
                    .status(VideoStatus.READY)
                    .fileSizeBytes(190000000L)
                    .resolutions("360p,480p,720p")
                    .uploader(sam)
                    .build();

            videoRepository.saveAll(List.of(v1, v2, v3, v4));
            log.info("Seeded 4 high-quality sample HLS streaming videos.");
        }
    }
}
