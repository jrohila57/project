import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';

/**
 * Main application component that serves as the root component
 * Uses standalone component pattern
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  template: `
    <div class="app-container">
      <app-header></app-header>
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [
    `
      .app-container {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
      }
      .main-content {
        flex: 1;
        padding: 20px;
        background-color: #f5f5f5;
      }
    `,
  ],
})
export class AppComponent implements OnInit {
  ngOnInit() {
    console.log('AppComponent initialized');
  }
}
