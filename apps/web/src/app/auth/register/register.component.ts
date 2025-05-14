import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';
import { MaterialModule } from '../../shared/material.module';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, RouterLink],
  template: `
    <div class="register-container">
      <mat-card class="register-card">
        <mat-card-header>
          <mat-card-title>Register</mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Full Name</mat-label>
              <input matInput formControlName="name" placeholder="Enter your full name" />
              <mat-error *ngIf="registerForm.get('name')?.hasError('required')"
                >Full name is required</mat-error
              >
              <mat-error *ngIf="registerForm.get('name')?.hasError('minlength')"
                >Name must be at least 2 characters</mat-error
              >
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" placeholder="Enter your email" type="email" />
              <mat-error *ngIf="registerForm.get('email')?.hasError('required')"
                >Email is required</mat-error
              >
              <mat-error *ngIf="registerForm.get('email')?.hasError('email')"
                >Please enter a valid email</mat-error
              >
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input
                matInput
                formControlName="password"
                placeholder="Enter your password"
                [type]="hidePassword ? 'password' : 'text'"
              />
              <button
                mat-icon-button
                matSuffix
                (click)="hidePassword = !hidePassword"
                type="button"
              >
                <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <mat-error *ngIf="registerForm.get('password')?.hasError('required')"
                >Password is required</mat-error
              >
              <mat-error *ngIf="registerForm.get('password')?.hasError('minlength')"
                >Password must be at least 6 characters</mat-error
              >
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Confirm Password</mat-label>
              <input
                matInput
                formControlName="confirmPassword"
                placeholder="Confirm your password"
                [type]="hideConfirmPassword ? 'password' : 'text'"
              />
              <button
                mat-icon-button
                matSuffix
                (click)="hideConfirmPassword = !hideConfirmPassword"
                type="button"
              >
                <mat-icon>{{ hideConfirmPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <mat-error *ngIf="registerForm.get('confirmPassword')?.hasError('required')"
                >Confirm password is required</mat-error
              >
              <mat-error *ngIf="registerForm.get('confirmPassword')?.hasError('mustMatch')"
                >Passwords must match</mat-error
              >
            </mat-form-field>

            <div class="form-actions">
              <button
                mat-raised-button
                color="primary"
                type="submit"
                [disabled]="registerForm.invalid || isLoading"
              >
                <mat-spinner diameter="20" *ngIf="isLoading"></mat-spinner>
                <span *ngIf="!isLoading">Register</span>
              </button>
            </div>
          </form>
        </mat-card-content>

        <mat-card-actions>
          <p>Already have an account? <a [routerLink]="['/login']">Login</a></p>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .register-container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: calc(100vh - 64px);
        background-color: #f5f5f5;
      }

      .register-card {
        width: 100%;
        max-width: 400px;
        padding: 20px;
      }

      .full-width {
        width: 100%;
        margin-bottom: 15px;
      }

      .form-actions {
        display: flex;
        justify-content: flex-end;
        margin-top: 20px;
      }

      mat-card-actions {
        display: flex;
        justify-content: center;
        padding: 16px;
      }
    `,
  ],
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  hidePassword = true;
  hideConfirmPassword = true;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private toastService: ToastService
  ) {
    this.registerForm = this.formBuilder.group(
      {
        name: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      {
        validators: this.mustMatch('password', 'confirmPassword'),
      }
    );
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }

    this.isLoading = true;

    const userData = {
      name: this.registerForm.value.name,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
    };

    this.authService.register(userData).subscribe({
      next: () => {
        this.toastService.success('Registration successful. Please log in.');
        this.router.navigate(['/login']);
      },
      error: error => {
        console.error('Registration error', error);
        this.isLoading = false;
      },
    });
  }

  // Custom validator to check if password and confirm password match
  mustMatch(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];

      // Return if controls are not found (e.g., form not yet initialized)
      if (!control || !matchingControl) {
        return;
      }

      if (matchingControl.errors && !matchingControl.errors['mustMatch']) {
        return;
      }

      // Set error on matchingControl if validation fails
      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ mustMatch: true });
      } else {
        matchingControl.setErrors(null);
      }
    };
  }
}
