import { Routes } from '@angular/router';
import { PlayersComponent } from './players/players.component';
import { TeamsComponent } from './teams/teams.component';

export const routes: Routes = [
  { path: 'players', component: PlayersComponent },
  { path: 'teams', component: TeamsComponent },
  { path: '', redirectTo: '/players', pathMatch: 'full' },
  { path: '**', redirectTo: '/players' }
];
