import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, switchMap } from 'rxjs/operators';
import { of, Observable } from 'rxjs';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import {
  MatDialogModule,
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatBadgeModule } from '@angular/material/badge';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';

interface Todo {
  id: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  projectId: string;
  isPinned: boolean;
  isArchived: boolean;
  tags: string[];
}

interface Project {
  id: string;
  name: string;
  description?: string;
  color?: string;
}

@Component({
  selector: 'app-todo-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDialogModule,
    MatIconModule,
    MatDividerModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.isEdit ? 'Edit Task' : 'Create Task' }}</h2>
    <form [formGroup]="todoForm" (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Title</mat-label>
          <input matInput formControlName="title" placeholder="Task title" required />
          <mat-error *ngIf="todoForm.get('title')?.hasError('required')">
            Title is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea
            matInput
            formControlName="description"
            placeholder="Task description"
            rows="3"
          ></textarea>
        </mat-form-field>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Status</mat-label>
            <mat-select formControlName="status" required>
              <mat-option value="TODO">To Do</mat-option>
              <mat-option value="IN_PROGRESS">In Progress</mat-option>
              <mat-option value="DONE">Done</mat-option>
              <mat-option value="BLOCKED">Blocked</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Priority</mat-label>
            <mat-select formControlName="priority" required>
              <mat-option value="LOW">Low</mat-option>
              <mat-option value="MEDIUM">Medium</mat-option>
              <mat-option value="HIGH">High</mat-option>
              <mat-option value="URGENT">Urgent</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Due Date</mat-label>
            <input matInput [matDatepicker]="picker" formControlName="dueDate" />
            <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
          </mat-form-field>

          <mat-form-field appearance="outline" *ngIf="data.projects.length > 0">
            <mat-label>Project</mat-label>
            <mat-select formControlName="projectId" required>
              <mat-option *ngFor="let project of data.projects" [value]="project.id">
                {{ project.name }}
              </mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <div class="form-row checkbox-row">
          <mat-checkbox formControlName="isPinned">Pin this task</mat-checkbox>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Tags</mat-label>
          <mat-chip-grid #chipGrid formArrayName="tags">
            <mat-chip-row
              *ngFor="let tag of tags.controls; let i = index"
              [value]="tag.value"
              (removed)="removeTag(i)"
            >
              {{ tag.value }}
              <button matChipRemove>
                <mat-icon>cancel</mat-icon>
              </button>
            </mat-chip-row>
            <input
              placeholder="New tag..."
              [matChipInputFor]="chipGrid"
              [matChipInputSeparatorKeyCodes]="separatorKeysCodes"
              (matChipInputTokenEnd)="addTag($event)"
            />
          </mat-chip-grid>
        </mat-form-field>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>Cancel</button>
        <button mat-raised-button color="primary" type="submit" [disabled]="todoForm.invalid">
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
      .form-row {
        display: flex;
        gap: 16px;
        margin-bottom: 8px;
      }
      .form-row > * {
        flex: 1;
      }
      .checkbox-row {
        margin-top: 8px;
        margin-bottom: 16px;
      }
    `,
  ],
})
export class TodoDialogComponent {
  todoForm: FormGroup;
  separatorKeysCodes: number[] = [ENTER, COMMA];

  get tags() {
    return this.todoForm.get('tags') as FormArray;
  }

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<TodoDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      todo?: Todo;
      isEdit: boolean;
      projects: Project[];
      currentProjectId?: string;
    }
  ) {
    this.todoForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      status: ['TODO', Validators.required],
      priority: ['MEDIUM', Validators.required],
      dueDate: [null],
      projectId: [
        data.currentProjectId || (data.projects.length > 0 ? data.projects[0]!.id : ''),
        Validators.required,
      ],
      isPinned: [false],
      tags: this.fb.array([]),
    });

    if (data.todo) {
      this.todoForm.patchValue({
        title: data.todo.title,
        description: data.todo.description,
        status: data.todo.status,
        priority: data.todo.priority,
        dueDate: data.todo.dueDate ? new Date(data.todo.dueDate) : null,
        projectId: data.todo.projectId,
        isPinned: data.todo.isPinned,
      });

      // Add tags to form array
      if (data.todo.tags && data.todo.tags.length) {
        data.todo.tags.forEach(tag => {
          this.tags.push(this.fb.control(tag));
        });
      }
    }
  }

  addTag(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      this.tags.push(this.fb.control(value));
    }
    event.chipInput!.clear();
  }

  removeTag(index: number): void {
    this.tags.removeAt(index);
  }

  onSubmit() {
    if (this.todoForm.valid) {
      this.dialogRef.close(this.todoForm.value);
    }
  }
}

@Component({
  selector: 'app-todos',
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
    MatMenuModule,
    MatDividerModule,
    MatExpansionModule,
    MatBadgeModule,
    MatCheckboxModule,
  ],
  template: `
    <div class="todos-container">
      <div class="header">
        <div class="title-section">
          <h1 class="mat-headline-4">{{ projectName ? projectName + ' Tasks' : 'All Tasks' }}</h1>
          <div class="badge-container" *ngIf="!loading">
            <span class="todo-count" [ngClass]="{ 'has-items': todos.length > 0 }">
              {{ todos.length }} task{{ todos.length !== 1 ? 's' : '' }}
            </span>
          </div>
        </div>
        <button mat-raised-button color="primary" (click)="openTodoDialog()">
          <mat-icon>add</mat-icon> New Task
        </button>
      </div>

      <div *ngIf="loading" class="loading-container">
        <mat-spinner></mat-spinner>
      </div>

      <div *ngIf="!loading && todos.length === 0" class="empty-state">
        <mat-icon class="empty-icon">check_box_outline_blank</mat-icon>
        <h2>No tasks yet</h2>
        <p>Create your first task to get started</p>
        <button mat-raised-button color="primary" (click)="openTodoDialog()">
          <mat-icon>add</mat-icon> Create Task
        </button>
      </div>

      <div *ngIf="!loading && todos.length > 0" class="todos-list">
        <!-- Pinned Tasks -->
        <div *ngIf="pinnedTodos.length > 0" class="todo-section">
          <h2 class="section-title"><mat-icon>push_pin</mat-icon> Pinned Tasks</h2>
          <div class="todos-grid">
            <mat-card
              *ngFor="let todo of pinnedTodos"
              class="todo-card"
              [ngClass]="todo.status.toLowerCase()"
            >
              <div class="todo-header">
                <div class="todo-status-badge" [ngClass]="todo.status.toLowerCase()">
                  {{ getStatusLabel(todo.status) }}
                </div>
                <div class="todo-priority-badge" [ngClass]="todo.priority.toLowerCase()">
                  {{ todo.priority }}
                </div>
                <button mat-icon-button [matMenuTriggerFor]="menu" class="todo-actions">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #menu="matMenu">
                  <button mat-menu-item (click)="openTodoDialog(todo)">
                    <mat-icon>edit</mat-icon>
                    <span>Edit</span>
                  </button>
                  <button mat-menu-item (click)="togglePin(todo)">
                    <mat-icon>{{ todo.isPinned ? 'push_pin' : 'push_pin' }}</mat-icon>
                    <span>{{ todo.isPinned ? 'Unpin' : 'Pin' }}</span>
                  </button>
                  <mat-divider></mat-divider>
                  <button mat-menu-item (click)="deleteTodo(todo.id)" class="delete-option">
                    <mat-icon>delete</mat-icon>
                    <span>Delete</span>
                  </button>
                </mat-menu>
              </div>

              <mat-card-header>
                <mat-card-title>
                  <div class="todo-title">
                    <mat-checkbox
                      [checked]="todo.status === 'DONE'"
                      (change)="toggleStatus(todo)"
                      color="primary"
                    >
                    </mat-checkbox>
                    <span [ngClass]="{ completed: todo.status === 'DONE' }">{{ todo.title }}</span>
                  </div>
                </mat-card-title>
              </mat-card-header>

              <mat-card-content *ngIf="todo.description">
                <p class="todo-description">{{ todo.description }}</p>
              </mat-card-content>

              <div class="todo-meta">
                <div class="todo-due-date" *ngIf="todo.dueDate">
                  <mat-icon>event</mat-icon>
                  <span>{{ todo.dueDate | date: 'mediumDate' }}</span>
                </div>

                <div class="todo-project" *ngIf="getProjectName(todo.projectId) && !projectId">
                  <mat-icon>folder</mat-icon>
                  <span>{{ getProjectName(todo.projectId) }}</span>
                </div>
              </div>

              <div class="todo-tags" *ngIf="todo.tags?.length">
                <mat-chip-set>
                  <mat-chip *ngFor="let tag of todo.tags" size="small">{{ tag }}</mat-chip>
                </mat-chip-set>
              </div>
            </mat-card>
          </div>
        </div>

        <!-- Regular Tasks -->
        <div class="todo-section">
          <h2 class="section-title" *ngIf="pinnedTodos.length > 0">
            <mat-icon>list</mat-icon> Tasks
          </h2>
          <div class="todos-grid">
            <mat-card
              *ngFor="let todo of unpinnedTodos"
              class="todo-card"
              [ngClass]="todo.status.toLowerCase()"
            >
              <div class="todo-header">
                <div class="todo-status-badge" [ngClass]="todo.status.toLowerCase()">
                  {{ getStatusLabel(todo.status) }}
                </div>
                <div class="todo-priority-badge" [ngClass]="todo.priority.toLowerCase()">
                  {{ todo.priority }}
                </div>
                <button mat-icon-button [matMenuTriggerFor]="menu" class="todo-actions">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #menu="matMenu">
                  <button mat-menu-item (click)="openTodoDialog(todo)">
                    <mat-icon>edit</mat-icon>
                    <span>Edit</span>
                  </button>
                  <button mat-menu-item (click)="togglePin(todo)">
                    <mat-icon>{{ todo.isPinned ? 'push_pin' : 'push_pin' }}</mat-icon>
                    <span>{{ todo.isPinned ? 'Unpin' : 'Pin' }}</span>
                  </button>
                  <mat-divider></mat-divider>
                  <button mat-menu-item (click)="deleteTodo(todo.id)" class="delete-option">
                    <mat-icon>delete</mat-icon>
                    <span>Delete</span>
                  </button>
                </mat-menu>
              </div>

              <mat-card-header>
                <mat-card-title>
                  <div class="todo-title">
                    <mat-checkbox
                      [checked]="todo.status === 'DONE'"
                      (change)="toggleStatus(todo)"
                      color="primary"
                    >
                    </mat-checkbox>
                    <span [ngClass]="{ completed: todo.status === 'DONE' }">{{ todo.title }}</span>
                  </div>
                </mat-card-title>
              </mat-card-header>

              <mat-card-content *ngIf="todo.description">
                <p class="todo-description">{{ todo.description }}</p>
              </mat-card-content>

              <div class="todo-meta">
                <div class="todo-due-date" *ngIf="todo.dueDate">
                  <mat-icon>event</mat-icon>
                  <span>{{ todo.dueDate | date: 'mediumDate' }}</span>
                </div>

                <div class="todo-project" *ngIf="getProjectName(todo.projectId) && !projectId">
                  <mat-icon>folder</mat-icon>
                  <span>{{ getProjectName(todo.projectId) }}</span>
                </div>
              </div>

              <div class="todo-tags" *ngIf="todo.tags?.length">
                <mat-chip-set>
                  <mat-chip *ngFor="let tag of todo.tags" size="small">{{ tag }}</mat-chip>
                </mat-chip-set>
              </div>
            </mat-card>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .todos-container {
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
      .title-section {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .todo-count {
        font-size: 14px;
        padding: 4px 12px;
        border-radius: 16px;
        background-color: #e0e0e0;
        color: #616161;
      }
      .todo-count.has-items {
        background-color: #e8f5e9;
        color: #388e3c;
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
      .todos-list {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }
      .section-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 18px;
        margin-bottom: 16px;
        color: #424242;
      }
      .todos-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 16px;
      }
      .todo-card {
        display: flex;
        flex-direction: column;
        position: relative;
        border-top: 4px solid #f5f5f5;
      }
      .todo-card.todo {
        border-top-color: #42a5f5;
      }
      .todo-card.in_progress {
        border-top-color: #ffb74d;
      }
      .todo-card.done {
        border-top-color: #66bb6a;
      }
      .todo-card.blocked {
        border-top-color: #ef5350;
      }
      .todo-header {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px 0;
      }
      .todo-status-badge,
      .todo-priority-badge {
        font-size: 12px;
        padding: 2px 8px;
        border-radius: 4px;
        text-transform: lowercase;
      }
      .todo-status-badge.todo {
        background-color: #e3f2fd;
        color: #1976d2;
      }
      .todo-status-badge.in_progress {
        background-color: #fff3e0;
        color: #f57c00;
      }
      .todo-status-badge.done {
        background-color: #e8f5e9;
        color: #388e3c;
      }
      .todo-status-badge.blocked {
        background-color: #ffebee;
        color: #d32f2f;
      }
      .todo-priority-badge.low {
        background-color: #f1f8e9;
        color: #689f38;
      }
      .todo-priority-badge.medium {
        background-color: #e3f2fd;
        color: #1976d2;
      }
      .todo-priority-badge.high {
        background-color: #fff3e0;
        color: #f57c00;
      }
      .todo-priority-badge.urgent {
        background-color: #ffebee;
        color: #d32f2f;
      }
      .todo-actions {
        margin-left: auto;
      }
      .todo-title {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
      }
      .completed {
        text-decoration: line-through;
        color: #9e9e9e;
      }
      .todo-description {
        font-size: 14px;
        color: #757575;
        margin-top: 0;
        margin-bottom: 8px;
      }
      .todo-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
        margin: 8px 16px;
      }
      .todo-due-date,
      .todo-project {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        color: #757575;
      }
      .todo-due-date mat-icon,
      .todo-project mat-icon {
        font-size: 16px;
        height: 16px;
        width: 16px;
      }
      .todo-tags {
        padding: 0 16px 16px;
      }
      .delete-option {
        color: #f44336;
      }
    `,
  ],
})
export class TodosComponent implements OnInit {
  todos: Todo[] = [];
  projects: Project[] = [];
  loading = true;
  projectId: string | null = null;
  projectName: string | null = null;

  get pinnedTodos() {
    return this.todos.filter(todo => todo.isPinned);
  }

  get unpinnedTodos() {
    return this.todos.filter(todo => !todo.isPinned);
  }

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadProjects();

    this.route.paramMap.subscribe(params => {
      this.projectId = params.get('id');
      this.loadTodos();
    });
  }

  loadProjects() {
    this.http
      .get<Project[]>('http://localhost:3000/api/projects')
      .pipe(
        catchError(error => {
          this.snackBar.open('Failed to load projects', 'Dismiss', { duration: 3000 });
          console.error('Error loading projects:', error);
          return of([]);
        })
      )
      .subscribe(projects => {
        this.projects = projects;
        if (this.projectId) {
          const project = this.projects.find(p => p.id === this.projectId);
          if (project) {
            this.projectName = project.name;
          }
        }
      });
  }

  loadTodos() {
    this.loading = true;
    let url = 'http://localhost:3000/api/todos';
    if (this.projectId) {
      url += `?projectId=${this.projectId}`;
    }

    this.http
      .get<Todo[]>(url)
      .pipe(
        catchError(error => {
          this.snackBar.open('Failed to load tasks', 'Dismiss', { duration: 3000 });
          console.error('Error loading tasks:', error);
          return of([]);
        })
      )
      .subscribe(todos => {
        this.todos = todos;
        this.loading = false;
      });
  }

  getProjectName(projectId: string): string {
    const project = this.projects.find(p => p.id === projectId);
    return project ? project.name : '';
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'TODO':
        return 'to do';
      case 'IN_PROGRESS':
        return 'in progress';
      case 'DONE':
        return 'done';
      case 'BLOCKED':
        return 'blocked';
      default:
        return status.toLowerCase();
    }
  }

  openTodoDialog(todo?: Todo) {
    const dialogRef = this.dialog.open(TodoDialogComponent, {
      width: '500px',
      data: {
        todo,
        isEdit: !!todo,
        projects: this.projects,
        currentProjectId: this.projectId || undefined,
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (todo) {
          this.updateTodo(todo.id, result);
        } else {
          this.createTodo(result);
        }
      }
    });
  }

  createTodo(todoData: Partial<Todo>) {
    this.http
      .post<Todo>('http://localhost:3000/api/todos', todoData)
      .pipe(
        catchError(error => {
          this.snackBar.open('Failed to create task', 'Dismiss', { duration: 3000 });
          console.error('Error creating task:', error);
          return of(null);
        })
      )
      .subscribe(todo => {
        if (todo) {
          this.todos.push(todo);
          this.snackBar.open('Task created successfully', 'Dismiss', { duration: 3000 });
        }
      });
  }

  updateTodo(id: string, todoData: Partial<Todo>) {
    this.http
      .patch<Todo>(`http://localhost:3000/api/todos/${id}`, todoData)
      .pipe(
        catchError(error => {
          this.snackBar.open('Failed to update task', 'Dismiss', { duration: 3000 });
          console.error('Error updating task:', error);
          return of(null);
        })
      )
      .subscribe(updatedTodo => {
        if (updatedTodo) {
          const index = this.todos.findIndex(t => t.id === id);
          if (index !== -1) {
            this.todos[index] = updatedTodo;
          }
          this.snackBar.open('Task updated successfully', 'Dismiss', { duration: 3000 });
        }
      });
  }

  deleteTodo(id: string) {
    if (confirm('Are you sure you want to delete this task?')) {
      this.http
        .delete(`http://localhost:3000/api/todos/${id}`)
        .pipe(
          catchError(error => {
            this.snackBar.open('Failed to delete task', 'Dismiss', { duration: 3000 });
            console.error('Error deleting task:', error);
            return of(null);
          })
        )
        .subscribe(() => {
          this.todos = this.todos.filter(t => t.id !== id);
          this.snackBar.open('Task deleted successfully', 'Dismiss', { duration: 3000 });
        });
    }
  }

  toggleStatus(todo: Todo) {
    const newStatus = todo.status === 'DONE' ? 'TODO' : 'DONE';
    this.updateTodo(todo.id, { status: newStatus });
  }

  togglePin(todo: Todo) {
    this.updateTodo(todo.id, { isPinned: !todo.isPinned });
  }
}
