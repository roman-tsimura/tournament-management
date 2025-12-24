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
    console.log('Loading players...');

    this.playerService.getPlayers().subscribe({
      next: (data) => {
        console.log('Players loaded:', data);
        this.players = [...data];
        this.loading = false;
        this.cdr.markForCheck(); // Use markForCheck instead of detectChanges
      },
      error: (err) => {
        console.error('Error loading players:', err);
        this.error = 'Failed to load players. Please try again later.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  addPlayer(): void {
    if (!this.newPlayer.name) return;

    this.loading = true;
    this.playerService.createPlayer(this.newPlayer).subscribe({
      next: (player) => {
        console.log('Player added successfully, reloading players...');
        // Instead of trying to update the array directly,
        // reload the entire players list from the server
        this.loadPlayers();
        this.newPlayer = { name: '' };
        this.showAddForm = false;
      },
      error: (err) => {
        console.error('Error adding player:', err);
        this.error = `Failed to add player: ${err.message || 'Unknown error'}`;
        this.loading = false;
      }
    });
  }

  editPlayer(player: Player): void {
    this.editingPlayer = { ...player };
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
          console.error('Error processing update:', error);
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
        console.error('Error updating player:', err);
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
          console.error('Error processing deletion:', error);
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
        console.error('Error deleting player:', err);
      }
    });
  }

  cancelEdit(): void {
    this.editingPlayer = null;
    this.cdr.detectChanges();
  }
}