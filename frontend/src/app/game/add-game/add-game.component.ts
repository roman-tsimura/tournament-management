import {Component, EventEmitter, Input, Output, OnInit, ChangeDetectorRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { Game, AddGameRequest } from '../../models/tournament.model';
import { PlayerService } from '../../services/player.service';
import { TeamService } from '../../services/team.service';
import { TournamentService } from '../../services/tournament.service';
import { Player } from '../../models/player.model';
import { Team } from '../../models/team.model';

interface PlayerSelection {
  id: string | number;
  name: string;
}

interface TeamSelection {
  id: string;
  name: string;
}

@Component({
  selector: 'app-add-game',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbTypeaheadModule],
  templateUrl: './add-game.component.html',
  styleUrls: ['./add-game.component.scss']
})
export class AddGameComponent implements OnInit {
  @Input() tournamentId: string = '';
  @Output() gameAdded = new EventEmitter<Game>();
  
  gameForm: FormGroup;
  players: Player[] = [];
  teams: Team[] = [];
  availablePlayers: PlayerSelection[] = [];
  availableTeams: TeamSelection[] = [];
  isSubmitting = false;
  isLoading = true;
  playersLoaded = false;
  teamsLoaded = false;
  homePlayerTeams: TeamSelection[] = [];
  awayPlayerTeams: TeamSelection[] = [];

  constructor(
    private fb: FormBuilder,
    private playerService: PlayerService,
    private teamService: TeamService,
    private tournamentService: TournamentService,
    private cdr: ChangeDetectorRef
  ) {
    this.gameForm = this.fb.group({
      homePlayerId: ['', Validators.required],
      homeTeamId: ['', Validators.required],
      guestPlayerId: ['', [Validators.required, this.differentPlayerValidator('homePlayerId')]],
      guestTeamId: ['', [Validators.required, this.differentTeamValidator('homeTeamId')]]
    });
  }

  // Compare function for player dropdowns
  comparePlayers(player1: Player | null, player2: Player | null): boolean {
    return player1 && player2 ? player1.id === player2.id : player1 === player2;
  }

  // Compare function for team dropdowns
  compareTeams(team1: Team | null, team2: Team | null): boolean {
    return team1 && team2 ? team1.id === team2.id : team1 === team2;
  }

  ngOnInit(): void {
    this.loadPlayersAndTeams();
    
    // Update available teams when player selection changes
    this.gameForm.get('homePlayerId')?.valueChanges.subscribe((player: Player) => {
      if (player) {
        this.onPlayerSelected(player, 'home');
      } else {
        this.homePlayerTeams = [];
        this.gameForm.get('homeTeamId')?.reset();
      }
    });
    
    this.gameForm.get('guestPlayerId')?.valueChanges.subscribe((player: Player) => {
      if (player) {
        this.onPlayerSelected(player, 'away');
      } else {
        this.awayPlayerTeams = [];
        this.gameForm.get('guestTeamId')?.reset();
      }
    });
  }

  private loadPlayersAndTeams(): void {

    // Use Promise.all to load players and teams in parallel
    Promise.all([
      this.playerService.getPlayers().toPromise(),
      this.teamService.getTeams().toPromise()
    ]).then(([players, teams]) => {
      // Process players
      if (players) {
        this.players = players;
        this.availablePlayers = players.map(p => ({
          id: p.id || 0,
          name: p.name || ''
        }));
      }
      
      // Process teams
      if (teams) {
        this.teams = teams;
        this.availableTeams = teams.map(t => ({
          id: t.id?.toString() || '',
          name: t.name?.trim() || 'Unnamed Team'
        }));
      }
      
      this.playersLoaded = true;
      this.teamsLoaded = true;
      this.isLoading = false;
    }).catch(error => {
      console.error('Error loading data:', error);
      this.playersLoaded = true;
      this.teamsLoaded = true;
      this.isLoading = false;
    });
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
  
  onPlayerSelected(player: Player, playerType: 'home' | 'away'): void {
    if (!player) {
      if (playerType === 'home') {
        this.homePlayerTeams = [];
        this.gameForm.get('homeTeamId')?.reset();
      } else {
        this.awayPlayerTeams = [];
        this.gameForm.get('awayTeamId')?.reset();
      }
      return;
    }

    // For simplicity, we'll show all available teams
    // In a real app, you might want to filter teams based on the player
    const teams = [...this.availableTeams];

    if (playerType === 'home') {
      this.homePlayerTeams = teams;
      // Auto-select the first team if only one is available
      if (teams.length === 1) {
        this.gameForm.patchValue({ homeTeamId: teams[0] });
      }
    } else {
      this.awayPlayerTeams = teams;
      // Auto-select the first team if only one is available
      if (teams.length === 1) {
        this.gameForm.patchValue({ guestTeamId: teams[0] });
      }
    }
  }

  onRandomizePlayer(side: 'home' | 'away'): void {
    const otherPlayerId = side === 'home' 
      ? this.gameForm.get('guestPlayerId')?.value?.id 
      : this.gameForm.get('homePlayerId')?.value?.id;
      
    const availablePlayers = otherPlayerId
      ? this.availablePlayers.filter(p => p.id !== otherPlayerId)
      : this.availablePlayers;
      
    if (availablePlayers.length === 0) return;
    
    const randomIndex = Math.floor(Math.random() * availablePlayers.length);
    const randomPlayer = availablePlayers[randomIndex];
    this.gameForm.get(`${side}PlayerId`)?.setValue(randomPlayer);
  }
  
  onRandomizeTeam(playerType: 'home' | 'away'): void {
    const teams = playerType === 'home' ? this.homePlayerTeams : this.awayPlayerTeams;
    if (teams.length === 0) {
      return;
    }
    
    // Get the other team (if any)
    const otherTeamControl = playerType === 'home' ? 'guestTeamId' : 'homeTeamId';
    const otherTeam = this.gameForm.get(otherTeamControl)?.value;
    
    // Filter out the other selected team (if any)
    const availableTeams = teams.filter(
      team => !otherTeam || team.id !== otherTeam.id
    );
    
    if (availableTeams.length === 0) {
      return;
    }
    
    // Select a random team
    const randomIndex = Math.floor(Math.random() * availableTeams.length);
    const randomTeam = availableTeams[randomIndex];
    
    // Update the form with the random team
    this.gameForm.get(playerType === 'home' ? 'homeTeamId' : 'guestTeamId')?.setValue(randomTeam);
  }

  onSubmit(): void {
    if (this.gameForm.invalid || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    
    const formValue = this.gameForm.value;
    const gameData: AddGameRequest = {
      tournamentId: this.tournamentId,
      homePlayerId: formValue.homePlayerId.id,
      homeTeamId: formValue.homeTeamId.id,
      guestPlayerId: formValue.guestPlayerId.id,
      guestTeamId: formValue.guestTeamId.id,
      homeScore: 0,  // Default to 0, can be updated later
      guestScore: 0,  // Default to 0, can be updated later
      status: 'scheduled'
    };

    this.tournamentService.addGame(this.tournamentId, gameData).subscribe({
      next: (game) => {
        this.gameAdded.emit(game);
        this.gameForm.reset();
        this.homePlayerTeams = [];
        this.awayPlayerTeams = [];
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error adding game:', error);
        this.isSubmitting = false;
      }
    });
  }
}
