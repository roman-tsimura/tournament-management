package org.example.service;

import jakarta.transaction.Transactional;
import org.example.model.Team;
import org.example.repository.TeamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TeamService {
    private final TeamRepository teamRepository;

    @Autowired
    public TeamService(TeamRepository teamRepository) {
        this.teamRepository = teamRepository;
    }

    public List<Team> findAll() {
        return teamRepository.findAll();
    }

    public Optional<Team> findById(Long id) {
        return teamRepository.findById(id);
    }

    @Transactional
    public Team save(Team team) {
        if (teamRepository.existsByName(team.getName())) {
            throw new IllegalStateException("Team with name " + team.getName() + " already exists");
        }
        return teamRepository.save(team);
    }

    @Transactional
    public void delete(Long id) {
        teamRepository.deleteById(id);
    }

    @Transactional
    public Team update(Long id, Team teamDetails) {
        return teamRepository.findById(id).map(team -> {
            if (!team.getName().equals(teamDetails.getName()) &&
                    teamRepository.existsByName(teamDetails.getName())) {
                throw new IllegalStateException("Team with name " + teamDetails.getName() + " already exists");
            }
            team.setName(teamDetails.getName());
            return teamRepository.save(team);
        }).orElseThrow(() -> new RuntimeException("Team not found with id: " + id));
    }
}