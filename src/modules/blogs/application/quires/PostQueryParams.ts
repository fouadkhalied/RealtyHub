export interface PostQueryParams {
    page?: number;
    limit?: number;
    status?: 'draft' | 'published' | 'archived';
    author_id?: number;
    category_id?: number;
    tag_id?: number;
    search?: string;
    sort_by?: 'created_at' | 'updated_at' | 'published_at' | 'views' | 'title';
    sort_order?: 'asc' | 'desc';
    date_from?: string;
    date_to?: string;
  }
  