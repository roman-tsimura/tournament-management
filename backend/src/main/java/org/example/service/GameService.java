package org.example.service;

import jakarta.transaction.Transactional;
import org.example.dto.CreateGameRequest;
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

    @Transactional
    public Game createGame(CreateGameRequest request) {
        Game game = new Game();
        
        Player player1 = playerRepository.findById(request.getPlayer1Id())
                .orElseThrow(() -> new RuntimeException("Player 1 not found"));
        Player player2 = playerRepository.findById(request.getPlayer2Id())
                .orElseThrow(() -> new RuntimeException("Player 2 not found"));

        Team team1 = teamRepository.findById(request.getTeam1Id())
                .orElseThrow(() -> new RuntimeException("Team 1 not found"));
        Team team2 = teamRepository.findById(request.getTeam2Id())
                .orElseThrow(() -> new RuntimeException("Team 2 not found"));

        Tournament tournament = tournamentRepository.findById(request.getTournamentId())
                .orElseThrow(() -> new RuntimeException("Tournament not found"));

        game.setPlayer1(player1);
        game.setPlayer2(player2);
        game.setTeam1(team1);
        game.setTeam2(team2);
        game.setTournament(tournament);

        return gameRepository.save(game);
    }

    @Transactional
    public void updateGameScore(Long gameId, Integer score1, Integer score2) {
        gameRepository.findById(gameId).map(game -> {
            game.setScore1(score1);
            game.setScore2(score2);
            return gameRepository.save(game);
        }).orElseThrow(() -> new RuntimeException("Game not found with id: " + gameId));
    }

    @Transactional
    public void deleteGame(Long tournamentId, Long gameId) {
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new ResourceNotFoundException("Game not found with id: " + gameId));

        if (!game.getTournament().getId().equals(tournamentId)) {
            throw new ResourceNotFoundException("Game " + gameId + " does not belong to tournament " + tournamentId);
        }
        gameRepository.delete(game);
    }
}