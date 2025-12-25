package org.example.controller;

import jakarta.validation.Valid;
import org.example.dto.CreatePlayerRequest;
import org.example.dto.PlayerDTO;
import org.example.mapper.PlayerMapper;
import org.example.model.Player;
import org.example.service.PlayerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/players")
public class PlayerController {
    private final PlayerService playerService;
    private final PlayerMapper playerMapper;

    @Autowired
    public PlayerController(PlayerService playerService, PlayerMapper playerMapper) {
        this.playerService = playerService;
        this.playerMapper = playerMapper;
    }

    @GetMapping
    public List<PlayerDTO> getAllPlayers() {
        return playerService.findAll().stream()
                .map(playerMapper::toDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PlayerDTO> getPlayerById(@PathVariable Long id) {
        return playerService.findById(id)
                .map(playerMapper::toDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<PlayerDTO> createPlayer(@Valid @RequestBody CreatePlayerRequest request) {
        Player player = playerMapper.toEntity(request);
        Player savedPlayer = playerService.save(player);
        PlayerDTO playerDTO = playerMapper.toDTO(savedPlayer);

        return ResponseEntity
                .created(URI.create("/api/players/" + savedPlayer.getId()))
                .body(playerDTO);
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<PlayerDTO> updatePlayer(
            @PathVariable Long id,
            @Valid @RequestBody CreatePlayerRequest updatePlayerRequest) {
        return playerService.findById(id)
                .map(existingPlayer -> {
                    playerMapper.updateFromDto(updatePlayerRequest, existingPlayer);
                    return ResponseEntity.ok(playerMapper.toDTO(existingPlayer));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlayer(@PathVariable Long id) {
        playerService.delete(id);
        return ResponseEntity.noContent().build();
    }
}