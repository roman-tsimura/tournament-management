import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Tournament, TournamentStats, TournamentSettings, Game } from '../models/tournament.model';
import { TournamentService } from '../services/tournament.service';
import { Player } from '../models/player.model';
import { Team } from '../models/team.model';
import { PlayerService } from '../services/player.service';
import { TeamService } from '../services/team.service';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { DatePipe } from '@angular/common';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

type TournamentView = 'list' | 'create' | 'teams' | 'tournament' | 'game';

interface PlayerTeamSelection {
  playerId: string;
  teamId: string;
  isHome: boolean;
}

@Component({
  selector: 'app-tournament',
  standalone: true,
  providers: [DatePipe],
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule,
    RouterModule,
    NgbPaginationModule,
    DatePipe
  ],
  templateUrl: './tournaments.component.html',
  styleUrls: ['./tournaments.component.scss']
})
export class TournamentsComponent implements OnInit, OnDestroy {
  private _currentView: TournamentView = 'list';
  private routerSubscription: Subscription = new Subscription();
  
  get currentView(): TournamentView {
    return this._currentView;
  }
  
  set currentView(value: TournamentView) {
    this._currentView = value;
  }
  
  tournaments: Tournament[] = [];
  currentTournament: Tournament | null = null;
  players: Player[] = [];
  teams: Team[] = [];
  selectedPlayers: string[] = [];
  isLoading = true;
  // currentView is now a getter/setter with _currentView as the backing field
  currentGame: Game | null = null;
  currentRound: number = 1;
  stats: TournamentStats | null = null;
  tournamentForm: FormGroup;
  page = 1;
  pageSize = 10;
  collectionSize = 0;
  scoreForm: FormGroup;
  playerSelections: PlayerTeamSelection[] = [];

  constructor(
    private tournamentService: TournamentService,
    private playerService: PlayerService,
    private teamService: TeamService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private datePipe: DatePipe,
    private changeDetector: ChangeDetectorRef
  ) {
    this.tournamentForm = this.fb.group({
      name: ['', Validators.required],
      teamAssignment: ['fixed', Validators.required],
      homeAwayAssignment: ['fixed', Validators.required],
      roundsToPlay: [1, [Validators.required, Validators.min(1)]]
    });

    this.scoreForm = this.fb.group({
      homeScore: [0, [Validators.required, Validators.min(0)]],
      awayScore: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this._currentView = 'list';
    
    // Initial data load
    this.loadInitialData();
    
    // Subscribe to route changes
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      if (this.router.url === '/tournaments') {
        this.loadInitialData();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  private loadInitialData(): void {
    this.isLoading = true;
    
    // Reset the view to ensure proper rendering
    this._currentView = 'list';
    
    Promise.all([
      this.loadTournaments(),
      this.loadPlayers(),
      this.loadTeams()
    ]).catch(() => {
      this.isLoading = false;
      this.changeDetector.detectChanges();
    });
  }

  loadTournaments(): Promise<void> {
    return new Promise((resolve) => {
      this.tournamentService.getAllTournaments().subscribe({
        next: (tournaments) => {
          this.tournaments = Array.isArray(tournaments) ? tournaments : [];
          this.collectionSize = this.tournaments.length;
          this.isLoading = false;
          
          // Force change detection after a small delay
          setTimeout(() => {
            this.changeDetector.detectChanges();
          }, 0);
          
          resolve();
        },
        error: () => {
          this.tournaments = [];
          this.collectionSize = 0;
          this.isLoading = false;
          this.changeDetector.detectChanges();
          resolve();
        }
      });
    });
  }

  viewTournament(tournamentId: string): void {
    this.router.navigate(['/tournaments', tournamentId]);
  }

  createNewTournament(): void {
    this.currentView = 'create';
  }

  onBackToList(): void {
    this.currentView = 'list';
    this.loadTournaments();
  }

  async loadPlayers(): Promise<void> {
    try {
      this.players = await this.playerService.getPlayers().toPromise() || [];
    } catch (error) {
      // Silently handle error
    }
  }

  async loadTeams(): Promise<void> {
    try {
      this.teams = await this.teamService.getTeams().toPromise() || [];
    } catch (error) {
      // Silently handle error
    }
  }

  togglePlayerSelection(playerId: string | number | undefined): void {
    if (playerId === undefined) return;
    const id = playerId.toString();
    const index = this.selectedPlayers.indexOf(id);
    if (index === -1) {
      this.selectedPlayers.push(id);
    } else {
      this.selectedPlayers.splice(index, 1);
    }
  }

  isPlayerSelected(playerId: string | number | undefined): boolean {
    if (playerId === undefined) return false;
    return this.selectedPlayers.includes(playerId.toString());
  }

  async createTournament(): Promise<void> {
    if (this.tournamentForm.invalid || this.selectedPlayers.length < 2) {
      alert('Please select at least 2 players');
      return;
    }

    const formValue = this.tournamentForm.value;
    
    // If team assignment is fixed, show team selection screen
    if (formValue.teamAssignment === 'fixed' || formValue.homeAwayAssignment === 'fixed') {
      this.currentView = 'teams';
      this.initializePlayerSelections();
      return;
    }

    await this.finalizeTournamentCreation();
  }

  initializePlayerSelections(): void {
    this.playerSelections = this.selectedPlayers.map(playerId => ({
      playerId,
      teamId: '',
      isHome: true
    }));
  }

  async finalizeTournamentCreation(): Promise<void> {
    this.isLoading = true;
    try {
      const formValue = this.tournamentForm.value;
      const tournamentData = {
        name: formValue.name,
        playerIds: this.selectedPlayers,
        teamAssignments: this.playerSelections.map(selection => ({
          playerId: selection.playerId,
          teamId: selection.teamId,
          isHome: selection.isHome
        })),
        settings: {
          teamAssignment: formValue.teamAssignment,
          homeAwayAssignment: formValue.homeAwayAssignment,
          roundsToPlay: formValue.roundsToPlay,
          pointsForWin: 3,
          pointsForDraw: 1,
          pointsForLoss: 0
        } as TournamentSettings
      };

      this.currentTournament = await this.tournamentService.createTournament(tournamentData).toPromise() || null;
      this.currentView = 'tournament';
      this.loadTournamentStats();
    } catch (error) {
      alert('Failed to create tournament');
    } finally {
      this.isLoading = false;
    }
  }

  async loadTournamentStats(): Promise<void> {
    if (!this.currentTournament) return;

    try {
      this.stats = await this.tournamentService.getTournamentStats(this.currentTournament.id).toPromise() || null;
    } catch (error) {
      // Silently handle error
    }
  }

  getPlayerName(playerId: string | number): string {
    // Handle both string and number IDs
    const player = this.players.find(p => p.id?.toString() === playerId.toString());
    return player ? player.name : 'Unknown Player';
  }

  getTeamName(teamId: string | number | undefined): string {
    if (teamId === undefined) return 'Unknown Team';
    // Handle both string and number IDs
    const team = this.teams.find(t => t.id?.toString() === teamId.toString());
    return team ? team.name : 'Unknown Team';
  }

  hasEmptyTeamSelections(): boolean {
    return this.playerSelections.some(selection => !selection.teamId);
  }

  startNewRound(): void {
    if (!this.currentTournament) return;
    
    const settings = {
      teamAssignment: this.tournamentForm.get('teamAssignment')?.value,
      homeAwayAssignment: this.tournamentForm.get('homeAwayAssignment')?.value
    };

    this.tournamentService.startNextRound(this.currentTournament.id, settings).subscribe({
      next: (tournament) => {
        this.currentTournament = tournament;
        this.loadTournamentStats();
      },
      error: (error) => {
        alert('Failed to start new round');
      }
    });
  }

  playGame(game: Game): void {
    this.currentGame = game;
    this.scoreForm.patchValue({
      homeScore: game.homeScore || 0,
      awayScore: game.guestScore || 0
    });
    this.currentView = 'game';
  }

  submitGameScore(): void {
    if (!this.currentTournament || !this.currentGame || this.scoreForm.invalid) {
      return;
    }

    const { homeScore, awayScore } = this.scoreForm.value;

    this.tournamentService.updateGameScore(this.currentTournament.id, {
      gameId: this.currentGame.id,
      homeScore,
      guestScore: awayScore
    }).subscribe({
      next: (tournament) => {
        this.currentTournament = tournament;
        this.currentView = 'tournament';
        this.currentGame = null;
        this.loadTournamentStats();
      },
      error: (error) => {
        alert('Failed to update game score');
      }
    });
  }

  getCurrentRoundGames(): Game[] {
    if (!this.currentTournament) return [];
    
    const currentRound = this.currentTournament.rounds.find(r => r.roundNumber === this.currentRound);
    return currentRound?.games || [];
  }

  getCompletedGamesCount(): number {
    if (!this.currentTournament) return 0;
    return this.getCurrentRoundGames().filter(g => g.isCompleted).length;
  }

  getTotalGamesCount(): number {
    if (!this.currentTournament) return 0;
    return this.getCurrentRoundGames().length;
  }

  isRoundComplete(): boolean {
    if (!this.currentTournament) return false;
    return this.getCurrentRoundGames().every(g => g.isCompleted);
  }

  isTournamentComplete(): boolean {
    if (!this.currentTournament) return false;
    return this.currentTournament.status === 'completed';
  }

  getPlayerTeam(playerId: string): Team | undefined {
    if (!this.currentTournament) return undefined;
    
    const participant = this.currentTournament.participants.find(p => p.playerId === playerId);
    if (!participant) return undefined;
    
    const assignment = participant.teamAssignments.find(a => a.roundNumber === this.currentRound);
    if (!assignment) return undefined;
    
    // Convert teamId to number for comparison since Team.id is number | undefined
    const teamId = parseInt(assignment.teamId, 10);
    return this.teams.find(t => t.id === teamId);
  }

  getPlayerHomeAway(playerId: string): string {
    if (!this.currentTournament) return '';
    
    const participant = this.currentTournament.participants.find(p => p.playerId === playerId);
    if (!participant) return '';
    
    const assignment = participant.teamAssignments.find(a => a.roundNumber === this.currentRound);
    return assignment?.isHome ? 'Home' : 'Away';
  }

  cancelGame(): void {
    this.currentView = 'tournament';
    this.currentGame = null;
  }

  finishTournament(): void {
    if (!this.currentTournament) return;

    if (confirm('Are you sure you want to finish the tournament? This cannot be undone.')) {
      this.tournamentService.completeTournament(this.currentTournament.id).subscribe({
        next: (tournament) => {
          this.currentTournament = tournament;
          this.loadTournamentStats();
        },
        error: (error) => {
          alert('Failed to complete tournament');
        }
      });
    }
  }
}
