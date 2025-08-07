import { Category } from "../../entites/category.entity";

export interface CategoryResponse extends Category {
  posts_count?: number;
  recent_posts?: Array<{
    id: number;
    title: string;
    slug: string;
    published_at?: Date;
  }>;
}
