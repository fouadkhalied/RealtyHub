import { BaseUpdateStrategy } from "./UpdateStrategy.interface";
import { TagUpdatePayload } from "../../interfaces/blog.interface";
import { IBlogRepository } from "../../../domain/repositories/IBlogRepository";
import { ValidationError } from "./ValidationError";
import { validateUpdateTagPayloadAr, validateUpdateTagPayloadEn } from "../../validators/blog.validate";

export class TagUpdateStrategy extends BaseUpdateStrategy<TagUpdatePayload[]> {
  constructor(repo: IBlogRepository) {
    super(repo);
  }

  execute(id: number, payload: TagUpdatePayload[], language: string): Promise<boolean> {
    switch (language) {
      case 'en':
        {
          const { error } = validateUpdateTagPayloadEn.validate(payload);
            if (error) {
              throw new ValidationError(error.details[0].message);
            } 
        }
        break;
      case 'ar':
        {
          const { error } = validateUpdateTagPayloadAr.validate(payload);
          if (error) {
            throw new ValidationError(error.details[0].message);
          }
        }
      default:
        throw new ValidationError('language should be (ar || en) only'+ language);
    }
    return this.repo.updateTags(id, payload, language);
  }
}


