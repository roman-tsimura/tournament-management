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

        if (game.getStatus() == Game.GameStatus.COMPLETED) {
            updatePlayerPoints(game);
        }

        return gameRepository.save(game);
    }

    private void updatePlayerPoints(Game game) {
        if (game == null || game.getTournament() == null) {
            throw new IllegalArgumentException("Game or tournament cannot be null");
        }
        Tournament tournament = game.getTournament();
        if (game.isDraw()) {
            handleDraw(tournament, game.getPlayer1(), game.getPlayer2());
        } else {
            handleWin(tournament, game.getWinner());
        }
        tournamentRepository.save(tournament);
    }

    private void handleDraw(Tournament tournament, Player player1, Player player2) {
        int player1Points = tournament.getPlayerPoints(player1.getId()) + 1;
        int player2Points = tournament.getPlayerPoints(player2.getId()) + 1;

        tournament.updatePlayerPoints(player1, player1Points);
        tournament.updatePlayerPoints(player2, player2Points);
    }

    private void handleWin(Tournament tournament, Player winner) {
        tournament.updatePlayerPoints(winner, tournament.getPlayerPoints(winner.getId()) + 3);
    }

    @Transactional
    public Optional<TournamentStatsDTO> getTournamentStats(Long tournamentId) {
        return tournamentRepository.findById(tournamentId).map(tournament -> {
            TournamentStatsDTO stats = new TournamentStatsDTO();
            stats.setTournamentId(tournamentId);

            // Get all games for the tournament
            List<Game> games = gameRepository.findByTournament(tournament);
            stats.setTotalGames(games.size());

            // Count completed games
            long completedGames = games.stream()
                    .filter(game -> game.getStatus() == Game.GameStatus.COMPLETED)
                    .count();
            stats.setCompletedGames((int) completedGames);

            // Get all player statistics for the tournament
            List<PlayerTournament> playerTournaments = tournament.getPlayerStats();

            // Calculate player statistics
            Map<Long, TournamentStatsDTO.PlayerStats> playerStatsMap = new HashMap<>();

            // Process completed games for player stats
            for (Game game : games) {
                if (game.getStatus() == Game.GameStatus.COMPLETED) {
                    // Update player stats
                    if (game.getPlayer1() != null) {
                        updatePlayerStats(playerStatsMap, game.getPlayer1(),
                                game.getScore1(), game.getScore2());
                    }
                    if (game.getPlayer2() != null) {
                        updatePlayerStats(playerStatsMap, game.getPlayer2(),
                                game.getScore2(), game.getScore1());
                    }
                }
            }

            // Set player points from PlayerTournament relationship
            for (PlayerTournament pt : playerTournaments) {
                if (pt.getPlayer() != null) {
                    TournamentStatsDTO.PlayerStats playerStats = playerStatsMap.computeIfAbsent(
                            pt.getPlayer().getId(),
                            k -> new TournamentStatsDTO.PlayerStats()
                    );
                    playerStats.setPlayerId(pt.getPlayer().getId());
                    playerStats.setPlayerName(pt.getPlayer().getName());
                    playerStats.setPoints(pt.getPoints());
                }
            }

            stats.setPlayerStats(new ArrayList<>(playerStatsMap.values()));

            return stats;
        });
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