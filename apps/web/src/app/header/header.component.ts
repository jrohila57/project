import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MaterialModule } from '../shared/material.module';
import { AuthService } from '../shared/services/auth.service';

interface User {
  id: string;
  name: string;
  email: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MaterialModule, RouterLink, RouterLinkActive],
  template: `
    <header class="header">
      <mat-toolbar color="primary">
        <div class="logo-container">
          <a [routerLink]="['/']" class="logo">TodoApp</a>
        </div>

        <!-- Navigation links -->
        <div class="nav-links" *ngIf="isLoggedIn">
          <a mat-button [routerLink]="['/dashboard']" routerLinkActive="active">Dashboard</a>
          <a mat-button [routerLink]="['/projects']" routerLinkActive="active">Projects</a>
          <a mat-button [routerLink]="['/todos']" routerLinkActive="active">Tasks</a>
        </div>

        <span class="spacer"></span>

        <!-- User menu -->
        <div *ngIf="isLoggedIn" class="user-menu">
          <button mat-button [matMenuTriggerFor]="userMenu" class="user-button">
            <mat-icon>account_circle</mat-icon>
            <span>{{ currentUser?.name || 'User' | titlecase }}</span>
          </button>

          <mat-menu #userMenu="matMenu">
            <a mat-menu-item [routerLink]="['/profile']">
              <mat-icon>person</mat-icon>
              <span>Profile</span>
            </a>
            <a mat-menu-item [routerLink]="['/settings']">
              <mat-icon>settings</mat-icon>
              <span>Settings</span>
            </a>
            <mat-divider></mat-divider>
            <button mat-menu-item (click)="logout()">
              <mat-icon>exit_to_app</mat-icon>
              <span>Logout</span>
            </button>
          </mat-menu>
        </div>

        <!-- Login/Register buttons -->
        <div *ngIf="!isLoggedIn" class="auth-buttons">
          <a mat-button [routerLink]="['/login']">Login</a>
          <a mat-raised-button color="accent" [routerLink]="['/register']">Register</a>
        </div>
      </mat-toolbar>
    </header>
  `,
  styles: [
    `
      .header {
        position: sticky;
        top: 0;
        z-index: 1000;
      }

      .logo-container {
        margin-right: 20px;
      }

      .logo {
        text-decoration: none;
        color: white;
        font-size: 1.5rem;
        font-weight: bold;
        display: flex;
        align-items: center;
      }

      .nav-links {
        display: flex;
      }

      .nav-links a {
        margin-right: 8px;
      }

      .spacer {
        flex: 1 1 auto;
      }

      .user-button {
        display: flex;
        align-items: center;
      }

      .user-button mat-icon {
        margin-right: 4px;
      }

      .auth-buttons {
        display: flex;
        gap: 8px;
      }

      .active {
        background-color: rgba(255, 255, 255, 0.2);
      }
    `,
  ],
})
export class HeaderComponent implements OnInit {
  isLoggedIn = false;
  currentUser: Partial<User> | null = null;

  constructor(private authService: AuthService) {
    console.log('HeaderComponent constructor called');
  }

  ngOnInit(): void {
    console.log('HeaderComponent initialized');
    
    this.authService.isAuthenticated$.subscribe(
      isAuthenticated => {
        console.log('Auth state changed:', isAuthenticated);
        this.isLoggedIn = isAuthenticated;
      }
    );

    this.authService.currentUser$.subscribe(user => {
      console.log('Current user:', user);
      this.currentUser = user;
    });
  }

  logout(): void {
    console.log('Logout clicked');
    this.authService.logout();
  }
}
