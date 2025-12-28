package org.example.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TournamentDTO {
    private Long id;
    private String name;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}