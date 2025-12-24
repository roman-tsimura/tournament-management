package org.example.mapper;

import org.example.dto.TournamentDTO;
import org.example.dto.CreateTournamentRequest;
import org.example.model.Tournament;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.example.model.Player;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring", uses = {PlayerMapper.class, GameMapper.class})
public interface TournamentMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "players", source = "playerIds", qualifiedByName = "mapPlayerIdsToPlayers")
    @Mapping(target = "games", ignore = true) // Games are managed separately
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Tournament toEntity(TournamentDTO tournamentDTO);

    @Mapping(target = "playerIds", source = "players", qualifiedByName = "mapPlayersToPlayerIds")
    TournamentDTO toDTO(Tournament tournament);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "players", ignore = true) // Players should be added separately
    @Mapping(target = "games", ignore = true)
    @Mapping(target = "currentRound", constant = "0")
    @Mapping(target = "status", constant = "UPCOMING")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Tournament toEntity(CreateTournamentRequest createTournamentRequest);
    
    @Named("mapPlayerIdsToPlayers")
    default List<Player> mapPlayerIdsToPlayers(List<Long> playerIds) {
        if (playerIds == null) {
            return null;
        }
        return playerIds.stream()
                .map(playerId -> {
                    Player player = new Player();
                    player.setId(playerId);
                    return player;
                })
                .collect(Collectors.toList());
    }
    
    @Named("mapPlayersToPlayerIds")
    default List<Long> mapPlayersToPlayerIds(List<Player> players) {
        if (players == null) {
            return null;
        }
        return players.stream()
                .map(Player::getId)
                .collect(Collectors.toList());
    }
}
