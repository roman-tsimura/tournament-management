package org.example.mapper;

import org.example.dto.TournamentDTO;
import org.example.dto.CreateTournamentRequest;
import org.example.model.Tournament;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface TournamentMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "games", ignore = true) // Games are managed separately
    @Mapping(target = "playerStats", ignore = true) // Player stats are managed separately
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Tournament toEntity(TournamentDTO tournamentDTO);

    TournamentDTO toDTO(Tournament tournament);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "games", ignore = true)
    @Mapping(target = "playerStats", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Tournament toEntity(CreateTournamentRequest createTournamentRequest);
}