import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TeamService } from '../services/team.service';
import { Team } from '../models/team.model';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TeamsComponent implements OnInit {
  teams: Team[] = [];
  loading = false;
  error: string | null = null;
  showAddForm = false;
  editingTeam: Team | null = null;

  newTeam: Team = {
    name: ''
  };

  constructor(
    private teamService: TeamService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadTeams();
  }

  loadTeams(): void {
    this.loading = true;
    this.error = null;

    this.teamService.getTeams().subscribe({
      next: (data) => {
        this.teams = [...data];
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.error = 'Failed to load teams. Please try again later.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  showAddTeamForm(): void {
    this.editingTeam = null;
    this.newTeam = { name: '' };
    this.showAddForm = true;
  }

  showEditTeamForm(team: Team): void {
    this.editingTeam = { ...team };
    this.showAddForm = true;
  }

  cancelForm(): void {
    this.showAddForm = false;
    this.editingTeam = null;
  }

  get currentTeamName(): string {
    return this.editingTeam ? this.editingTeam.name : this.newTeam.name;
  }

  set currentTeamName(value: string) {
    if (this.editingTeam) {
      this.editingTeam.name = value;
    } else {
      this.newTeam.name = value;
    }
  }

  saveTeam(): void {
    if (this.editingTeam) {
      this.updateTeam();
    } else {
      this.createTeam();
    }
  }

  createTeam(): void {
    if (!this.newTeam.name) {
      this.error = 'Team name is required';
      return;
    }

    this.loading = true;
    this.teamService.createTeam(this.newTeam).subscribe({
      next: (createdTeam) => {
        this.teams = [...this.teams, createdTeam];
        this.showAddForm = false;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.error = 'Failed to create team. Please try again.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  updateTeam(): void {
    if (!this.editingTeam?.id || !this.editingTeam.name) {
      this.error = 'Team ID and name are required';
      return;
    }

    this.loading = true;
    this.teamService.updateTeam(this.editingTeam.id, this.editingTeam).subscribe({
      next: (updatedTeam) => {
        const index = this.teams.findIndex(t => t.id === updatedTeam.id);
        if (index !== -1) {
          this.teams = [
            ...this.teams.slice(0, index),
            updatedTeam,
            ...this.teams.slice(index + 1)
          ];
        }
        this.showAddForm = false;
        this.editingTeam = null;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.error = 'Failed to update team. Please try again.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  deleteTeam(id: number): void {
    if (!confirm('Are you sure you want to delete this team?')) {
      return;
    }

    this.loading = true;
    this.teamService.deleteTeam(id).subscribe({
      next: () => {
        this.teams = this.teams.filter(team => team.id !== id);
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.error = 'Failed to delete team. Please try again.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }
}
