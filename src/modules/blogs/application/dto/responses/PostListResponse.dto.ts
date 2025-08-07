import { User } from "../../../../user/domain/entites/User";
import { Category } from "../../entites/category.entity";
import { Tag } from "../../entites/tag.entity";

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
  