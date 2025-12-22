package org.example.service;

import jakarta.transaction.Transactional;
import org.example.model.Game;
import org.example.model.Player;
import org.example.model.Team;
import org.example.model.Tournament;
import org.example.model.Tournament.TournamentStatus;
import org.example.repository.PlayerRepository;
import org.example.repository.TeamRepository;
import org.example.repository.TournamentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class TournamentService {
    private final TournamentRepository tournamentRepository;
    private final PlayerRepository playerRepository;
    private final TeamRepository teamRepository;
    private final GameService gameService;

    @Autowired
    public TournamentService(TournamentRepository tournamentRepository,
                             PlayerRepository playerRepository,
                             TeamRepository teamRepository,
                             GameService gameService) {
        this.tournamentRepository = tournamentRepository;
        this.playerRepository = playerRepository;
        this.teamRepository = teamRepository;
        this.gameService = gameService;
    }

    public List<Tournament> findAll() {
        return tournamentRepository.findAll();
    }

    public Optional<Tournament> findById(Long id) {
        return tournamentRepository.findById(id);
    }

    @Transactional
    public Tournament createTournament(Tournament tournament) {
        tournament.setStatus(TournamentStatus.UPCOMING);
        return tournamentRepository.save(tournament);
    }

    @Transactional
    public Tournament updateTournament(Long id, Tournament tournamentDetails) {
        return tournamentRepository.findById(id).map(tournament -> {
            tournament.setName(tournamentDetails.getName());
            tournament.setDescription(tournamentDetails.getDescription());
            tournament.setStartDate(tournamentDetails.getStartDate());
            tournament.setEndDate(tournamentDetails.getEndDate());
            tournament.setMaxPlayers(tournamentDetails.getMaxPlayers());
            return tournamentRepository.save(tournament);
        }).orElseThrow(() -> new RuntimeException("Tournament not found with id: " + id));
    }

    @Transactional
    public void deleteTournament(Long id) {
        tournamentRepository.deleteById(id);
    }

    @Transactional
    public Tournament startTournament(Long id) {
        return tournamentRepository.findById(id).map(tournament -> {
            if (tournament.getStatus() != TournamentStatus.UPCOMING) {
                throw new IllegalStateException("Only upcoming tournaments can be started");
            }
            tournament.setStatus(TournamentStatus.IN_PROGRESS);
            tournament.setCurrentRound(1);
            return tournamentRepository.save(tournament);
        }).orElseThrow(() -> new RuntimeException("Tournament not found with id: " + id));
    }

    @Transactional
    public Tournament completeTournament(Long id) {
        return tournamentRepository.findById(id).map(tournament -> {
            tournament.setStatus(TournamentStatus.COMPLETED);
            tournament.setEndDate(LocalDateTime.now());
            return tournamentRepository.save(tournament);
        }).orElseThrow(() -> new RuntimeException("Tournament not found with id: " + id));
    }

    @Transactional
    public Tournament addPlayerToTournament(Long tournamentId, Long playerId) {
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new RuntimeException("Tournament not found"));
        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new RuntimeException("Player not found"));

        if (tournament.getPlayers().contains(player)) {
            throw new IllegalStateException("Player is already registered for this tournament");
        }

        tournament.addPlayer(player);
        return tournamentRepository.save(tournament);
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
}