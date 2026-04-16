export interface Catalog {
  id: string;
  year: number;
  brand: string;
  pdfUrl: string | null;
  pdfKey: string | null;
  pdfSizeBytes: number | null;
  sortPosition: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCatalogDto {
  year: number;
  brand: string;
  pdfUrl?: string;
  pdfKey?: string;
  pdfSizeBytes?: number;
  sortPosition?: number;
  isActive?: boolean;
}

export type UpdateCatalogDto = Partial<CreateCatalogDto>;

