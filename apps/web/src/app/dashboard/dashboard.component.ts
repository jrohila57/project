import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MaterialModule } from '../shared/material.module';
import { AuthService } from '../shared/services/auth.service';
import { HttpClient } from '@angular/common/http';

// Local interfaces to replace @shared/interfaces
interface User {
  id: string;
  email: string;
  name: string;
  theme?: string;
  defaultSort?: string;
}

interface Todo {
  id: string;
  title: string;
  description?: string;
  status: TodoStatus;
  priority: TodoPriority;
  dueDate?: string | Date;
  completedAt?: string | Date;
  isPinned: boolean;
  tags: string[];
  projectId: string;
}

interface Project {
  id: string;
  name: string;
  description?: string;
  color?: string;
  isArchived: boolean;
}

type TodoStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
type TodoPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MaterialModule, RouterLink],
  template: `
    <div class="dashboard-container">
      <div class="welcome-card">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Welcome, {{ currentUser?.name || 'User' | titlecase }}</mat-card-title>
            <mat-card-subtitle>Here's an overview of your tasks</mat-card-subtitle>
          </mat-card-header>
        </mat-card>
      </div>

      <div class="dashboard-content">
        <div class="dashboard-column">
          <mat-card class="stats-card">
            <mat-card-header>
              <mat-card-title>Task Summary</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="stats-container">
                <div class="stat-item" *ngFor="let stat of todoStats">
                  <div class="stat-number">{{ stat.count }}</div>
                  <div class="stat-label">{{ stat.label }}</div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stats-card">
            <mat-card-header>
              <mat-card-title>Projects</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="project-list" *ngIf="projects.length > 0; else noProjects">
                <mat-list>
                  <mat-list-item
                    *ngFor="let project of projects.slice(0, 5)"
                    [routerLink]="['/projects', project.id, 'todos']"
                  >
                    <div class="project-item">
                      <div
                        class="project-color-indicator"
                        [style.background-color]="project.color || '#888'"
                      ></div>
                      <div class="project-name">{{ project.name }}</div>
                      <div class="project-task-count">{{ getProjectTaskCount(project.id) }}</div>
                    </div>
                  </mat-list-item>
                </mat-list>
                <div class="view-all">
                  <a mat-button color="primary" [routerLink]="['/projects']">View All Projects</a>
                </div>
              </div>
              <ng-template #noProjects>
                <p class="no-data">
                  No projects yet. <a [routerLink]="['/projects']">Create your first project</a>
                </p>
              </ng-template>
            </mat-card-content>
          </mat-card>
        </div>

        <div class="dashboard-column">
          <mat-card class="recent-todos-card">
            <mat-card-header>
              <mat-card-title>Recent Tasks</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="todos-list" *ngIf="todos.length > 0; else noTodos">
                <mat-list>
                  <mat-list-item
                    *ngFor="let todo of todos.slice(0, 7)"
                    [routerLink]="['/todos']"
                    [queryParams]="{ id: todo.id }"
                  >
                    <div class="todo-item">
                      <mat-checkbox
                        [checked]="todo.status === 'DONE'"
                        [disabled]="true"
                      ></mat-checkbox>
                      <div class="todo-title" [class.completed]="todo.status === 'DONE'">
                        {{ todo.title }}
                      </div>
                      <mat-chip-set>
                        <mat-chip [ngClass]="'priority-' + todo.priority.toLowerCase()">{{
                          todo.priority
                        }}</mat-chip>
                      </mat-chip-set>
                    </div>
                  </mat-list-item>
                </mat-list>
                <div class="view-all">
                  <a mat-button color="primary" [routerLink]="['/todos']">View All Tasks</a>
                </div>
              </div>
              <ng-template #noTodos>
                <p class="no-data">
                  No tasks yet. <a [routerLink]="['/todos']">Create your first task</a>
                </p>
              </ng-template>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .dashboard-container {
        padding: 20px;
      }

      .welcome-card {
        margin-bottom: 20px;
      }

      .dashboard-content {
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
      }

      .dashboard-column {
        flex: 1;
        min-width: 300px;
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .stats-card,
      .recent-todos-card {
        width: 100%;
      }

      .stats-container {
        display: flex;
        justify-content: space-around;
        flex-wrap: wrap;
        margin-top: 15px;
      }

      .stat-item {
        text-align: center;
        padding: 15px;
        min-width: 100px;
      }

      .stat-number {
        font-size: 36px;
        font-weight: bold;
        color: #673ab7;
      }

      .stat-label {
        font-size: 14px;
        color: #666;
        margin-top: 5px;
      }

      .project-item,
      .todo-item {
        display: flex;
        align-items: center;
        width: 100%;
        cursor: pointer;
        padding: 8px 0;
      }

      .project-color-indicator {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        margin-right: 10px;
      }

      .project-name {
        flex: 1;
      }

      .project-task-count {
        padding: 2px 8px;
        background-color: #eee;
        border-radius: 12px;
        font-size: 12px;
      }

      .todo-title {
        flex: 1;
        margin: 0 10px;
      }

      .completed {
        text-decoration: line-through;
        color: #888;
      }

      .priority-low {
        background-color: #8bc34a;
        color: white;
      }

      .priority-medium {
        background-color: #ffc107;
        color: white;
      }

      .priority-high {
        background-color: #ff9800;
        color: white;
      }

      .priority-urgent {
        background-color: #f44336;
        color: white;
      }

      .view-all {
        text-align: center;
        margin-top: 15px;
      }

      .no-data {
        color: #888;
        font-style: italic;
        text-align: center;
        padding: 20px;
      }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  currentUser: Partial<User> | null = null;
  todos: Todo[] = [];
  projects: Project[] = [];

  todoStats = [
    { label: 'Total', count: 0 },
    { label: 'To Do', count: 0 },
    { label: 'In Progress', count: 0 },
    { label: 'Done', count: 0 },
  ];

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadData();
  }

  loadData(): void {
    // Load projects
    this.http.get<Project[]>('http://localhost:3000/api/projects').subscribe({
      next: projects => {
        this.projects = projects;
        // After loading projects, load todos to ensure we can calculate project stats
        this.loadTodos();
      },
      error: error => console.error('Error loading projects', error),
    });
  }

  loadTodos(): void {
    this.http.get<Todo[]>('http://localhost:3000/api/todos').subscribe({
      next: todos => {
        this.todos = todos;
        this.calculateStats();
      },
      error: error => console.error('Error loading todos', error),
    });
  }

  calculateStats(): void {
    // Reset counts
    this.todoStats[0]!.count = this.todos.length;
    this.todoStats[1]!.count = this.todos.filter(todo => todo.status === 'TODO').length;
    this.todoStats[2]!.count = this.todos.filter(todo => todo.status === 'IN_PROGRESS').length;
    this.todoStats[3]!.count = this.todos.filter(todo => todo.status === 'DONE').length;
  }

  getProjectTaskCount(projectId: string): number {
    return this.todos.filter(todo => todo.projectId === projectId).length;
  }
}
