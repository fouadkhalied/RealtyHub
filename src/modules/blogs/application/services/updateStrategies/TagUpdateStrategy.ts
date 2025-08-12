import { BaseUpdateStrategy } from "./UpdateStrategy.interface";
import { TagUpdatePayload } from "../../interfaces/blog.interface";
import { IBlogRepository } from "../../../domain/repositories/IBlogRepository";
import { validateUpdateTagPayload } from "../../validators/blog.validate";
import { ValidationError } from "./ValidationError";

export class TagUpdateStrategy extends BaseUpdateStrategy<TagUpdatePayload[]> {
  constructor(repo: IBlogRepository) {
    super(repo);
  }

  execute(id: number, payload: TagUpdatePayload[]): Promise<boolean> {
    const { error } = validateUpdateTagPayload.validate(payload);
    if (error) {
      throw new ValidationError(error.details[0].message);
    }
    return this.repo.updateTags(id, payload);
  }
}


