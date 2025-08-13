import { BaseUpdateStrategy } from "./UpdateStrategy.interface";
import { RelatedPostUpdatePayload } from "../../interfaces/blog.interface";
import { IBlogRepository } from "../../../domain/repositories/IBlogRepository";
import { validateUpdateRelatedPostPayloadAr, validateUpdateRelatedPostPayloadEn } from "../../validators/blog.validate";
import { ValidationError } from "./ValidationError";

export class RelatedPostsUpdateStrategy extends BaseUpdateStrategy<RelatedPostUpdatePayload[]> {
  constructor(repo: IBlogRepository) {
    super(repo);
  }

  execute(id: number, payload: RelatedPostUpdatePayload[], language: string): Promise<boolean> {
    switch (language) {
      case 'en': {
        const { error } = validateUpdateRelatedPostPayloadEn.validate(payload);
        if (error) {
          throw new ValidationError(error.details[0].message);
        }
        break;
      }
      case 'ar': {
        const { error } = validateUpdateRelatedPostPayloadAr.validate(payload);
        if (error) {
          throw new ValidationError(error.details[0].message);
        }
        break;
      }
      default:
        throw new ValidationError('language should be (ar || en) only' + language);
    }
    return this.repo.updateRelatedPosts(id, payload, language);
  }
}


