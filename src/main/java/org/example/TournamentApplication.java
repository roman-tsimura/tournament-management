package org.example;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EntityScan("org.example.model")
@EnableJpaRepositories("org.example.repository")
public class TournamentApplication {
    public static void main(String[] args) {
        SpringApplication.run(TournamentApplication.class, args);
    }
}