export interface Project {
  id: string;
  name: string;
  description?: string;
  color?: string;
  isArchived: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  userId: string;
}
