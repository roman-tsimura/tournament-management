import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { PlayersComponent } from './players/players.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, PlayersComponent],
  template: `
    <div class="container">
      <nav class="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
        <div class="container-fluid">
          <a class="navbar-brand" href="#">Tournament Manager</a>
        </div>
      </nav>
      <main>
        <router-outlet></router-outlet>
        <app-players></app-players>
      </main>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 15px;
    }
    .navbar {
      margin-bottom: 2rem;
      border-radius: 0.25rem;
    }
  `]
})
export class AppComponent {
  title = 'Tournament Manager';
}