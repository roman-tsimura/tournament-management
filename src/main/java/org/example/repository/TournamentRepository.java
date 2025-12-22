package org.example.repository;

import org.example.model.Tournament;
import org.example.model.Tournament.TournamentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TournamentRepository extends JpaRepository<Tournament, Long> {
    List<Tournament> findByStatus(TournamentStatus status);

    @Query("SELECT t FROM Tournament t WHERE t.startDate <= :date AND t.endDate >= :date")
    List<Tournament> findActiveTournaments(@Param("date") LocalDateTime date);

    @Query("SELECT t FROM Tournament t JOIN t.players p WHERE p.id = :playerId")
    List<Tournament> findByPlayerId(@Param("playerId") Long playerId);
}