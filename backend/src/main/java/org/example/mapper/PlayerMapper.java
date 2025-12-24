package org.example.mapper;

import org.example.dto.PlayerDTO;
import org.example.model.Player;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PlayerMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "gamesAsPlayer1", ignore = true)
    @Mapping(target = "gamesAsPlayer2", ignore = true)
    @Mapping(target = "tournaments", ignore = true)
    Player toEntity(PlayerDTO playerDTO);

    PlayerDTO toDTO(Player player);
}