export interface Tag {
  id: string;
  name: string;
  isActive: boolean;
  sortPosition: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTagDto {
  name: string;
  sortPosition?: number;
}

export interface UpdateTagDto {
  name?: string;
  isActive?: boolean;
  sortPosition?: number;
}

export interface ReorderTagsDto {
  ids: string[];
}
