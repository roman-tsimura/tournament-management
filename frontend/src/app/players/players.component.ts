import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlayerService } from '../services/player.service';
import { Player } from '../models/player.model';

@Component({
  selector: 'app-players',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './players.component.html',
  styleUrls: ['./players.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlayersComponent implements OnInit {
  players: Player[] = [];
  loading = false;
  error: string | null = null;
  showAddForm = false;
  editingPlayer: Player | null = null;

  newPlayer: Player = {
    name: ''
  };
  
  currentPlayerName = '';

  constructor(
    private playerService: PlayerService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadPlayers();
  }

  loadPlayers(): void {
    this.loading = true;
    this.error = null;

    this.playerService.getPlayers().subscribe({
      next: (data) => {
        this.players = [...data];
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.error = 'Failed to load players. Please try again later.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  showAddPlayerForm(): void {
    this.showAddForm = true;
    this.editingPlayer = null;
    this.currentPlayerName = '';
  }

  cancelForm(): void {
    this.showAddForm = false;
    this.editingPlayer = null;
    this.currentPlayerName = '';
    this.error = null;
  }

  addPlayer(): void {
    if (!this.currentPlayerName) return;

    this.loading = true;
    
    if (this.editingPlayer) {
      this.playerService.updatePlayer(this.editingPlayer.id!, { name: this.currentPlayerName })
        .subscribe({
          next: (player) => this.handleSaveSuccess(),
          error: (err) => this.handleSaveError(err, 'update')
        });
    } else {
      this.playerService.createPlayer({ name: this.currentPlayerName })
        .subscribe({
          next: (player) => this.handleSaveSuccess(),
          error: (err) => this.handleSaveError(err, 'add')
        });
    }

  }

  private handleSaveSuccess(): void {
    this.loadPlayers();
    this.showAddForm = false;
    this.editingPlayer = null;
    this.currentPlayerName = '';
  }

  private handleSaveError(err: any, action: 'add' | 'update'): void {
    this.error = `Failed to ${action} player: ${err.message || 'Unknown error'}`;
    this.loading = false;
    this.cdr.markForCheck();
  }

  editPlayer(player: Player): void {
    this.editingPlayer = { ...player };
    this.currentPlayerName = player.name;
    this.showAddForm = true;
  }

  updatePlayer(): void {
    if (!this.editingPlayer) return;

    this.loading = true;
    this.error = null;
    
    this.playerService.updatePlayer(this.editingPlayer.id!, this.editingPlayer).subscribe({
      next: (updatedPlayer) => {
        try {
          const index = this.players.findIndex(p => p.id === updatedPlayer.id);
          if (index !== -1) {
            this.players[index] = updatedPlayer;
            this.players = [...this.players];
          }
          this.cancelEdit();
        } catch (error) {
          this.error = 'Error processing player update';
        } finally {
          this.loading = false;
          this.cdr.markForCheck();
        }
      },
      error: (err) => {
        this.error = 'Failed to update player';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  deletePlayer(id: number): void {
    if (!confirm('Are you sure you want to delete this player?')) return;

    this.loading = true;
    this.error = null;
    
    this.playerService.deletePlayer(id).subscribe({
      next: () => {
        try {
          this.players = this.players.filter(p => p.id !== id);
          this.cdr.markForCheck();
        } catch (error) {
          this.error = 'Error processing player deletion';
        } finally {
          this.loading = false;
          this.cdr.markForCheck();
        }
      },
      error: (err) => {
        this.error = 'Failed to delete player';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  cancelEdit(): void {
    this.editingPlayer = null;
    this.showAddForm = false;
    this.cdr.markForCheck();
  }
}