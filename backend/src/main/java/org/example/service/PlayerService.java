package org.example.service;

import jakarta.transaction.Transactional;
import org.example.exception.ResourceNotFoundException;
import org.example.model.Player;
import org.example.model.Tournament;
import org.example.repository.PlayerRepository;
import org.example.repository.TournamentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PlayerService {
    private final PlayerRepository playerRepository;
    private final TournamentRepository tournamentRepository;

    @Autowired
    public PlayerService(PlayerRepository playerRepository, TournamentRepository tournamentRepository) {
        this.playerRepository = playerRepository;
        this.tournamentRepository = tournamentRepository;
    }

    public List<Player> findAll() {
        return playerRepository.findAll();
    }

    public Optional<Player> findById(Long id) {
        return playerRepository.findById(id);
    }

    public Optional<Player> findByName(String name) {
        return playerRepository.findByName(name);
    }

    @Transactional
    public Player save(Player player) {
        return playerRepository.save(player);
    }

    @Transactional
    public void delete(Long id) {
        playerRepository.deleteById(id);
    }

    @Transactional
    public Player update(Long id, Player playerDetails) {
        return playerRepository.findById(id).map(player -> {
            player.setName(playerDetails.getName());
            return playerRepository.save(player);
        }).orElseThrow(() -> new RuntimeException("Player not found with id: " + id));
    }

    public List<Player> findPlayersByTournamentId(Long tournamentId) {
        return playerRepository.findByTournamentId(tournamentId);
    }

    @Transactional
    public void registerForTournament(Long playerId, Long tournamentId) {
        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new ResourceNotFoundException("Player not found with id: " + playerId));

        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new ResourceNotFoundException("Tournament not found with id: " + tournamentId));

        player.addTournament(tournament);
        playerRepository.save(player);
    }
}