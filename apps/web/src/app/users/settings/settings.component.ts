import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../shared/material.module';
import { AuthService } from '../../shared/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';
import { HttpClient } from '@angular/common/http';

// Local interfaces to replace @shared/interfaces
interface User {
  id: string;
  email: string;
  name: string;
  theme: UserTheme;
  defaultSort: UserSort;
  showCompletedTodos: boolean;
  notificationsEnabled: boolean;
}

type UserTheme = 'light' | 'dark' | 'system';
type UserSort = 'priority' | 'dueDate' | 'createdAt' | 'title';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
  template: `
    <div class="settings-container">
      <div class="settings-header">
        <h1>Settings</h1>
      </div>

      <div class="settings-content">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Preferences</mat-card-title>
          </mat-card-header>

          <mat-card-content>
            <div class="loading-indicator" *ngIf="isLoading">
              <mat-spinner diameter="40"></mat-spinner>
            </div>

            <form [formGroup]="settingsForm" (ngSubmit)="onSubmit()" *ngIf="!isLoading">
              <div class="form-section">
                <h3>Appearance</h3>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Theme</mat-label>
                  <mat-select formControlName="theme">
                    <mat-option value="light">Light</mat-option>
                    <mat-option value="dark">Dark</mat-option>
                    <mat-option value="system">System Default</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>

              <mat-divider></mat-divider>

              <div class="form-section">
                <h3>Task Preferences</h3>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Default Sort</mat-label>
                  <mat-select formControlName="defaultSort">
                    <mat-option value="priority">Priority</mat-option>
                    <mat-option value="dueDate">Due Date</mat-option>
                    <mat-option value="createdAt">Creation Date</mat-option>
                    <mat-option value="title">Title</mat-option>
                  </mat-select>
                </mat-form-field>

                <div class="toggle-option">
                  <mat-slide-toggle formControlName="showCompletedTodos">
                    Show completed tasks by default
                  </mat-slide-toggle>
                </div>
              </div>

              <mat-divider></mat-divider>

              <div class="form-section">
                <h3>Notifications</h3>

                <div class="toggle-option">
                  <mat-slide-toggle formControlName="notificationsEnabled">
                    Enable notifications
                  </mat-slide-toggle>
                </div>
              </div>

              <div class="form-actions">
                <button mat-button type="button" (click)="resetForm()">Cancel</button>
                <button
                  mat-raised-button
                  color="primary"
                  type="submit"
                  [disabled]="settingsForm.pristine || isSaving"
                >
                  <mat-spinner diameter="20" *ngIf="isSaving"></mat-spinner>
                  <span *ngIf="!isSaving">Save Settings</span>
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [
    `
      .settings-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
      }

      .settings-header {
        margin-bottom: 20px;
      }

      .form-section {
        margin: 20px 0;
      }

      .full-width {
        width: 100%;
      }

      .toggle-option {
        margin: 20px 0;
      }

      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 20px;
      }

      .loading-indicator {
        display: flex;
        justify-content: center;
        padding: 40px;
      }

      mat-divider {
        margin: 30px 0;
      }
    `,
  ],
})
export class SettingsComponent implements OnInit {
  settingsForm: FormGroup;
  isLoading = true;
  isSaving = false;
  userId: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private authService: AuthService,
    private toastService: ToastService
  ) {
    this.settingsForm = this.formBuilder.group({
      theme: ['light'],
      defaultSort: ['priority'],
      showCompletedTodos: [true],
      notificationsEnabled: [true],
    });
  }

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();

    if (user?.id) {
      this.userId = user.id;
      this.loadUserSettings();
    } else {
      this.isLoading = false;
      this.toastService.error('Unable to load user settings');
    }
  }

  loadUserSettings(): void {
    if (!this.userId) return;

    this.http.get<User>(`http://localhost:3000/api/users/${this.userId}`).subscribe({
      next: user => {
        this.settingsForm.patchValue({
          theme: user.theme,
          defaultSort: user.defaultSort,
          showCompletedTodos: user.showCompletedTodos,
          notificationsEnabled: user.notificationsEnabled,
        });
        this.isLoading = false;
      },
      error: error => {
        console.error('Error loading user settings', error);
        this.isLoading = false;
        this.toastService.error('Failed to load settings data');
      },
    });
  }

  onSubmit(): void {
    if (this.settingsForm.pristine) {
      return;
    }

    this.isSaving = true;

    const settings = this.settingsForm.value;

    this.http.patch<User>(`http://localhost:3000/api/users/${this.userId}`, settings).subscribe({
      next: updatedUser => {
        // Update user in auth service/local storage
        const currentUser = this.authService.getCurrentUser();
        if (currentUser) {
          localStorage.setItem(
            'user_data',
            JSON.stringify({
              ...currentUser,
              theme: updatedUser.theme,
              defaultSort: updatedUser.defaultSort,
              showCompletedTodos: updatedUser.showCompletedTodos,
              notificationsEnabled: updatedUser.notificationsEnabled,
            })
          );
        }

        // Apply theme changes immediately if needed
        this.applyTheme(updatedUser.theme);

        this.toastService.success('Settings updated successfully');
        this.isSaving = false;
        this.settingsForm.markAsPristine();
      },
      error: error => {
        console.error('Error updating settings', error);
        this.toastService.error('Failed to update settings');
        this.isSaving = false;
      },
    });
  }

  resetForm(): void {
    this.loadUserSettings();
    this.settingsForm.markAsPristine();
  }

  private applyTheme(theme: UserTheme): void {
    // Simplified theme handling - in a real app this would interact with a theme service
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    } else if (theme === 'light') {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    } else {
      // System theme would check OS preference via media query
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.body.classList.add('dark-theme');
        document.body.classList.remove('light-theme');
      } else {
        document.body.classList.add('light-theme');
        document.body.classList.remove('dark-theme');
      }
    }
  }
}
