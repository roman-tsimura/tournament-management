import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Tournament, CreateTournamentRequest, UpdateGameScoreRequest, TournamentStats } from '../models/tournament.model';
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

  updateGameScore(tournamentId: string, gameData: UpdateGameScoreRequest): Observable<Tournament> {
    return this.http.put<Tournament>(`${this.apiUrl}/${tournamentId}/games`, gameData);
  }

  getAllTournaments(): Observable<Tournament[]> {
    console.log('Fetching tournaments from:', this.apiUrl);
    return this.http.get<Tournament[]>(this.apiUrl).pipe(
      tap({
        next: (tournaments) => console.log('Successfully loaded tournaments:', tournaments),
        error: (error) => console.error('Error loading tournaments:', error)
      })
    );
  }

  startNextRound(tournamentId: string, settings?: {
    teamAssignment: 'fixed' | 'random';
    homeAwayAssignment: 'fixed' | 'random';
  }): Observable<Tournament> {
    return this.http.post<Tournament>(`${this.apiUrl}/${tournamentId}/rounds`, settings);
  }

  completeTournament(tournamentId: string): Observable<Tournament> {
    return this.http.post<Tournament>(`${this.apiUrl}/${tournamentId}/complete`, {});
  }

  getTournamentStats(tournamentId: string): Observable<TournamentStats> {
    return this.http.get<TournamentStats>(`${this.apiUrl}/${tournamentId}/stats`);
  }

  // Helper method to calculate points based on game result
  calculatePoints(homeScore: number, awayScore: number): { homePoints: number; awayPoints: number } {
    if (homeScore > awayScore) {
      return { homePoints: 3, awayPoints: 0 };
    } else if (homeScore < awayScore) {
      return { homePoints: 0, awayPoints: 3 };
    } else {
      return { homePoints: 1, awayPoints: 1 };
    }
  }
}
