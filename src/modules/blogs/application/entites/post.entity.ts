export interface Post {
    id: number;
    slug: string;
    title: string;
    summary?: string;
    author_id: number;
    featured_image_url?: string;
    status: 'draft' | 'published' | 'archived';
    reading_time_minutes: number;
    views: number;
    published_at?: Date;
    created_at: Date;
    updated_at: Date;
  }