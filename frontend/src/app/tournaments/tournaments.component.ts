import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray, FormControl } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import {
  Tournament,
  TournamentStats,
  Game,
  GameFormModel,
  PlayerSelection,
  TeamSelection,
  TournamentPlayer,
  TournamentTeam,
  AddGameRequest,
  UpdateGameScoreRequest, TournamentSettings
} from '../models/tournament.model';
import { TournamentService } from '../services/tournament.service';
import { Player } from '../models/player.model';
import { Team } from '../models/team.model';
import { PlayerService } from '../services/player.service';
import { TeamService } from '../services/team.service';
import { NgbPaginationModule, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { DatePipe } from '@angular/common';
import { filter, switchMap, tap, catchError, finalize } from 'rxjs/operators';
import { Subscription, of } from 'rxjs';

type TournamentView = 'list' | 'create' | 'tournament' | 'game' | 'teams';

export interface GameWithSelection extends Game {
  isExpanded?: boolean;
}

@Component({
  selector: 'app-tournaments',
  standalone: true,
  providers: [DatePipe],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    NgbPaginationModule,
    ConfirmDialogComponent,
    DatePipe
  ],
  templateUrl: './tournaments.component.html',
  styleUrls: ['./tournaments.component.scss']
})
export class TournamentsComponent implements OnInit, OnDestroy {
  private _currentView: TournamentView = 'list';
  private routerSubscription = new Subscription();
  private tournamentId: string | null = null;
  
  // Form groups
  tournamentForm: FormGroup;
  gameForm: FormGroup;
  
  // Data collections
  tournaments: Tournament[] = [];
  currentTournament: Tournament | null = null;
  games: GameWithSelection[] = [];
  availablePlayers: PlayerSelection[] = [];
  availableTeams: TeamSelection[] = [];
  filteredHomeTeams: TeamSelection[] = [];
  filteredGuestTeams: TeamSelection[] = [];
  players: Player[] = [];
  teams: Team[] = [];
  selectedPlayers: string[] = [];
  playerSelections: Array<{playerId: string; teamId: string; isHome: boolean}> = [];
  
  // Pagination
  page = 1;
  pageSize = 10;
  collectionSize = 0;
  
  // UI state
  isLoading = false;
  isSubmitting = false;
  selectedPlayerTeams: { [key: string]: TeamSelection[] } = {};
  currentGame: Game | null = null;
  currentRound = 1;
  stats: TournamentStats | null = null;
  
  // Form groups
  scoreForm: FormGroup;
  
  // View management
  get currentView(): TournamentView {
    return this._currentView;
  }
  
  set currentView(value: TournamentView) {
    this._currentView = value;
  }
  
  // Form getters
  get gamePlayers() {
    return this.gameForm.get('players') as FormArray;
  }
  
  get homePlayerId() {
    return this.gameForm.get('homePlayerId');
  }
  
  get guestPlayerId() {
    return this.gameForm.get('guestPlayerId');
  }

  constructor(
    private fb: FormBuilder,
    private tournamentService: TournamentService,
    private playerService: PlayerService,
    private teamService: TeamService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private datePipe: DatePipe,
    private modalService: NgbModal
  ) {
    this.tournamentForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]]
    });
    
    this.gameForm = this.fb.group({
      homePlayerId: ['', Validators.required],
      homeTeamId: ['', Validators.required],
      guestPlayerId: ['', [Validators.required, this.differentPlayerValidator('homePlayerId')]],
      guestTeamId: ['', Validators.required]
    });
    
    // Update available teams when player selection changes
    this.gameForm.get('homePlayerId')?.valueChanges.subscribe(playerId => {
      this.onPlayerSelected(playerId, 'home');
    });
    
    this.gameForm.get('guestPlayerId')?.valueChanges.subscribe(playerId => {
      this.onPlayerSelected(playerId, 'guest');
    });
    
    // Initialize score form
    this.scoreForm = this.fb.group({
      homeScore: ['', [Validators.required, Validators.min(0)]],
      awayScore: ['', [Validators.required, Validators.min(0)]]
    });
  }
  
  // Custom validator to ensure home and guest players are different
  private differentPlayerValidator(otherField: string) {
    return (control: FormControl) => {
      if (!control.parent) {
        return null;
      }
      const otherValue = control.parent.get(otherField)?.value;
      return otherValue && control.value === otherValue 
        ? { samePlayer: true } 
        : null;
    };
  }

  ngOnInit(): void {
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateView();
    });
    
    this.updateView();
  }

  updateView(): void {
    const url = this.router.url;
    
    if (url.includes('/create')) {
      this.currentView = 'create';
    } else if (this.route.firstChild) {
      // Handle child route with ID
      this.currentView = 'tournament';
      const id = this.route.firstChild.snapshot.paramMap.get('id');
      if (id && id !== this.tournamentId) {
        this.tournamentId = id;
        this.loadTournament();
      }
    } else if (url.startsWith('/tournaments/')) {
      // Handle direct URL access to tournament
      this.currentView = 'tournament';
      const id = url.split('/').pop();
      if (id && id !== this.tournamentId) {
        this.tournamentId = id;
        this.loadTournament();
      }
    } else {
      this.currentView = 'list';
      this.loadTournaments();
    }
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  loadTournament(): void {
    if (!this.tournamentId) return;

    this.isLoading = true;

    // Reset the game form when loading a tournament
    this.initNewGame();

    this.tournamentService.getTournament(this.tournamentId)
        .pipe(
            tap((tournament) => {
              this.currentTournament = tournament;
              this.games = tournament.games?.map(g => ({ ...g, isExpanded: false })) || [];
            }),
            // Load all players using PlayerService
            switchMap(() => this.playerService.getPlayers()),
            tap((players) => {
              // Map Player[] to PlayerSelection[] to match the expected type
              this.availablePlayers = (players || []).map(player => ({
                id: player.id?.toString() || '',
                name: `${player.name}`.trim()
              }));
              console.log('Players loaded:', this.availablePlayers);
            }),
            // Load available teams for the tournament
            switchMap(() => this.teamService.getTeams()),
            tap((teams) => {
              this.availableTeams = (teams || []).map(team => ({
                id: team.id?.toString() || '',
                name: team.name
              }));
              this.filteredHomeTeams = [...this.availableTeams];
              this.filteredGuestTeams = [...this.availableTeams];
              console.log('Teams loaded:', this.availableTeams);
            }),
            catchError((error) => {
              console.error('Error loading tournament data:', error);
              return of(null);
            }),
            finalize(() => {
              this.isLoading = false;
              this.cdr.detectChanges();
            })
        )
        .subscribe();
  }

  initNewGame(): void {
    this.gameForm.reset({
      homePlayerId: '',
      homeTeamId: '',
      guestPlayerId: '',
      guestTeamId: ''
    });
    this.filteredHomeTeams = [...this.availableTeams];
    this.filteredGuestTeams = [...this.availableTeams];
  }

  onPlayerSelected(playerId: string, playerType: 'home' | 'guest'): void {
    if (!playerId) {
      if (playerType === 'home') {
        this.filteredHomeTeams = this.availableTeams;
      } else {
        this.filteredGuestTeams = this.availableTeams;
      }
      return;
    }

    // Since we don't have a direct player-teams relationship,
    // we'll use all available teams in the tournament
    const teams = this.availableTeams;

    if (playerType === 'home') {
      this.filteredHomeTeams = teams;
      // Auto-select the first team if only one is available
      if (teams.length === 1) {
        this.gameForm.patchValue({ homeTeamId: teams[0].id });
      }
    } else {
      this.filteredGuestTeams = teams;
      // Auto-select the first team if only one is available
      if (teams.length === 1) {
        this.gameForm.patchValue({ guestTeamId: teams[0].id });
      }
    }
  }
  
  onRandomizePlayer(playerType: 'home' | 'guest'): void {
    const randomPlayer = this.tournamentService.getRandomPlayer(this.availablePlayers);
    if (randomPlayer) {
      const controlName = `${playerType}PlayerId`;
      this.gameForm.get(controlName)?.setValue(randomPlayer.id);
      // The valueChanges subscription will handle team loading
    }
  }
  
  onRandomizeTeam(playerType: 'home' | 'guest'): void {
    const teams = playerType === 'home' ? this.filteredHomeTeams : this.filteredGuestTeams;
    const randomTeam = this.tournamentService.getRandomTeam(teams);
    if (randomTeam) {
      const controlName = `${playerType}TeamId`;
      this.gameForm.get(controlName)?.setValue(randomTeam.id);
    }
  }

  addGame(): void {
    if (this.gameForm.invalid || !this.tournamentId) {
      return;
    }

    this.isSubmitting = true;
    const formValue = this.gameForm.value;

    // Make sure we have valid team selections
    if (!formValue.homeTeamId || !formValue.guestTeamId) {
      alert('Please select teams for both players');
      this.isSubmitting = false;
      return;
    }

    const gameData: AddGameRequest = {
      tournamentId: this.tournamentId,
      homePlayerId: formValue.homePlayerId,
      homeTeamId: formValue.homeTeamId,
      guestPlayerId: formValue.guestPlayerId,
      guestTeamId: formValue.guestTeamId
    };

    this.tournamentService.addGame(this.tournamentId, gameData)
        .pipe(
            finalize(() => this.isSubmitting = false)
        )
        .subscribe({
          next: (game) => {
            this.games.unshift({ ...game, isExpanded: false });
            this.gameForm.reset();
            // Reset filtered teams to all available teams
            this.filteredHomeTeams = [...this.availableTeams];
            this.filteredGuestTeams = [...this.availableTeams];
            // In a real app, show a success message
          },
          error: (error) => {
            console.error('Error adding game:', error);
            // In a real app, show a user-friendly error message
            alert('Failed to add game: ' + (error.error?.message || error.message || 'Unknown error'));
          }
        });
  }
  
  updateGameScore(game: GameWithSelection, homeScore: string, guestScore: string): void {
    if (!game.id) return;
    
    const homeScoreNum = parseInt(homeScore, 10);
    const guestScoreNum = parseInt(guestScore, 10);
    
    if (isNaN(homeScoreNum) || isNaN(guestScoreNum) || homeScoreNum < 0 || guestScoreNum < 0) {
      alert('Please enter valid scores (non-negative numbers)');
      return;
    }
    
    this.tournamentService.updateGameScore(game.id, {
      gameId: game.id,
      homeScore: homeScoreNum,
      guestScore: guestScoreNum
    }).subscribe({
      next: (updatedGame) => {
        const index = this.games.findIndex(g => g.id === game.id);
        if (index !== -1) {
          this.games[index] = {
            ...this.games[index],
            ...updatedGame,
            isExpanded: false
          };
          this.cdr.detectChanges();
        }
        // In a real app, show a success message
      },
      error: (error) => {
        console.error('Error updating game score:', error);
        alert('Failed to update game score: ' + (error.error?.message || error.message || 'Unknown error'));
      }
    });
  }
  
  deleteGame(gameId: string): void {
    if (!this.tournamentId) return;
    
    const modalRef: NgbModalRef = this.modalService.open(ConfirmDialogComponent, { centered: true });
    modalRef.componentInstance.title = 'Delete Game';
    modalRef.componentInstance.message = 'Are you sure you want to delete this game?';
    modalRef.componentInstance.confirmText = 'Delete';
    
    modalRef.result.then(
      (result) => {
        if (result === 'confirm') {
          this.tournamentService.deleteGame(this.tournamentId!, gameId)
            .subscribe({
              next: () => {
                this.games = this.games.filter(g => g.id !== gameId);
                // In a real app, show a success message
              },
              error: (error) => {
                console.error('Error deleting game:', error);
                // In a real app, show a user-friendly error message
              }
            });
        }
      },
      () => {}
    );
  }
  
  toggleGameExpand(game: GameWithSelection): void {
    game.isExpanded = !game.isExpanded;
  }

  private async loadInitialData(): Promise<void> {
    this.isLoading = true;
    
    // Only load tournaments if we're in the list view
    if (this._currentView === 'list') {
      await this.loadTournaments();
    }
    
    // Load players and teams if needed
    if (this._currentView === 'create') {
      await Promise.all([
        this.loadPlayers(),
        this.loadTeams()
      ]);
    }
  }

  loadTournaments(): Promise<void> {
    this.isLoading = true;
    return new Promise((resolve) => {
      this.tournamentService.getAllTournaments()
          .pipe(
              finalize(() => {
                this.isLoading = false;
                this.cdr.detectChanges();
              })
          )
          .subscribe({
            next: (tournaments) => {
              this.tournaments = tournaments || [];
              this.collectionSize = this.tournaments.length;
              resolve();
            },
            error: (error) => {
              console.error('Error loading tournaments:', error);
              this.tournaments = [];
              this.collectionSize = 0;
              resolve();
            }
          });
    });
  }

  viewTournament(tournamentId: string, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.router.navigate(['/tournaments', tournamentId], { replaceUrl: true });
  }

  async createNewTournament(): Promise<void> {
    this.currentView = 'create';
    try {
      // Load both players and teams in parallel
      await Promise.all([
        this.loadPlayers(),
        this.loadTeams()
      ]);
      console.log('Players and teams loaded:', { players: this.players, teams: this.teams });
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      // Force change detection to update the view
      this.cdr.detectChanges();
    }
  }

  onBackToList(): void {
    this.currentView = 'list';
    this.loadTournaments();
  }

  async loadPlayers(): Promise<void> {
    console.log('Loading players...');
    try {
      const players = await this.playerService.getPlayers().toPromise();
      console.log('Players from API:', players);
      this.players = players || [];
      console.log('Assigned players:', this.players);
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error loading players:', error);
      this.players = [];
    }
  }

  async loadTeams(): Promise<void> {
    console.log('Loading teams...');
    try {
      const teams = await this.teamService.getTeams().toPromise();
      console.log('Teams from API:', teams);
      this.teams = teams || [];
      console.log('Assigned teams:', this.teams);
    } catch (error) {
      console.error('Error loading teams:', error);
      this.teams = [];
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
    if (this.tournamentForm.invalid) {
      return;
    }

    const formValue = this.tournamentForm.value;
    
    // Only show team selection screen if there are selected players
    if (this.selectedPlayers.length > 0 && (formValue.teamAssignment === 'fixed' || formValue.homeAwayAssignment === 'fixed')) {
      this.currentView = 'teams';
      this.initializePlayerSelections();
      return;
    }

    await this.finalizeTournamentCreation();
  }

  initializePlayerSelections(): void {
    this.playerSelections = this.selectedPlayers.map(playerId => ({
      playerId: playerId.toString(),
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
          homeAwayAssignment: formValue.homeAwayAssignment
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
    if (!this.currentTournament) {
      alert('No tournament selected');
      return;
    }
    
    const settings = {
      teamAssignment: this.tournamentForm.get('teamAssignment')?.value || 'fixed',
      homeAwayAssignment: this.tournamentForm.get('homeAwayAssignment')?.value || 'fixed'
    };

    this.tournamentService.startNextRound(this.currentTournament.id, settings).subscribe({
      next: (tournament) => {
        this.currentTournament = tournament;
        this.loadTournamentStats();
      },
      error: (error) => {
        console.error('Error starting new round:', error);
        const errorMessage = error.error?.message || 'Failed to start new round';
        alert(`Error: ${errorMessage}`);
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
}
