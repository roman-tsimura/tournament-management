package org.example.dto;

import lombok.Data;

import java.util.List;

@Data
public class TournamentStatsDTO {
    private Long tournamentId;
    private int totalGames;
    private int completedGames;
    private List<PlayerStats> playerStats;

    @Data
    public static class PlayerStats {
        private Long playerId;
        private String playerName;
        private int gamesPlayed;
        private int wins;
        private int draws;
        private int losses;
        private int goalsFor;
        private int goalsAgainst;
    }
}
