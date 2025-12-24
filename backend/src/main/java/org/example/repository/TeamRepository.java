package org.example.repository;

import org.example.model.Team;
import org.example.model.Tournament;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {
    Optional<Team> findByName(String name);
    boolean existsByName(String name);
    @Query("SELECT DISTINCT t FROM Team t " +
            "JOIN t.homeGames hg " +
            "WHERE hg.tournament = :tournament " +
            "OR t IN (SELECT t2 FROM Team t2 JOIN t2.awayGames ag WHERE ag.tournament = :tournament)")
    List<Team> findByTournament(@Param("tournament") Tournament tournament);
}