package org.example.controller;

import org.example.dto.CreatePlayerRequest;
import org.example.dto.PlayerDTO;
import org.example.mapper.PlayerMapper;
import org.example.model.Player;
import org.example.service.PlayerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
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
        Player player = new Player();
        player.setName(request.getName());

        Player savedPlayer = playerService.save(player);
        PlayerDTO playerDTO = playerMapper.toDTO(savedPlayer);

        return ResponseEntity
                .created(URI.create("/api/players/" + savedPlayer.getId()))
                .body(playerDTO);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PlayerDTO> updatePlayer(
            @PathVariable Long id,
            @Valid @RequestBody PlayerDTO playerDTO) {

        playerDTO.setId(id); // Ensure the ID in the path is used
        Player updatedPlayer = playerService.update(id, playerMapper.toEntity(playerDTO));
        return ResponseEntity.ok(playerMapper.toDTO(updatedPlayer));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlayer(@PathVariable Long id) {
        playerService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{playerId}/tournaments/{tournamentId}")
    public ResponseEntity<Void> registerForTournament(
            @PathVariable Long playerId,
            @PathVariable Long tournamentId) {

        playerService.registerForTournament(playerId, tournamentId);
        return ResponseEntity.ok().build();
    }
}