import { Tag } from "../../domain/entities/tag.entity";

export interface TagResponse extends Tag {
  posts_count?: number;
  recent_posts?: Array<{
    id: number;
    title: string;
    slug: string;
    published_at?: Date;
  }>;
}
