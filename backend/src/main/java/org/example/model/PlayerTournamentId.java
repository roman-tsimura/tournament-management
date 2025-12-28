package org.example.model;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.Objects;

@Data
public class PlayerTournamentId implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;
    
    private Long player;
    private Long tournament;

    public PlayerTournamentId() {}

    public PlayerTournamentId(Long player, Long tournament) {
        this.player = player;
        this.tournament = tournament;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        PlayerTournamentId that = (PlayerTournamentId) o;
        return Objects.equals(player, that.player) &&
               Objects.equals(tournament, that.tournament);
    }

    @Override
    public int hashCode() {
        return Objects.hash(player, tournament);
    }
}
