package org.example.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class TournamentDTO {
    private Long id;
    private String name;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}