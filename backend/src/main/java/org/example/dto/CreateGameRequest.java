package org.example.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateGameRequest {
    @NotNull(message = "Player 1 ID is required")
    private Long player1Id;

    @NotNull(message = "Player 2 ID is required")
    private Long player2Id;

    @NotNull(message = "Team 1 ID is required")
    private Long team1Id;

    @NotNull(message = "Team 2 ID is required")
    private Long team2Id;

    @NotNull(message = "Tournament ID is required")
    private Long tournamentId;

    // Explicit getters to ensure they're available
    public Long getPlayer1Id() {
        return player1Id;
    }

    public Long getPlayer2Id() {
        return player2Id;
    }

    public Long getTeam1Id() {
        return team1Id;
    }

    public Long getTeam2Id() {
        return team2Id;
    }

    public Long getTournamentId() {
        return tournamentId;
    }
}