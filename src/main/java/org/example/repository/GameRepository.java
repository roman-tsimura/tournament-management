package org.example.repository;

import org.example.model.Game;
import org.example.model.Tournament;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface GameRepository extends JpaRepository<Game, Long> {
    List<Game> findByTournament(Tournament tournament);

    @Query("SELECT g FROM Game g WHERE g.tournament.id = :tournamentId AND (g.player1.id = :playerId OR g.player2.id = :playerId)")
    List<Game> findByTournamentIdAndPlayerId(@Param("tournamentId") Long tournamentId, @Param("playerId") Long playerId);

    List<Game> findByGameDateBetween(LocalDateTime start, LocalDateTime end);
}