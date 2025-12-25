package org.example.controller;

import jakarta.validation.Valid;
import org.example.dto.CreateTeamRequest;
import org.example.dto.TeamDTO;
import org.example.mapper.TeamMapper;
import org.example.model.Team;
import org.example.service.TeamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/teams")
public class TeamController {
    private final TeamService teamService;
    private final TeamMapper teamMapper;

    @Autowired
    public TeamController(TeamService teamService, TeamMapper teamMapper) {
        this.teamService = teamService;
        this.teamMapper = teamMapper;
    }

    @GetMapping
    public List<TeamDTO> getAllTeams() {
        return teamService.findAll().stream()
                .map(teamMapper::toDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TeamDTO> getTeamById(@PathVariable Long id) {
        return teamService.findById(id)
                .map(team -> ResponseEntity.ok(teamMapper.toDTO(team)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<TeamDTO> createTeam(@Valid @RequestBody CreateTeamRequest createTeamRequest) {
        Team team = teamMapper.toEntity(createTeamRequest);
        Team savedTeam = teamService.save(team);
        TeamDTO teamDTO = teamMapper.toDTO(savedTeam);
        return ResponseEntity.created(URI.create("/api/teams/" + savedTeam.getId()))
                .body(teamDTO);
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<TeamDTO> updateTeam(
            @PathVariable Long id,
            @Valid @RequestBody CreateTeamRequest updateTeamRequest
    ) {
        return teamService.findById(id)
                .map(existingTeam -> {
                    teamMapper.updateFromDto(updateTeamRequest, existingTeam);
                    return ResponseEntity.ok(teamMapper.toDTO(existingTeam));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTeam(@PathVariable Long id) {
        teamService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
