import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { 
  Tournament, 
  CreateTournamentRequest, 
  UpdateGameScoreRequest, 
  TournamentStats, 
  Game, 
  AddGameRequest,
  PlayerSelection,
  TeamSelection
} from '../models/tournament.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TournamentService {
  private apiUrl = `${environment.apiUrl}/tournaments`;

  constructor(private http: HttpClient) {}

  createTournament(tournamentData: CreateTournamentRequest): Observable<Tournament> {
    return this.http.post<Tournament>(this.apiUrl, tournamentData);
  }

  getTournament(tournamentId: string): Observable<Tournament> {
    return this.http.get<Tournament>(`${this.apiUrl}/${tournamentId}`);
  }

  updateGameScore(gameId: string, gameData: UpdateGameScoreRequest): Observable<Tournament> {
    return this.http.put<Tournament>(`${this.apiUrl}/games/${gameId}/scores`, {
      score1: gameData.homeScore,
      score2: gameData.guestScore
    });
  }

  getAllTournaments(): Observable<Tournament[]> {
    return this.http.get<Tournament[]>(this.apiUrl);
  }

  /**
   * Transforms a backend game object to the frontend Game interface
   */
  private mapToGame(backendGame: any): Game {
    // Get player and team IDs
    const player1Id = backendGame.player1Id?.toString() || '';
    const player2Id = backendGame.player2Id?.toString() || '';
    const team1Id = backendGame.team1Id?.toString() || '';
    const team2Id = backendGame.team2Id?.toString() || '';

    return {
      id: backendGame.id.toString(),
      homePlayer: {
        playerId: player1Id,
        playerName: '', // Will be populated by the component using getPlayerName
        teamId: team1Id,
        teamName: '', // Will be populated by the component using getTeamName
        isHome: true
      },
      guestPlayer: {
        playerId: player2Id,
        playerName: '', // Will be populated by the component using getPlayerName
        teamId: team2Id,
        teamName: '', // Will be populated by the component using getTeamName
        isHome: false
      },
      homeScore: backendGame.score1,
      guestScore: backendGame.score2,
      isCompleted: backendGame.status === 'COMPLETED',
      createdAt: new Date(backendGame.createdAt),
      updatedAt: new Date(backendGame.updatedAt)
    };
  }

  /**
   * Transforms a frontend Game object to the backend's expected format
   */
  private mapToBackendGame(game: Partial<Game>): any {
    return {
      player1Id: game.homePlayer?.playerId,
      player2Id: game.guestPlayer?.playerId,
      team1Id: game.homePlayer?.teamId,
      team2Id: game.guestPlayer?.teamId,
      score1: game.homeScore,
      score2: game.guestScore,
      status: game.isCompleted ? 'COMPLETED' : 'PENDING'
    };
  }

  getTournamentGames(tournamentId: string): Observable<Game[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${tournamentId}/games`).pipe(
      map(games => games.map(game => this.mapToGame(game)))
    );
  }

  deleteTournament(tournamentId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${tournamentId}`);
  }

  completeTournament(tournamentId: string): Observable<Tournament> {
    return this.http.post<Tournament>(`${this.apiUrl}/${tournamentId}/complete`, {});
  }

  getTournamentStats(tournamentId: string): Observable<TournamentStats> {
    return this.http.get<TournamentStats>(`${this.apiUrl}/${tournamentId}/stats`);
  }


  // Game management
  addGame(tournamentId: string, gameData: AddGameRequest): Observable<Game> {
    // Map the frontend's AddGameRequest to the backend's expected format
    const backendRequest = {
      player1Id: gameData.homePlayerId,
      player2Id: gameData.guestPlayerId,
      team1Id: gameData.homeTeamId,
      team2Id: gameData.guestTeamId,
      tournamentId: tournamentId,
      isTeam1Home: true // Assuming home team is team1
    };
    
    return this.http.post<any>(`${this.apiUrl}/${tournamentId}/games`, backendRequest).pipe(
      map(game => this.mapToGame(game))
    );
  }

  updateGame(tournamentId: string, gameId: string, gameData: Partial<Game>): Observable<Game> {
    return this.http.put<any>(
      `${this.apiUrl}/${tournamentId}/games/${gameId}`, 
      this.mapToBackendGame(gameData)
    ).pipe(
      map(game => this.mapToGame(game))
    );
  }

  deleteGame(tournamentId: string, gameId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${tournamentId}/games/${gameId}`);
  }

  // Helper methods for random selection
  getRandomPlayer(players: PlayerSelection[]): PlayerSelection | null {
    if (!players.length) return null;
    const randomIndex = Math.floor(Math.random() * players.length);
    return players[randomIndex];
  }

  getRandomTeam(teams: TeamSelection[]): TeamSelection | null {
    if (!teams.length) return null;
    const randomIndex = Math.floor(Math.random() * teams.length);
    return teams[randomIndex];
  }
}
