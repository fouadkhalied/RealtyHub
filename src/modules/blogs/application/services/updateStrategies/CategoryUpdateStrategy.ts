import { BaseUpdateStrategy } from "./UpdateStrategy.interface";
import { CategoryUpdatePayload } from "../../interfaces/blog.interface";
import { IBlogRepository } from "../../../domain/repositories/IBlogRepository";
import { validateUpdateCategoryPayload } from "../../validators/blog.validate";
import { ValidationError } from "./ValidationError";

export class CategoryUpdateStrategy extends BaseUpdateStrategy<CategoryUpdatePayload> {
  constructor(repo: IBlogRepository) {
    super(repo);
  }

  execute(id: number, payload: CategoryUpdatePayload): Promise<boolean> {
    const { error } = validateUpdateCategoryPayload.validate(payload);
    if (error) {
      throw new ValidationError(error.details[0].message);
    }
    return this.repo.updateCategories(id, payload);
  }
}


