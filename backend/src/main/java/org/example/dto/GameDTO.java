package org.example.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class GameDTO {
    private Long id;
    private Long player1Id;
    private Long player2Id;
    private Long team1Id;
    private Long team2Id;
    private Integer score1;
    private Integer score2;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long tournamentId;
}