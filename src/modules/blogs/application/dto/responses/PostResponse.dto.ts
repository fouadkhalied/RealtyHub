import { Reference } from "joi";
import { User } from "../../../../user/domain/entites/User";
import { Category } from "../../entites/category.entity";
import { ContentSection } from "../../entites/contentSection.entity";
import { FaqItem } from "../../entites/faqItem.entity";
import { Post } from "../../entites/post.entity";
import { TableOfContent } from "../../entites/tableContent.entity";
import { Tag } from "../../entites/tag.entity";
import { RelatedPost } from "../../entites/relatedPost.enitiy";

export interface PostResponse extends Post {
    author: Pick<User, 'id' | 'username'>;
    content_sections: ContentSection[];
    categories: Category[];
    tags: Tag[];
    table_of_contents: TableOfContent[];
    faq_items: FaqItem[];
    related_posts: RelatedPost[];
  }