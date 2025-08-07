export interface CategoryQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    sort_by?: 'name' | 'created_at';
    sort_order?: 'asc' | 'desc';
  }