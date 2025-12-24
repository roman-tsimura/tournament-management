package org.example.service;

import jakarta.transaction.Transactional;
import org.example.dto.TournamentStatsDTO;
import org.example.model.Game;
import org.example.model.Player;
import org.example.model.Team;
import org.example.model.Tournament;
import org.example.model.Tournament.TournamentStatus;
import org.example.repository.GameRepository;
import org.example.repository.PlayerRepository;
import org.example.repository.TeamRepository;
import org.example.repository.TournamentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TournamentService {
    private final TournamentRepository tournamentRepository;
    private final PlayerRepository playerRepository;
    private final TeamRepository teamRepository;
    private final GameRepository gameRepository;
    private final GameService gameService;

    @Autowired
    public TournamentService(TournamentRepository tournamentRepository,
                             PlayerRepository playerRepository,
                             TeamRepository teamRepository,
                             GameService gameService,
                             GameRepository gameRepository) {
        this.tournamentRepository = tournamentRepository;
        this.playerRepository = playerRepository;
        this.teamRepository = teamRepository;
        this.gameService = gameService;
        this.gameRepository = gameRepository;
    }

    public List<Tournament> findAll() {
        return tournamentRepository.findAll();
    }

    public Optional<Tournament> findById(Long id) {
        return tournamentRepository.findById(id);
    }

    @Transactional
    public Tournament save(Tournament tournament) {
        if (tournament.getStatus() == null) {
            tournament.setStatus(TournamentStatus.UPCOMING);
        }
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
            tournament.setDescription(tournamentDetails.getDescription());
            tournament.setStartDate(tournamentDetails.getStartDate());
            tournament.setEndDate(tournamentDetails.getEndDate());
            tournament.setStatus(tournamentDetails.getStatus());
            tournament.setMaxPlayers(tournamentDetails.getMaxPlayers());
            tournament.setCurrentRound(tournamentDetails.getCurrentRound());
            tournament.setTotalRounds(tournamentDetails.getTotalRounds());
            return tournamentRepository.save(tournament);
        }).orElseThrow(() -> new IllegalStateException("Tournament not found with id " + id));
    }

    public boolean existsById(Long id) {
        return tournamentRepository.existsById(id);
    }


    @Transactional
    public Optional<Tournament> startTournament(Long id) {
        return tournamentRepository.findById(id).map(tournament -> {
            if (tournament.getStatus() != TournamentStatus.UPCOMING) {
                throw new IllegalStateException("Tournament is not in UPCOMING status");
            }

            // Additional logic to start the tournament (e.g., create initial matches)
            tournament.setStatus(TournamentStatus.IN_PROGRESS);
            tournament.setCurrentRound(1);
            tournament.setStartDate(LocalDateTime.now());

            return tournamentRepository.save(tournament);
        });
    }

    @Transactional
    public Optional<Tournament> completeTournament(Long id) {
        return tournamentRepository.findById(id).map(tournament -> {
            tournament.setStatus(TournamentStatus.COMPLETED);
            tournament.setEndDate(LocalDateTime.now());
            return tournamentRepository.save(tournament);
        });
    }

    @Transactional
    public Optional<Tournament> startNextRound(Long id) {
        return tournamentRepository.findById(id).map(tournament -> {
            if (tournament.getStatus() != TournamentStatus.IN_PROGRESS) {
                throw new IllegalStateException("Tournament is not in progress");
            }

            if (tournament.getCurrentRound() >= tournament.getTotalRounds()) {
                throw new IllegalStateException("Tournament has reached the maximum number of rounds");
            }

            tournament.setCurrentRound(tournament.getCurrentRound() + 1);
            
            // Additional logic to create matches for the next round
            
            return tournamentRepository.save(tournament);
        });
    }

    @Transactional
    public Game createGameForTournament(Long tournamentId, Game game,
                                        Long player1Id, Long player2Id,
                                        Long team1Id, Long team2Id) {
        return gameService.createGame(game, player1Id, player2Id, team1Id, team2Id, tournamentId);
    }

    public List<Player> getTournamentPlayers(Long tournamentId) {
        return playerRepository.findByTournamentId(tournamentId);
    }

    @Transactional
    public Optional<TournamentStatsDTO> getTournamentStats(Long tournamentId) {
        return tournamentRepository.findById(tournamentId).map(tournament -> {
            TournamentStatsDTO stats = new TournamentStatsDTO();
            stats.setTournamentId(tournamentId);

            List<Game> games = gameRepository.findByTournament(tournament);
            List<Team> teams = teamRepository.findByTournament(tournament);

            // Calculate basic stats
            int totalGames = games.size();
            int completedGames = (int) games.stream()
                    .filter(g -> g.getStatus() == Game.GameStatus.COMPLETED)
                    .count();

            stats.setTotalGames(totalGames);
            stats.setCompletedGames(completedGames);

            // Calculate team stats
            Map<Long, TournamentStatsDTO.TeamStats> teamStatsMap = new HashMap<>();

            // Initialize team stats
            for (Team team : teams) {
                TournamentStatsDTO.TeamStats teamStats = new TournamentStatsDTO.TeamStats();
                teamStats.setTeamName(team.getName());
                teamStatsMap.put(team.getId(), teamStats);
            }

            // Process games to calculate team statistics
            for (Game game : games) {
                if (game.getStatus() == Game.GameStatus.COMPLETED &&
                        game.getTeam1() != null && game.getTeam2() != null) {

                    TournamentStatsDTO.TeamStats homeStats = teamStatsMap.get(game.getTeam1().getId());
                    TournamentStatsDTO.TeamStats awayStats = teamStatsMap.get(game.getTeam2().getId());

                    if (homeStats != null && awayStats != null) {
                        // Update games played
                        homeStats.setGamesPlayed(homeStats.getGamesPlayed() + 1);
                        awayStats.setGamesPlayed(awayStats.getGamesPlayed() + 1);

                        // Update goals
                        homeStats.setGoalsFor(homeStats.getGoalsFor() + (game.getScore1() != null ? game.getScore1() : 0));
                        homeStats.setGoalsAgainst(homeStats.getGoalsAgainst() + (game.getScore2() != null ? game.getScore2() : 0));

                        awayStats.setGoalsFor(awayStats.getGoalsFor() + (game.getScore2() != null ? game.getScore2() : 0));
                        awayStats.setGoalsAgainst(awayStats.getGoalsAgainst() + (game.getScore1() != null ? game.getScore1() : 0));

                        // Update wins, draws, losses
                        if (game.getScore1() > game.getScore2()) {
                            homeStats.setWins(homeStats.getWins() + 1);
                            awayStats.setLosses(awayStats.getLosses() + 1);
                            homeStats.setPoints(homeStats.getPoints() + 3);
                        } else if (game.getScore1() < game.getScore2()) {
                            homeStats.setLosses(homeStats.getLosses() + 1);
                            awayStats.setWins(awayStats.getWins() + 1);
                            awayStats.setPoints(awayStats.getPoints() + 3);
                        } else {
                            homeStats.setDraws(homeStats.getDraws() + 1);
                            awayStats.setDraws(awayStats.getDraws() + 1);
                            homeStats.setPoints(homeStats.getPoints() + 1);
                            awayStats.setPoints(awayStats.getPoints() + 1);
                        }
                    }
                }
            }

            stats.setTeamStats(teamStatsMap);

            // Get recent games (last 5 completed games)
            List<TournamentStatsDTO.GameStats> recentGames = games.stream()
                    .filter(g -> g.getStatus() == Game.GameStatus.COMPLETED)
                    .sorted(Comparator.comparing(Game::getGameDate, Comparator.nullsLast(Comparator.reverseOrder())))
                    .limit(5)
                    .map(game -> {
                        TournamentStatsDTO.GameStats gameStats = new TournamentStatsDTO.GameStats();
                        gameStats.setGameId(game.getId());
                        if (game.getTeam1() != null) gameStats.setHomeTeamName(game.getTeam1().getName());
                        if (game.getTeam2() != null) gameStats.setAwayTeamName(game.getTeam2().getName());
                        gameStats.setHomeScore(game.getScore1());
                        gameStats.setAwayScore(game.getScore2());
                        gameStats.setStatus(game.getStatus().toString());
                        return gameStats;
                    })
                    .collect(Collectors.toList());

            stats.setRecentGames(recentGames);

            return stats;
        });
    }
}