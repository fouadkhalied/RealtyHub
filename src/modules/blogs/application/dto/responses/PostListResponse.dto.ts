import { User } from "../../../../user/domain/entities/User";
import { Category } from "../../domain/entities/category.entity";
import { Tag } from "../../domain/entities/tag.entity";

export interface PostListResponse {
    id: number;
    slug: string;
    title: string;
    summary?: string;
    featuredImageUrl?: string;
    status: string;
    author: Pick<User, 'id' | 'username'>;
    categories: Pick<Category, 'id' | 'name' | 'slug'>[];
    tags: Pick<Tag, 'id' | 'name' | 'slug'>[];
}
  
