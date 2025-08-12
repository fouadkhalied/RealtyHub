import { User } from "../../../../user/domain/entites/User";
import { Category } from "../../../domain/entities/category.entity";
import { Tag } from "../../../domain/entities/tag.entity";

export interface PostListResponse {
    id: number;
    slug: string;
    featuredImageUrl?: string;
    status: string;
    language: string;
    author: Pick<User, 'id' | 'username'>;
    ar: {
        title: string;
        summary?: string;
        categories: Pick<Category, 'id' | 'name' | 'slug'>[];
        tags: Pick<Tag, 'id' | 'name' | 'slug'>[];
    };
    en: {
        title: string;
        summary?: string;
        categories: Pick<Category, 'id' | 'name' | 'slug'>[];
        tags: Pick<Tag, 'id' | 'name' | 'slug'>[];
    };
}