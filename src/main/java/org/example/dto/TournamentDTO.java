package org.example.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class TournamentDTO {
    private Long id;
    private String name;
    private String description;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String status;
    private Integer maxPlayers;
    private Integer currentRound;
    private Integer totalRounds;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<Long> playerIds;
}