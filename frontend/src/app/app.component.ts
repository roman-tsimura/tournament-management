import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="container">
      <nav class="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
        <div class="container-fluid">
          <a class="navbar-brand" href="#" routerLink="/">Tournament Manager</a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav">
              <li class="nav-item">
                <a class="nav-link" [routerLink]="['/players']" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Players</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" [routerLink]="['/teams']" routerLinkActive="active">Teams</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <main>
        <router-outlet></router-outlet>
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