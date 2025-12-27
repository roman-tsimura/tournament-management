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

  getTournamentGames(tournamentId: string): Observable<Game[]> {
    return this.http.get<Game[]>(`${this.apiUrl}/${tournamentId}/games`);
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
    return this.http.post<Game>(`${this.apiUrl}/${tournamentId}/games`, backendRequest);
  }

  updateGame(tournamentId: string, gameId: string, gameData: Partial<Game>): Observable<Game> {
    return this.http.put<Game>(`${this.apiUrl}/${tournamentId}/games/${gameId}`, gameData);
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
