import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';
import { CommonModule } from '@angular/common';
import {AbstractControl, FormsModule} from '@angular/forms';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray, FormControl } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute, NavigationEnd, RouterLink } from '@angular/router';
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
import { NgbPaginationModule, NgbModal, NgbModalRef, NgbDropdownModule, NgbNavModule, NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { DatePipe } from '@angular/common';
import {filter, switchMap, tap, catchError, finalize, map} from 'rxjs/operators';
import {Subscription, of, forkJoin} from 'rxjs';

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
    RouterLink,
    NgbDropdownModule,
    NgbNavModule,
    NgbTypeaheadModule,
    NgbPaginationModule,
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
  scoreForms = new Map<string, FormGroup>();
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
  currentGame: Game | null = null;
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

  ngOnDestroy() {
    // Unsubscribe from all subscriptions to prevent memory leaks
    this.routerSubscription.unsubscribe();
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
    private modalService: NgbModal
  ) {
    this.tournamentForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]]
    });
    
    this.gameForm = this.fb.group({
      homePlayerId: ['', Validators.required],
      homeTeamId: ['', Validators.required],
      guestPlayerId: ['', [Validators.required, this.differentPlayerValidator('homePlayerId')]],
      guestTeamId: ['', [Validators.required, this.differentTeamValidator('homeTeamId')]]
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

  // Custom validator to ensure home and guest teams are different
  private differentTeamValidator(otherField: string) {
    return (control: FormControl) => {
      if (!control.parent) {
        return null;
      }
      const otherValue = control.parent.get(otherField)?.value;
      return otherValue && control.value === otherValue 
        ? { sameTeam: true } 
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
    // Get the current route snapshot
    const route = this.route.snapshot;
    
    // Check if we're on a child route
    if (route.firstChild) {
      const childRoute = route.firstChild;
      
      // Get the view from route data
      const view = childRoute.data['view'] as TournamentView;
      
      if (view === 'tournament' || childRoute.url.some(segment => segment.path.startsWith('tournament/'))) {
        // Handle tournament view
        this._currentView = 'tournament';
        this.tournamentId = childRoute.paramMap.get('id');
        
        if (this.tournamentId) {
          this.loadTournament();
        } else {
          this.router.navigate(['/tournaments']);
        }
      } else if (view === 'create') {
        // Handle create view
        this._currentView = 'create';
      } else {
        // Default to list view
        this._currentView = 'list';
        this.loadTournaments();
      }
    } else {
      // No child route, default to list view
      this._currentView = 'list';
      this.loadTournaments();
    }
    
    this.cdr.detectChanges();
  }

  loadTournament(): void {
    // Get the ID from the route if not already set
    const idFromRoute = this.route.snapshot.firstChild?.paramMap.get('id');
    this.tournamentId = this.tournamentId !== null ? this.tournamentId : (idFromRoute || null);

    if (!this.tournamentId) {
      console.error('No tournament ID provided');
      this.router.navigate(['/tournaments']);
      return;
    }

    this.isLoading = true;
    this.cdr.detectChanges(); // Update the view to show loading state

    // Reset the game form when loading a tournament
    this.initNewGame();

    // First, get the basic tournament data
    this.tournamentService.getTournament(this.tournamentId).pipe(
        switchMap(tournament => {
          if (!tournament) {
            throw new Error('Tournament not found');
          }

          console.log('Basic tournament data:', JSON.stringify(tournament, null, 2));
          this.currentTournament = tournament;
          this._currentView = 'tournament';

          // Load games, players, and teams in parallel
          return forkJoin([
            this.tournamentService.getTournamentGames(tournament.id).pipe(
              catchError(error => {
                console.error('Error loading games:', error);
                return of([]);
              })
            ),
            this.playerService.getPlayers().pipe(
              catchError(error => {
                console.error('Error loading players:', error);
                return of([]);
              })
            ),
            this.teamService.getTeams().pipe(
              catchError(error => {
                console.error('Error loading teams:', error);
                return of([]);
              })
            )
          ]).pipe(
            map(([games, players, teams]) => ({
              tournament,
              games,
              players,
              teams
            }))
          );
        }),
        tap(({ games, players, teams }) => {
          // Update tournament with games and count
          if (this.currentTournament) {
            this.currentTournament.games = games || [];
            this.currentTournament.gameCount = games?.length || 0;
          }

          // Update games array for the component
          this.games = (games || []).map(g => ({ ...g, isExpanded: false }));

          // Update available players
          this.availablePlayers = (players || []).map(player => ({
            id: player.id?.toString() || '',
            name: `${player.name}`.trim()
          }));

          // Update available teams
          this.availableTeams = (teams || []).map(team => ({
            id: team.id?.toString() || '',
            name: team.name
          }));
          this.filteredHomeTeams = [...this.availableTeams];
          this.filteredGuestTeams = [...this.availableTeams];

          console.log('Updated tournament with all data:', {
            games: this.games,
            gamesCount: games?.length,
            availablePlayers: this.availablePlayers,
            availableTeams: this.availableTeams
          });
        }),
        catchError((error) => {
          console.error('Error loading tournament data:', error);
          this.router.navigate(['/tournaments']);
          return of(null);
        }),
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        })
    ).subscribe();
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
    // Get the other player's ID (if any)
    const otherPlayerControl = playerType === 'home' ? 'guestPlayerId' : 'homePlayerId';
    const otherPlayerId = this.gameForm.get(otherPlayerControl)?.value;
    
    // Filter out the other selected player (if any) from available players
    const availablePlayers = this.availablePlayers.filter(
      player => !otherPlayerId || player.id !== otherPlayerId
    );
    
    if (availablePlayers.length === 0) {
      console.warn('No available players to select');
      return;
    }
    
    const randomPlayer = this.tournamentService.getRandomPlayer(availablePlayers);
    if (randomPlayer) {
      const controlName = `${playerType}PlayerId`;
      this.gameForm.get(controlName)?.setValue(randomPlayer.id);
      // The valueChanges subscription will handle team loading
    }
  }
  
  onRandomizeTeam(playerType: 'home' | 'guest'): void {
    // Get the other team's ID (if any)
    const otherTeamControl = playerType === 'home' ? 'guestTeamId' : 'homeTeamId';
    const otherTeamId = this.gameForm.get(otherTeamControl)?.value;
    
    // Get the appropriate teams list based on player type
    let availableTeams = playerType === 'home' ? 
      [...this.filteredHomeTeams] : 
      [...this.filteredGuestTeams];
    
    // Filter out the other selected team (if any)
    availableTeams = availableTeams.filter(
      team => !otherTeamId || team.id !== otherTeamId
    );
    
    if (availableTeams.length === 0) {
      console.warn(`No available teams to select for ${playerType} team`);
      return;
    }
    
    const randomTeam = this.tournamentService.getRandomTeam(availableTeams);
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

    // Get player and team names
    const homePlayer = this.availablePlayers.find(p => p.id === formValue.homePlayerId);
    const guestPlayer = this.availablePlayers.find(p => p.id === formValue.guestPlayerId);
    const homeTeam = this.availableTeams.find(t => t.id === formValue.homeTeamId);
    const guestTeam = this.availableTeams.find(t => t.id === formValue.guestTeamId);

    if (!homePlayer || !guestPlayer || !homeTeam || !guestTeam) {
      alert('Invalid player or team selection');
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
            // Create a new game object with all necessary properties
            const newGame: GameWithSelection = {
              ...game,
              isExpanded: false,
              homePlayer: {
                playerId: game.homePlayer?.playerId || formValue.homePlayerId,
                playerName: homePlayer?.name || '',
                teamId: game.homePlayer?.teamId || formValue.homeTeamId,
                teamName: homeTeam?.name || '',
                isHome: true
              },
              guestPlayer: {
                playerId: game.guestPlayer?.playerId || formValue.guestPlayerId,
                playerName: guestPlayer?.name || '',
                teamId: game.guestPlayer?.teamId || formValue.guestTeamId,
                teamName: guestTeam?.name || '',
                isHome: false
              }
            };
            
            // Add the new game to the beginning of the games array
            this.games.unshift(newGame);
            
            // Reset the form and filtered teams
            this.gameForm.reset();
            this.filteredHomeTeams = [...this.availableTeams];
            this.filteredGuestTeams = [...this.availableTeams];
            
            // Force change detection
            this.cdr.detectChanges();
          },
          error: (error) => {
            console.error('Error adding game:', error);
            alert('Failed to add game: ' + (error.error?.message || error.message || 'Unknown error'));
          }
        });
  }
  
  updateGameScore(game: GameWithSelection, form: FormGroup): void {
    if (!game.id || !this.tournamentId || form.invalid) return;
    
    this.isSubmitting = true;
    const formValue = form.getRawValue();
    const updateRequest: UpdateGameScoreRequest = {
      gameId: game.id,
      homeScore: formValue.homeScore,
      guestScore: formValue.guestScore
    };

    this.tournamentService.updateGameScore(game.id, updateRequest)
      .subscribe({
        next: (updatedGame) => {
          // Update the game in the local array
          const index = this.games.findIndex(g => g.id === game.id);
          if (index !== -1) {
            this.games[index] = { 
              ...this.games[index], 
              ...updatedGame,
              isCompleted: true
            };
            
            // Update the form state
            const scoreForm = this.scoreForms.get(game.id!);
            if (scoreForm) {
              scoreForm.disable();
            }
          }
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error updating game score:', error);
          // Optionally show an error message to the user
        },
        complete: () => {
          this.isSubmitting = false;
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
    
    if (game.isExpanded && !this.scoreForms.has(game.id!)) {
      this.scoreForms.set(game.id!, this.createScoreForm(game));
    }
  }
  
  private createScoreForm(game: Game): FormGroup {
    const formGroup = this.fb.group({
      homeScore: [
        { value: game.homeScore || 0, disabled: false },
        [Validators.required, Validators.min(0)]
      ],
      guestScore: [
        { value: game.guestScore || 0, disabled: false },
        [Validators.required, Validators.min(0)]
      ]
    });
    
    // Set initial disabled state using form control API
    if (game.isCompleted) {
      formGroup.disable();
    }
    
    return formGroup;
  }
  
  // Helper method to safely disable/enable form controls
  private setFormControlState(control: AbstractControl | null, isDisabled: boolean): void {
    if (!control) return;
    
    if (isDisabled) {
      control.disable();
    } else {
      control.enable();
    }
  }
  
  public enableScoreEditing(game: GameWithSelection): void {
    game.isCompleted = false;
    const scoreForm = this.scoreForms.get(game.id!);
    if (scoreForm) {
      scoreForm.enable();
    }
  }

  async loadTournaments(): Promise<void> {
    this.isLoading = true;
    try {
      // First get all tournaments
      const tournaments = await this.tournamentService.getAllTournaments().toPromise() || [];
      
      // For each tournament, get the games and calculate count
      const tournamentsWithCounts = await Promise.all(
        tournaments.map(async tournament => {
          const games = await this.tournamentService.getTournamentGames(tournament.id).pipe(
            catchError(error => {
              console.error(`Error loading games for tournament ${tournament.id}:`, error);
              return of([]);
            })
          ).toPromise();
          return {
            ...tournament,
            gameCount: games?.length || 0
          };
        })
      );

      // Sort tournaments by creation date (newest first)
      this.tournaments = tournamentsWithCounts.sort((a, b) => 
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
      this.collectionSize = this.tournaments.length;
    } catch (error) {
      console.error('Error loading tournaments:', error);
      this.tournaments = [];
      this.collectionSize = 0;
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  viewTournament(tournamentId: string | undefined, event?: Event): void {
    if (!tournamentId) return;
    
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    // Navigate to the tournament detail view using absolute path
    this.router.navigate(['/tournaments/tournament', tournamentId]);
  }

  async createNewTournament(): Promise<void> {
    await this.router.navigate(['tournaments', 'create'], { relativeTo: this.route.parent });
    this.currentView = 'create';
    await Promise.all([
      this.loadPlayers(),
      this.loadTeams()
    ]);
  }

  async deleteTournament(tournamentId: string, event: Event): Promise<void> {
    event.stopPropagation();
    
    const modalRef = this.modalService.open(ConfirmDialogComponent, {
      centered: true,
      backdrop: 'static'
    });
    
    modalRef.componentInstance.title = 'Delete Tournament';
    modalRef.componentInstance.message = 'Are you sure you want to delete this tournament? This action cannot be undone.';
    modalRef.componentInstance.confirmText = 'Delete';
    modalRef.componentInstance.confirmButtonClass = 'btn-danger';
    
    try {
      const result = await modalRef.result;
      if (result === 'confirm') {
        this.isLoading = true;
        await this.tournamentService.deleteTournament(tournamentId).toPromise();
        
        // Remove the deleted tournament from the list
        this.tournaments = this.tournaments.filter(t => t.id !== tournamentId);
        this.collectionSize = this.tournaments.length;
      }
    } catch (error) {
      // Handle modal dismiss (user clicked cancel or backdrop)
      console.log('Deletion cancelled');
    } finally {
      this.isLoading = false;
    }
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
    this.isSubmitting = true;
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
      
      // Wait for stats to load before navigating
      await this.loadTournamentStats();
      
      // Reset form and state
      this.tournamentForm.reset();
      this.selectedPlayers = [];
      this.playerSelections = [];
      
      // Update view after a small delay to ensure UI updates
      setTimeout(() => {
        this.currentView = 'tournament';
        this.cdr.detectChanges();
      }, 100);
      
    } catch (error) {
      console.error('Error creating tournament:', error);
      alert('Failed to create tournament. Please try again.');
    } finally {
      this.isLoading = false;
      this.isSubmitting = false;
      this.cdr.detectChanges();
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
