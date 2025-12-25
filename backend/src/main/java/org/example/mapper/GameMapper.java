package org.example.mapper;

import org.example.dto.GameDTO;
import org.example.dto.CreateGameRequest;
import org.example.model.Game;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.example.model.Player;
import org.example.model.Team;
import org.example.model.Tournament;

@Mapper(componentModel = "spring", uses = {PlayerMapper.class, TeamMapper.class})
public interface GameMapper {
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "player1", source = "player1Id", qualifiedByName = "mapPlayerIdToPlayer")
    @Mapping(target = "player2", source = "player2Id", qualifiedByName = "mapPlayerIdToPlayer")
    @Mapping(target = "team1", source = "team1Id", qualifiedByName = "mapTeamIdToTeam")
    @Mapping(target = "team2", source = "team2Id", qualifiedByName = "mapTeamIdToTeam")
    @Mapping(target = "tournament", source = "tournamentId", qualifiedByName = "mapTournamentIdToTournament")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "status", expression = "java(gameDTO.getStatus() != null ? Game.GameStatus.valueOf(gameDTO.getStatus()) : Game.GameStatus.SCHEDULED)")
    Game toEntity(GameDTO gameDTO);

    @Mapping(target = "player1Id", source = "player1.id")
    @Mapping(target = "player2Id", source = "player2.id")
    @Mapping(target = "team1Id", source = "team1.id")
    @Mapping(target = "team2Id", source = "team2.id")
    @Mapping(target = "tournamentId", source = "tournament.id")
    @Mapping(target = "status", source = "status", defaultExpression = "java(org.example.model.Game.GameStatus.SCHEDULED.toString())")
    GameDTO toDTO(Game game);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "player1", source = "player1Id", qualifiedByName = "mapPlayerIdToPlayer")
    @Mapping(target = "player2", source = "player2Id", qualifiedByName = "mapPlayerIdToPlayer")
    @Mapping(target = "team1", source = "team1Id", qualifiedByName = "mapTeamIdToTeam")
    @Mapping(target = "team2", source = "team2Id", qualifiedByName = "mapTeamIdToTeam")
    @Mapping(target = "tournament", ignore = true) // Tournament should be set separately
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "score1", ignore = true)
    @Mapping(target = "score2", ignore = true)
    @Mapping(target = "status", constant = "SCHEDULED")
    Game toEntity(CreateGameRequest createGameRequest);
    
    @Named("mapPlayerIdToPlayer")
    default Player mapPlayerIdToPlayer(Long playerId) {
        if (playerId == null) {
            return null;
        }
        Player player = new Player();
        player.setId(playerId);
        return player;
    }
    
    @Named("mapTeamIdToTeam")
    default Team mapTeamIdToTeam(Long teamId) {
        if (teamId == null) {
            return null;
        }
        Team team = new Team();
        team.setId(teamId);
        return team;
    }
    
    @Named("mapTournamentIdToTournament")
    default Tournament mapTournamentIdToTournament(Long tournamentId) {
        if (tournamentId == null) {
            return null;
        }
        Tournament tournament = new Tournament();
        tournament.setId(tournamentId);
        return tournament;
    }
}
