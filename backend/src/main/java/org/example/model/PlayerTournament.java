package org.example.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "player_tournament")
public class PlayerTournament {
    @EmbeddedId
    private PlayerTournamentId id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("playerId")
    private Player player;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("tournamentId")
    private Tournament tournament;
    
    @Column(nullable = false, columnDefinition = "integer default 0")
    private Integer points = 0;
}
