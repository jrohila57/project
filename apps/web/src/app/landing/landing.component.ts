import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="landing-container">
      <h1>Welcome to the Angular Nest Monorepo App</h1>
      <p>This is a simple landing page to test routing</p>
      <div class="links">
        <a routerLink="/login" class="btn">Login</a>
        <a routerLink="/register" class="btn">Register</a>
        <a routerLink="/dashboard" class="btn">Dashboard</a>
      </div>
    </div>
  `,
  styles: [
    `
      .landing-container {
        text-align: center;
        padding: 40px;
        max-width: 800px;
        margin: 0 auto;
      }
      
      .links {
        display: flex;
        gap: 20px;
        justify-content: center;
        margin-top: 30px;
      }
      
      .btn {
        padding: 10px 20px;
        background-color: #3f51b5;
        color: white;
        text-decoration: none;
        border-radius: 4px;
        font-weight: 500;
      }
      
      .btn:hover {
        background-color: #303f9f;
      }
    `
  ]
})
export class LandingComponent {} 