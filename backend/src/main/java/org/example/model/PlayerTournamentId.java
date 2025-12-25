package org.example.model;

import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class PlayerTournamentId implements Serializable {
    private Long playerId;
    private Long tournamentId;

    public PlayerTournamentId() {
    }

    public PlayerTournamentId(Long playerId, Long tournamentId) {
        this.playerId = playerId;
        this.tournamentId = tournamentId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        PlayerTournamentId that = (PlayerTournamentId) o;
        return Objects.equals(playerId, that.playerId) &&
               Objects.equals(tournamentId, that.tournamentId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(playerId, tournamentId);
    }
}
