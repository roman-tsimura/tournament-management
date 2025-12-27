package org.example.controller;

import jakarta.validation.Valid;
import org.example.dto.*;
import org.example.mapper.GameMapper;
import org.example.mapper.TournamentMapper;
import org.example.model.Game;
import org.example.model.Tournament;
import org.example.service.GameService;
import org.example.service.TournamentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tournaments")
public class TournamentController {
    private final TournamentService tournamentService;
    private final GameService gameService;
    private final TournamentMapper tournamentMapper;
    private final GameMapper gameMapper;

    @Autowired
    public TournamentController(TournamentService tournamentService,
                              GameService gameService,
                              TournamentMapper tournamentMapper,
                              GameMapper gameMapper) {
        this.tournamentService = tournamentService;
        this.gameService = gameService;
        this.tournamentMapper = tournamentMapper;
        this.gameMapper = gameMapper;
    }

    @GetMapping
    public List<TournamentDTO> getAllTournaments() {
        return tournamentService.findAll().stream()
                .map(tournamentMapper::toDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TournamentDTO> getTournamentById(@PathVariable Long id) {
        return tournamentService.findById(id)
                .map(tournamentMapper::toDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PutMapping("/games/{gameId}/scores")
    public ResponseEntity<GameDTO> updateGameScores(
            @PathVariable Long gameId,
            @Valid @RequestBody GameScoreUpdateDTO scoreUpdate) {
        Game updatedGame = tournamentService.updateGameScores(gameId, scoreUpdate);
        GameDTO gameDTO = gameMapper.toDTO(updatedGame);
        return ResponseEntity.ok(gameDTO);
    }

    @GetMapping("/{id}/games")
    public ResponseEntity<List<GameDTO>> getTournamentGames(@PathVariable Long id) {
        List<Game> games = tournamentService.getTournamentGames(id);
        List<GameDTO> gameDTOs = games.stream()
                .map(gameMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(gameDTOs);
    }

    @PostMapping("/{tournamentId}/games")
    @ResponseStatus(HttpStatus.CREATED)
    public GameDTO addGameToTournament(
            @PathVariable Long tournamentId,
            @Valid @RequestBody CreateGameRequest request) {
        request.setTournamentId(tournamentId);
        Game game = gameService.createGame(request);
        return gameMapper.toDTO(game);
    }

    @PostMapping
    public ResponseEntity<TournamentDTO> createTournament(@Valid @RequestBody TournamentDTO tournamentDTO) {
        Tournament tournament = tournamentMapper.toEntity(tournamentDTO);
        Tournament savedTournament = tournamentService.save(tournament);
        TournamentDTO savedTournamentDTO = tournamentMapper.toDTO(savedTournament);

        return ResponseEntity
                .created(URI.create("/api/tournaments/" + savedTournament.getId()))
                .body(savedTournamentDTO);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TournamentDTO> updateTournament(
            @PathVariable Long id,
            @Valid @RequestBody TournamentDTO tournamentDTO
    ) {
        if (!tournamentService.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        tournamentDTO.setId(id);
        Tournament tournament = tournamentMapper.toEntity(tournamentDTO);
        Tournament updatedTournament = tournamentService.save(tournament);
        
        return ResponseEntity.ok(tournamentMapper.toDTO(updatedTournament));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTournament(@PathVariable Long id) {
        tournamentService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/stats")
    public ResponseEntity<TournamentStatsDTO> getTournamentStats(@PathVariable Long id) {
        return tournamentService.getTournamentStats(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
