import { UpdatePartType, ContentSectionUpdatePayload, TagUpdatePayload, CategoryUpdatePayload, TableOfContentUpdatePayload, RelatedPostUpdatePayload } from "../../interfaces/blog.interface";
import { IBlogRepository } from "../../../domain/repositories/IBlogRepository";
import { UpdateStrategy } from "./UpdateStrategy.interface";
import { TagUpdateStrategy } from "./TagUpdateStrategy";
import { ContentSectionUpdateStrategy } from "./ContentSectionUpdateStrategy";
import { CategoryUpdateStrategy } from "./CategoryUpdateStrategy";
import { TableOfContentsUpdateStrategy } from "./TableOfContentsUpdateStrategy";
import { RelatedPostsUpdateStrategy } from "./RelatedPostsUpdateStrategy";

export class UpdateStrategyFactory {
  static create(
    part: UpdatePartType,
    repo: IBlogRepository
  ): UpdateStrategy<
    TagUpdatePayload[] |
    ContentSectionUpdatePayload[] |
    CategoryUpdatePayload[] |
    TableOfContentUpdatePayload[] |
    RelatedPostUpdatePayload[]
  > {
    switch (part) {
      case 'tag':
        return new TagUpdateStrategy(repo);
      case 'content_section':
        return new ContentSectionUpdateStrategy(repo);
      case 'category':
        return new CategoryUpdateStrategy(repo);
      case 'table_of_contents':
        return new TableOfContentsUpdateStrategy(repo);
      case 'related_post':
        return new RelatedPostsUpdateStrategy(repo);
      default:
        throw new Error(`Unsupported update part: ${part}`);
    }
  }
}


