import { BaseUpdateStrategy } from "./UpdateStrategy.interface";
import { CategoryUpdatePayload } from "../../interfaces/blog.interface";
import { IBlogRepository } from "../../../domain/repositories/IBlogRepository";
import { validateUpdateCategoryPayloadAr, validateUpdateCategoryPayloadEn } from "../../validators/blog.validate";
import { ValidationError } from "./ValidationError";

export class CategoryUpdateStrategy extends BaseUpdateStrategy<CategoryUpdatePayload[]> {
  constructor(repo: IBlogRepository) {
    super(repo);
  }

  execute(id: number, payload: CategoryUpdatePayload[], language: string): Promise<boolean> {
    switch (language) {
      case 'en': {
        const { error } = validateUpdateCategoryPayloadEn.validate(payload);
        if (error) {
          throw new ValidationError(error.details[0].message);
        }
        break;
      }
      case 'ar': {
        const { error } = validateUpdateCategoryPayloadAr.validate(payload);
        if (error) {
          throw new ValidationError(error.details[0].message);
        }
        break;
      }
      default:
        throw new ValidationError('language should be (ar || en) only' + language);
    }
    return this.repo.updateCategories(id, payload, language);
  }
}


