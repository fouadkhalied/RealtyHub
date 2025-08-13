import { BaseUpdateStrategy } from "./UpdateStrategy.interface";
import { ContentSectionUpdatePayload } from "../../interfaces/blog.interface";
import { IBlogRepository } from "../../../domain/repositories/IBlogRepository";
import { validateUpdateContentSectionPayloadAr, validateUpdateContentSectionPayloadEn } from "../../validators/blog.validate";
import { ValidationError } from "./ValidationError";

export class ContentSectionUpdateStrategy extends BaseUpdateStrategy<ContentSectionUpdatePayload[]> {
  constructor(repo: IBlogRepository) {
    super(repo);
  }

  execute(id: number, payload: ContentSectionUpdatePayload[], language: string): Promise<boolean> {
    switch (language) {
      case 'en': {
        const { error } = validateUpdateContentSectionPayloadEn.validate(payload);
        if (error) {
          throw new ValidationError(error.details[0].message);
        }
        break;
      }
      case 'ar': {
        const { error } = validateUpdateContentSectionPayloadAr.validate(payload);
        if (error) {
          throw new ValidationError(error.details[0].message);
        }
        break;
      }
      default:
        throw new ValidationError('language should be (ar || en) only' + language);
    }
    return this.repo.updateContentSections(id, payload, language);
  }
}


