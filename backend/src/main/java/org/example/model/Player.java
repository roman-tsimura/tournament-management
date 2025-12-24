package org.example.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Represents a player in the tournament system.
 */
@Data
@Entity
@Table(name = "players")
public class Player {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "player1", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Game> gamesAsPlayer1 = new ArrayList<>();
    
    @OneToMany(mappedBy = "player2", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Game> gamesAsPlayer2 = new ArrayList<>();
    
    @ManyToMany(mappedBy = "players")
    private List<Tournament> tournaments = new ArrayList<>();
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    /**
     * Adds this player to a tournament.
     * @param tournament The tournament to add the player to
     */
    public void addTournament(Tournament tournament) {
        if (!tournaments.contains(tournament)) {
            tournaments.add(tournament);
            tournament.getPlayers().add(this);
        }
    }
    
    /**
     * Removes this player from a tournament.
     * @param tournament The tournament to remove the player from
     */
    public void removeTournament(Tournament tournament) {
        if (tournaments.remove(tournament)) {
            tournament.getPlayers().remove(this);
        }
    }
    
    /**
     * Gets all games where this player participated.
     * @return List of all games for this player
     */
    @Transient
    public List<Game> getAllGames() {
        List<Game> allGames = new ArrayList<>();
        allGames.addAll(gamesAsPlayer1);
        allGames.addAll(gamesAsPlayer2);
        return allGames;
    }
}
