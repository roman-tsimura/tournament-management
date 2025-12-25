package org.example.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "tournaments")
public class Tournament {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "tournament", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Game> games = new ArrayList<>();

    @OneToMany(mappedBy = "tournament", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PlayerTournament> playerStats = new ArrayList<>();
    
    @Transient
    public Integer getPlayerPoints(Long playerId) {
        return playerStats.stream()
            .filter(ps -> ps.getPlayer().getId().equals(playerId))
            .findFirst()
            .map(PlayerTournament::getPoints)
            .orElse(0);
    }
    
    @Transient
    public void updatePlayerPoints(Player player, int points) {
        playerStats.stream()
            .filter(ps -> ps.getPlayer().equals(player))
            .findFirst()
            .ifPresentOrElse(
                ps -> ps.setPoints(points),
                () -> {
                    PlayerTournament pt = new PlayerTournament();
                    pt.setPlayer(player);
                    pt.setTournament(this);
                    pt.setPoints(points);
                    playerStats.add(pt);
                }
            );
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public void addPlayer(Player player) {
        if (playerStats.stream().noneMatch(ps -> ps.getPlayer().equals(player))) {
            PlayerTournament pt = new PlayerTournament();
            pt.setPlayer(player);
            pt.setTournament(this);
            pt.setPoints(0);
            playerStats.add(pt);
        }
    }

    public void removePlayer(Player player) {
        playerStats.removeIf(ps -> ps.getPlayer().equals(player));
    }

    public void addGame(Game game) {
        games.add(game);
        game.setTournament(this);
    }

    public void removeGame(Game game) {
        games.remove(game);
        game.setTournament(null);
    }
}