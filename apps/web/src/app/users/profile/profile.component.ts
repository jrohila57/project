import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialModule } from '../../shared/material.module';
import { AuthService } from '../../shared/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';
import { HttpClient } from '@angular/common/http';

// Local interface to replace @shared/interfaces
interface User {
  id: string;
  email: string;
  name: string;
  bio?: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
  template: `
    <div class="profile-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>My Profile</mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <div class="loading-indicator" *ngIf="isLoading">
            <mat-spinner diameter="40"></mat-spinner>
          </div>

          <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" *ngIf="!isLoading">
            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Email</mat-label>
                <input matInput formControlName="email" placeholder="Email" readonly />
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Full Name</mat-label>
                <input matInput formControlName="name" placeholder="Full Name" />
                <mat-error *ngIf="profileForm.get('name')?.hasError('required')"
                  >Name is required</mat-error
                >
                <mat-error *ngIf="profileForm.get('name')?.hasError('minlength')"
                  >Name must be at least 2 characters</mat-error
                >
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Bio</mat-label>
                <textarea
                  matInput
                  formControlName="bio"
                  placeholder="Tell us about yourself"
                  rows="4"
                ></textarea>
              </mat-form-field>
            </div>

            <div class="form-row action-buttons">
              <button mat-button type="button" (click)="resetForm()">Cancel</button>
              <button
                mat-raised-button
                color="primary"
                type="submit"
                [disabled]="profileForm.invalid || isSaving"
              >
                <mat-spinner diameter="20" *ngIf="isSaving"></mat-spinner>
                <span *ngIf="!isSaving">Save Changes</span>
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .profile-container {
        max-width: 800px;
        margin: 20px auto;
        padding: 0 20px;
      }

      .form-row {
        margin-bottom: 20px;
      }

      .full-width {
        width: 100%;
      }

      .action-buttons {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
      }

      .loading-indicator {
        display: flex;
        justify-content: center;
        padding: 40px;
      }
    `,
  ],
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  isLoading = true;
  isSaving = false;
  userId: string | null = null;
  user: Partial<User> | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private authService: AuthService,
    private toastService: ToastService
  ) {
    this.profileForm = this.formBuilder.group({
      email: [{ value: '', disabled: true }],
      name: ['', [Validators.required, Validators.minLength(2)]],
      bio: [''],
    });
  }

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();

    if (this.user?.id) {
      this.userId = this.user.id;
      this.loadUserProfile();
    } else {
      this.isLoading = false;
      this.toastService.error('Unable to load user profile');
    }
  }

  loadUserProfile(): void {
    if (!this.userId) return;

    this.http.get<User>(`http://localhost:3000/api/users/${this.userId}`).subscribe({
      next: user => {
        this.profileForm.patchValue({
          email: user.email,
          name: user.name,
          bio: user.bio || '',
        });
        this.isLoading = false;
      },
      error: error => {
        console.error('Error loading user profile', error);
        this.isLoading = false;
        this.toastService.error('Failed to load profile data');
      },
    });
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      return;
    }

    this.isSaving = true;

    const userData = {
      name: this.profileForm.value.name,
      bio: this.profileForm.value.bio,
    };

    this.http.patch<User>(`http://localhost:3000/api/users/${this.userId}`, userData).subscribe({
      next: updatedUser => {
        // Update user in auth service/local storage
        const currentUser = this.authService.getCurrentUser();
        if (currentUser) {
          localStorage.setItem(
            'user_data',
            JSON.stringify({
              ...currentUser,
              name: updatedUser.name,
              bio: updatedUser.bio,
            })
          );
        }

        this.toastService.success('Profile updated successfully');
        this.isSaving = false;
      },
      error: error => {
        console.error('Error updating profile', error);
        this.toastService.error('Failed to update profile');
        this.isSaving = false;
      },
    });
  }

  resetForm(): void {
    this.loadUserProfile();
  }
}
