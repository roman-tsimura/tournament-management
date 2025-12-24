import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    RouterLink, 
    RouterLinkActive,
    NgbCollapseModule
  ],
  template: `
    <div class="container">
      <nav class="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
        <div class="container-fluid">
          <a class="navbar-brand" routerLink="/">Tournament Manager</a>
          <button class="navbar-toggler" type="button" (click)="isNavCollapsed = !isNavCollapsed" [attr.aria-expanded]="!isNavCollapsed" aria-controls="navbarNav">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" [ngbCollapse]="isNavCollapsed" id="navbarNav">
            <ul class="navbar-nav">
              <li class="nav-item">
                <a class="nav-link" [routerLink]="['/tournaments']" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Tournaments</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" [routerLink]="['/players']" routerLinkActive="active">Players</a>
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
    .app-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    
    .app-content {
      flex: 1;
    }
    
    .app-footer {
      margin-top: auto;
    }
    
    .navbar {
      box-shadow: 0 2px 4px rgba(0,0,0,.1);
    }
    
    .nav-link {
      padding: 0.5rem 1rem;
      transition: all 0.2s;
    }
    
    .nav-link:hover {
      opacity: 0.9;
    }
    
    .nav-link i {
      width: 1.2em;
      text-align: center;
    }
  `]
})
export class AppComponent {
  title = 'Tournament Manager';
  isNavCollapsed = true;
}