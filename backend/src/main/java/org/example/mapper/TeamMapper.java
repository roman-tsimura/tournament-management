package org.example.mapper;

import org.example.dto.TeamDTO;
import org.example.dto.CreateTeamRequest;
import org.example.model.Team;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface TeamMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "homeGames", ignore = true)
    @Mapping(target = "awayGames", ignore = true)
    Team toEntity(TeamDTO teamDTO);

    TeamDTO toDTO(Team team);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "homeGames", ignore = true)
    @Mapping(target = "awayGames", ignore = true)
    Team toEntity(CreateTeamRequest createTeamRequest);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "homeGames", ignore = true)
    @Mapping(target = "awayGames", ignore = true)
    void updateFromDto(CreateTeamRequest dto, @MappingTarget Team entity);
}
