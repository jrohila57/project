export interface CreateTodoDto {
  title: string;
  description?: string;
  projectId?: string;
}

export interface UpdateTodoDto {
  title?: string;
  description?: string;
  completed?: boolean;
  projectId?: string;
}

export interface TodoResponseDto {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  projectId?: string;
}
