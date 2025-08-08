import { Reference } from "joi";
import { User } from "../../../../user/domain/entites/User";
import { Category } from "../../../domain/entities/category.entity";
import { ContentSection } from "../../../domain/entities/contentSection.entity";
import { FaqItem } from "../../../domain/entities/faqItem.entity";
import { Post } from "../../../domain/entities/post.entity";
import { TableOfContent } from "../../../domain/entities/tableContent.entity";
import { Tag } from "../../../domain/entities/tag.entity";
import { RelatedPost } from "../../../domain/entities/relatedPost.entity";

export interface PostResponse extends Post {
    author: Pick<User, 'id' | 'username'>;
    content_sections: ContentSection[];
    categories: Category[];
    tags: Tag[];
    table_of_contents: TableOfContent[];
    faq_items: FaqItem[];
    related_posts: RelatedPost[];
  }
