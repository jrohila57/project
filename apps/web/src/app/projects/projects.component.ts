import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  MatDialogModule,
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

interface Project {
  id: string;
  name: string;
  description?: string;
  color?: string;
  totalTodos: number;
  completedTodos: number;
}

@Component({
  selector: 'app-project-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.isEdit ? 'Edit Project' : 'Create Project' }}</h2>
    <form [formGroup]="projectForm" (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Name</mat-label>
          <input matInput formControlName="name" placeholder="Project name" required />
          <mat-error *ngIf="projectForm.get('name')?.hasError('required')">
            Name is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea
            matInput
            formControlName="description"
            placeholder="Project description"
            rows="3"
          ></textarea>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Color</mat-label>
          <input
            matInput
            formControlName="color"
            placeholder="Color (hex)"
            pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
          />
          <mat-hint>Format: #RRGGBB</mat-hint>
          <mat-error *ngIf="projectForm.get('color')?.hasError('pattern')">
            Invalid hex color format
          </mat-error>
        </mat-form-field>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>Cancel</button>
        <button mat-raised-button color="primary" type="submit" [disabled]="projectForm.invalid">
          {{ data.isEdit ? 'Update' : 'Create' }}
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [
    `
      .full-width {
        width: 100%;
      }
    `,
  ],
})
export class ProjectDialogComponent {
  projectForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ProjectDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { project?: Project; isEdit: boolean }
  ) {
    this.projectForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      color: ['#1976d2', [Validators.pattern('^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$')]],
    });

    if (data.project) {
      this.projectForm.patchValue({
        name: data.project.name,
        description: data.project.description,
        color: data.project.color || '#1976d2',
      });
    }
  }

  onSubmit() {
    if (this.projectForm.valid) {
      this.dialogRef.close(this.projectForm.value);
    }
  }
}

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatChipsModule,
    RouterLink,
  ],
  template: `
    <div class="projects-container">
      <div class="header">
        <h1 class="mat-headline-4">My Projects</h1>
        <button mat-raised-button color="primary" (click)="openProjectDialog()">
          <mat-icon>add</mat-icon> New Project
        </button>
      </div>

      <div *ngIf="loading" class="loading-container">
        <mat-spinner></mat-spinner>
      </div>

      <div *ngIf="!loading && projects.length === 0" class="empty-state">
        <mat-icon class="empty-icon">folder</mat-icon>
        <h2>No projects yet</h2>
        <p>Create your first project to get started</p>
        <button mat-raised-button color="primary" (click)="openProjectDialog()">
          <mat-icon>add</mat-icon> Create Project
        </button>
      </div>

      <div *ngIf="!loading && projects.length > 0" class="projects-grid">
        <mat-card
          *ngFor="let project of projects"
          class="project-card"
          [ngStyle]="{
            'border-left': project.color ? '5px solid ' + project.color : '5px solid #1976d2',
          }"
        >
          <mat-card-header>
            <mat-card-title>{{ project.name }}</mat-card-title>
            <mat-card-subtitle *ngIf="project.description">{{
              project.description
            }}</mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <div class="project-stats">
              <span class="stat">
                <mat-icon>check_box</mat-icon> {{ project.completedTodos }}/{{
                  project.totalTodos
                }}
                completed
              </span>
            </div>
          </mat-card-content>

          <mat-card-actions align="end">
            <button mat-button color="primary" [routerLink]="['/projects', project.id, 'todos']">
              <mat-icon>visibility</mat-icon> View
            </button>
            <button mat-button (click)="openProjectDialog(project)">
              <mat-icon>edit</mat-icon> Edit
            </button>
            <button mat-button color="warn" (click)="deleteProject(project.id)">
              <mat-icon>delete</mat-icon> Delete
            </button>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styles: [
    `
      .projects-container {
        padding: 20px;
        max-width: 1200px;
        margin: 0 auto;
      }
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
      }
      .loading-container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 300px;
      }
      .empty-state {
        text-align: center;
        padding: 40px 20px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
      }
      .empty-icon {
        font-size: 64px;
        height: 64px;
        width: 64px;
        color: #bdbdbd;
      }
      .projects-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 24px;
      }
      .project-card {
        display: flex;
        flex-direction: column;
      }
      .project-stats {
        margin-top: 16px;
        display: flex;
        align-items: center;
      }
      .stat {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 14px;
        color: #666;
      }
    `,
  ],
})
export class ProjectsComponent implements OnInit {
  projects: Project[] = [];
  loading = true;

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadProjects();
  }

  loadProjects() {
    this.loading = true;
    this.http
      .get<Project[]>('http://localhost:3000/projects')
      .pipe(
        catchError(error => {
          this.snackBar.open('Failed to load projects', 'Dismiss', { duration: 3000 });
          console.error('Error loading projects:', error);
          return of([]);
        })
      )
      .subscribe(projects => {
        this.projects = projects;
        this.loading = false;
      });
  }

  openProjectDialog(project?: Project) {
    const dialogRef = this.dialog.open(ProjectDialogComponent, {
      width: '500px',
      data: { project, isEdit: !!project },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (project) {
          this.updateProject(project.id, result);
        } else {
          this.createProject(result);
        }
      }
    });
  }

  updateProject(id: string, project: Project) {
    this.http
      .patch<Project>(`http://localhost:3000/projects/${id}`, project)
      .pipe(
        catchError(error => {
          this.snackBar.open('Failed to update project', 'Dismiss', { duration: 3000 });
          console.error('Error updating project:', error);
          return of(null);
        })
      )
      .subscribe(() => {
        this.loadProjects();
      });
  }

  createProject(project: Project) {
    this.http
      .post<Project>('http://localhost:3000/projects', project)
      .pipe(
        catchError(error => {
          this.snackBar.open('Failed to create project', 'Dismiss', { duration: 3000 });
          console.error('Error creating project:', error);
          return of(null);
        })
      )
      .subscribe(() => {
        this.loadProjects();
      });
  }

  deleteProject(id: string) {
    this.http
      .delete<void>(`http://localhost:3000/projects/${id}`)
      .pipe(
        catchError(error => {
          this.snackBar.open('Failed to delete project', 'Dismiss', { duration: 3000 });
          console.error('Error deleting project:', error);
          return of(null);
        })
      )
      .subscribe(() => {
        this.loadProjects();
      });
  }
}
