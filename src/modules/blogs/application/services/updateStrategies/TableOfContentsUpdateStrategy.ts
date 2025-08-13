import { BaseUpdateStrategy } from "./UpdateStrategy.interface";
import { TableOfContentUpdatePayload } from "../../interfaces/blog.interface";
import { IBlogRepository } from "../../../domain/repositories/IBlogRepository";
import { validateUpdateTableOfContentPayloadAr, validateUpdateTableOfContentPayloadEn } from "../../validators/blog.validate";
import { ValidationError } from "./ValidationError";

export class TableOfContentsUpdateStrategy extends BaseUpdateStrategy<TableOfContentUpdatePayload[]> {
  constructor(repo: IBlogRepository) {
    super(repo);
  }

  execute(id: number, payload: TableOfContentUpdatePayload[], language: string): Promise<boolean> {
    switch (language) {
      case 'en': {
        const { error } = validateUpdateTableOfContentPayloadEn.validate(payload);
        if (error) {
          throw new ValidationError(error.details[0].message);
        }
        break;
      }
      case 'ar': {
        const { error } = validateUpdateTableOfContentPayloadAr.validate(payload);
        if (error) {
          throw new ValidationError(error.details[0].message);
        }
        break;
      }
      default:
        throw new ValidationError('language should be (ar || en) only' + language);
    }
    return this.repo.updateTableOfContents(id, payload, language);
  }
}


