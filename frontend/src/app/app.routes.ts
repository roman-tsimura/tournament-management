import { Routes } from '@angular/router';
import { PlayersComponent } from './players/players.component';
import { TeamsComponent } from './teams/teams.component';
import { TournamentsComponent } from './tournaments/tournaments.component';

export const routes: Routes = [
  { 
    path: 'tournaments', 
    component: TournamentsComponent,
    title: 'Tournaments'
  },
  { 
    path: 'players', 
    component: PlayersComponent,
    title: 'Players'
  },
  { 
    path: 'teams', 
    component: TeamsComponent,
    title: 'Teams'
  },
  { 
    path: '', 
    redirectTo: '/tournaments',
    pathMatch: 'full' 
  },
  { 
    path: '**', 
    redirectTo: '/tournaments'
  }
];
