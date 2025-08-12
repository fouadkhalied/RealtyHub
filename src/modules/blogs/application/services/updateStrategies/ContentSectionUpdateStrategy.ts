import { BaseUpdateStrategy } from "./UpdateStrategy.interface";
import { ContentSectionUpdatePayload } from "../../interfaces/blog.interface";
import { IBlogRepository } from "../../../domain/repositories/IBlogRepository";
import { validateUpdateContentSectionPayload } from "../../validators/blog.validate";
import { ValidationError } from "./ValidationError";

export class ContentSectionUpdateStrategy extends BaseUpdateStrategy<ContentSectionUpdatePayload> {
  constructor(repo: IBlogRepository) {
    super(repo);
  }

  execute(id: number, payload: ContentSectionUpdatePayload): Promise<boolean> {
    const { error } = validateUpdateContentSectionPayload.validate(payload);
    if (error) {
      throw new ValidationError(error.details[0].message);
    }
    return this.repo.updateContentSections(id, payload);
  }
}


