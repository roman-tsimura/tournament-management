package org.example.service;

import jakarta.transaction.Transactional;
import org.example.exception.ResourceNotFoundException;
import org.example.model.Game;
import org.example.model.Player;
import org.example.model.Team;
import org.example.model.Tournament;
import org.example.repository.GameRepository;
import org.example.repository.PlayerRepository;
import org.example.repository.TeamRepository;
import org.example.repository.TournamentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class GameService {
    private final GameRepository gameRepository;
    private final PlayerRepository playerRepository;
    private final TeamRepository teamRepository;
    private final TournamentRepository tournamentRepository;

    @Autowired
    public GameService(GameRepository gameRepository,
                       PlayerRepository playerRepository,
                       TeamRepository teamRepository,
                       TournamentRepository tournamentRepository) {
        this.gameRepository = gameRepository;
        this.playerRepository = playerRepository;
        this.teamRepository = teamRepository;
        this.tournamentRepository = tournamentRepository;
    }

    public List<Game> findAll() {
        return gameRepository.findAll();
    }

    public Optional<Game> findById(Long id) {
        return gameRepository.findById(id);
    }

    @Transactional
    public Game createGame(Game game, Long player1Id, Long player2Id,
                           Long team1Id, Long team2Id, Long tournamentId) {

        Player player1 = playerRepository.findById(player1Id)
                .orElseThrow(() -> new RuntimeException("Player 1 not found"));
        Player player2 = playerRepository.findById(player2Id)
                .orElseThrow(() -> new RuntimeException("Player 2 not found"));

        Team team1 = teamRepository.findById(team1Id)
                .orElseThrow(() -> new RuntimeException("Team 1 not found"));
        Team team2 = teamRepository.findById(team2Id)
                .orElseThrow(() -> new RuntimeException("Team 2 not found"));

        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new RuntimeException("Tournament not found"));

        game.setPlayer1(player1);
        game.setPlayer2(player2);
        game.setTeam1(team1);
        game.setTeam2(team2);
        game.setTournament(tournament);

        return gameRepository.save(game);
    }

    @Transactional
    public Game updateGameScore(Long gameId, Integer score1, Integer score2) {
        return gameRepository.findById(gameId).map(game -> {
            game.setScore1(score1);
            game.setScore2(score2);
            game.setStatus(Game.GameStatus.COMPLETED);
            return gameRepository.save(game);
        }).orElseThrow(() -> new RuntimeException("Game not found with id: " + gameId));
    }

    @Transactional
    public List<Game> findGamesByTournamentId(Long tournamentId) {
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new ResourceNotFoundException("Tournament not found with id: " + tournamentId));
        return gameRepository.findByTournament(tournament);
    }

    public List<Game> findUpcomingGames() {
        return gameRepository.findByGameDateBetween(
                LocalDateTime.now(),
                LocalDateTime.now().plusDays(7)
        );
    }
}