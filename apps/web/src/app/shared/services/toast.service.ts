import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private config: MatSnackBarConfig = {
    duration: 3000,
    horizontalPosition: 'right',
    verticalPosition: 'top',
  };

  constructor(private snackBar: MatSnackBar) {}

  success(message: string, action: string = 'Close'): void {
    this.config.panelClass = ['snackbar-success'];
    this.snackBar.open(message, action, this.config);
  }

  error(message: string, action: string = 'Close'): void {
    this.config.panelClass = ['snackbar-error'];
    this.snackBar.open(message, action, this.config);
  }

  info(message: string, action: string = 'Close'): void {
    this.config.panelClass = ['snackbar-info'];
    this.snackBar.open(message, action, this.config);
  }

  warning(message: string, action: string = 'Close'): void {
    this.config.panelClass = ['snackbar-warning'];
    this.snackBar.open(message, action, this.config);
  }
}
