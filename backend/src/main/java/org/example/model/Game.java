package org.example.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "games")
public class Game implements java.io.Serializable {
    public enum GameStatus {
        SCHEDULED, COMPLETED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "player1_id")
    @ToString.Exclude
    private Player player1;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "player2_id")
    @ToString.Exclude
    private Player player2;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team1_id")
    @ToString.Exclude
    private Team team1;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team2_id")
    @ToString.Exclude
    private Team team2;

    private Integer score1;
    private Integer score2;

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private GameStatus status = GameStatus.SCHEDULED;

    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tournament_id")
    @ToString.Exclude
    private Tournament tournament;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        if (status == GameStatus.COMPLETED && (score1 == null || score2 == null)) {
            throw new IllegalStateException("Cannot complete game without both scores");
        }
    }

    @Transient
    public boolean isDraw() {
        return score1 != null && score1.equals(score2);
    }

    @Transient
    public Player getWinner() {
        if (score1 == null || score2 == null) {
            return null;
        }
        return score1 > score2 ? player1 : player2;
    }
}