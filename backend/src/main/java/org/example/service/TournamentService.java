package org.example.service;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.example.dto.GameScoreUpdateDTO;
import org.example.dto.TournamentStatsDTO;
import org.example.model.Game;
import org.example.model.Player;
import org.example.model.PlayerTournament;
import org.example.model.Tournament;
import org.example.repository.GameRepository;
import org.example.repository.TournamentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class TournamentService {
    private final TournamentRepository tournamentRepository;
    private final GameRepository gameRepository;
    private final GameService gameService;

    @Autowired
    public TournamentService(TournamentRepository tournamentRepository,
                             GameService gameService,
                             GameRepository gameRepository) {
        this.tournamentRepository = tournamentRepository;
        this.gameService = gameService;
        this.gameRepository = gameRepository;
    }

    public List<Tournament> findAll() {
        return tournamentRepository.findAll();
    }

    public List<Game> getTournamentGames(Long tournamentId) {
        return tournamentRepository.findById(tournamentId)
                .map(gameRepository::findByTournament)
                .orElse(Collections.emptyList());
    }

    public Optional<Tournament> findById(Long id) {
        return tournamentRepository.findById(id);
    }

    @Transactional
    public Tournament save(Tournament tournament) {
        return tournamentRepository.save(tournament);
    }

    @Transactional
    public void delete(Long id) {
        tournamentRepository.deleteById(id);
    }

    @Transactional
    public Tournament update(Long id, Tournament tournamentDetails) {
        return tournamentRepository.findById(id).map(tournament -> {
            tournament.setName(tournamentDetails.getName());
            return tournamentRepository.save(tournament);
        }).orElseThrow(() -> new IllegalStateException("Tournament not found with id " + id));
    }

    public boolean existsById(Long id) {
        return tournamentRepository.existsById(id);
    }

    @Transactional
    public Game updateGameScores(Long gameId, @Valid GameScoreUpdateDTO scoreUpdate) {
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new EntityNotFoundException("Game not found with id: " + gameId));

        gameService.updateGameScore(gameId, scoreUpdate.getScore1(), scoreUpdate.getScore2());
        return gameRepository.save(game);
    }

    @Transactional
    public Optional<TournamentStatsDTO> getTournamentStats(Long tournamentId) {
        return tournamentRepository.findById(tournamentId).map(tournament -> {
            TournamentStatsDTO stats = new TournamentStatsDTO();
            stats.setTournamentId(tournamentId);

            List<Game> games = gameRepository.findByTournament(tournament);
            stats.setTotalGames(games.size());

            // Count games with both scores set
            long completedGames = games.stream()
                    .filter(game -> game.getScore1() != null && game.getScore2() != null)
                    .count();
            stats.setCompletedGames((int) completedGames);

            List<PlayerTournament> playerTournaments = tournament.getPlayerStats();
            Map<Long, TournamentStatsDTO.PlayerStats> playerStatsMap = new HashMap<>();

            processGameResults(games, playerStatsMap);
            updatePlayerTournamentStats(playerTournaments, playerStatsMap);
            stats.setPlayerStats(new ArrayList<>(playerStatsMap.values()));
            return stats;
        });
    }

    private void processGameResults(List<Game> games, Map<Long, TournamentStatsDTO.PlayerStats> playerStatsMap) {
        games.stream()
            .filter(game -> game.getScore1() != null && game.getScore2() != null)
            .forEach(game -> {
                updatePlayerStats(playerStatsMap, game.getPlayer1(), game.getScore1(), game.getScore2());
                updatePlayerStats(playerStatsMap, game.getPlayer2(), game.getScore2(), game.getScore1());
            });
    }

    private void updatePlayerTournamentStats(
            List<PlayerTournament> playerTournaments,
            Map<Long, TournamentStatsDTO.PlayerStats> playerStatsMap
    ) {
        for (PlayerTournament pt : playerTournaments) {
            if (pt.getPlayer() != null) {
                TournamentStatsDTO.PlayerStats playerStats = playerStatsMap.computeIfAbsent(
                        pt.getPlayer().getId(),
                        k -> new TournamentStatsDTO.PlayerStats());

                playerStats.setPlayerId(pt.getPlayer().getId());
                playerStats.setPlayerName(pt.getPlayer().getName());
            }
        }
    }

    private void updatePlayerStats(
            Map<Long, TournamentStatsDTO.PlayerStats> playerStatsMap,
            Player player,
            int goalsFor,
            int goalsAgainst
    ) {
        if (player == null) return;

        TournamentStatsDTO.PlayerStats playerStats = playerStatsMap.computeIfAbsent(
                player.getId(),
                k -> {
                    TournamentStatsDTO.PlayerStats ps = new TournamentStatsDTO.PlayerStats();
                    ps.setPlayerId(player.getId());
                    ps.setPlayerName(player.getName());
                    return ps;
                }
        );

        // Update player statistics
        playerStats.setGamesPlayed(playerStats.getGamesPlayed() + 1);
        playerStats.setGoalsFor(playerStats.getGoalsFor() + goalsFor);
        playerStats.setGoalsAgainst(playerStats.getGoalsAgainst() + goalsAgainst);

        if (goalsFor > goalsAgainst) {
            playerStats.setWins(playerStats.getWins() + 1);
        } else if (goalsFor == goalsAgainst) {
            playerStats.setDraws(playerStats.getDraws() + 1);
        } else {
            playerStats.setLosses(playerStats.getLosses() + 1);
        }
    }
}