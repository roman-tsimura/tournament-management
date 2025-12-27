package org.example.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Entity
@Table(name = "player_tournament")
@IdClass(PlayerTournamentId.class)
public class PlayerTournament {
    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "player_id")
    @EqualsAndHashCode.Exclude
    private Player player;
    
    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tournament_id")
    @EqualsAndHashCode.Exclude
    private Tournament tournament;
    
    @Column(nullable = false, columnDefinition = "integer default 0")
    private Integer points = 0;
    
    public PlayerTournamentId getId() {
        if (player == null || tournament == null) {
            return null;
        }
        return new PlayerTournamentId(player.getId(), tournament.getId());
    }
    
    public void setId(PlayerTournamentId id) {
        if (id != null) {
            if (player == null) {
                player = new Player();
            }
            player.setId(id.getPlayer());
            
            if (tournament == null) {
                tournament = new Tournament();
            }
            tournament.setId(id.getTournament());
        }
    }
}
