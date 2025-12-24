package org.example.controller;

import org.example.dto.TournamentDTO;
import org.example.dto.TournamentStatsDTO;
import org.example.mapper.TournamentMapper;
import org.example.model.Tournament;
import org.example.service.TournamentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tournaments")
public class TournamentController {
    private final TournamentService tournamentService;
    private final TournamentMapper tournamentMapper;

    @Autowired
    public TournamentController(TournamentService tournamentService, TournamentMapper tournamentMapper) {
        this.tournamentService = tournamentService;
        this.tournamentMapper = tournamentMapper;
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

    @PostMapping("/{id}/start")
    public ResponseEntity<TournamentDTO> startTournament(@PathVariable Long id) {
        return tournamentService.startTournament(id)
                .map(tournamentMapper::toDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<TournamentDTO> completeTournament(@PathVariable Long id) {
        return tournamentService.completeTournament(id)
                .map(tournamentMapper::toDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/next-round")
    public ResponseEntity<TournamentDTO> startNextRound(@PathVariable Long id) {
        return tournamentService.startNextRound(id)
                .map(tournamentMapper::toDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/stats")
    public ResponseEntity<TournamentStatsDTO> getTournamentStats(@PathVariable Long id) {
        return tournamentService.getTournamentStats(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
