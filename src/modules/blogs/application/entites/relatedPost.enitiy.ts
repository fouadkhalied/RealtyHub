
export interface RelatedPost {
    id: number;
    post_id: number;
    related_post_title: string;
    related_post_slug: string;
    relevance_order: number;
    created_at: Date;
  }