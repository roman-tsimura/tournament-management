package org.example.mapper;

import org.example.dto.CreatePlayerRequest;
import org.example.dto.PlayerDTO;
import org.example.model.Player;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface PlayerMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "tournamentStats", ignore = true)
    Player toEntity(PlayerDTO playerDTO);

    PlayerDTO toDTO(Player player);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "tournamentStats", ignore = true)
    Player toEntity(CreatePlayerRequest createPlayerRequest);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "tournamentStats", ignore = true)
    void updateFromDto(CreatePlayerRequest dto, @MappingTarget Player entity);
}