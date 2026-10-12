package com.watchtogether;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class WatchTogetherApplication {

    public static void main(String[] args) {
        SpringApplication.run(WatchTogetherApplication.class, args);
    }
}
