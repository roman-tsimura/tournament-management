package org.example.service;

import jakarta.transaction.Transactional;
import org.example.model.Player;
import org.example.repository.PlayerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PlayerService {
    private final PlayerRepository playerRepository;

    @Autowired
    public PlayerService(PlayerRepository playerRepository) {
        this.playerRepository = playerRepository;
    }

    public List<Player> findAll() {
        return playerRepository.findAll();
    }

    public Optional<Player> findById(Long id) {
        return playerRepository.findById(id);
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
}