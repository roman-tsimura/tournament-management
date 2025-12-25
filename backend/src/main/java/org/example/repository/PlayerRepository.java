package org.example.repository;

import org.example.model.Player;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlayerRepository extends JpaRepository<Player, Long> {
    Optional<Player> findByName(String name);

    @Query("SELECT p FROM Player p JOIN p.tournamentStats t WHERE t.tournament.id = :tournamentId")
    List<Player> findByTournamentId(@Param("tournamentId") Long tournamentId);
}