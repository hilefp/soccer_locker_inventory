export interface Tag {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTagDto {
  name: string;
}

export interface UpdateTagDto {
  name?: string;
  isActive?: boolean;
}
