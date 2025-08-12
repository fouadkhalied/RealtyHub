import { BaseUpdateStrategy } from "./UpdateStrategy.interface";
import { RelatedPostUpdatePayload } from "../../interfaces/blog.interface";
import { IBlogRepository } from "../../../domain/repositories/IBlogRepository";
import { validateUpdateRelatedPostPayload } from "../../validators/blog.validate";
import { ValidationError } from "./ValidationError";

export class RelatedPostsUpdateStrategy extends BaseUpdateStrategy<RelatedPostUpdatePayload> {
  constructor(repo: IBlogRepository) {
    super(repo);
  }

  execute(id: number, payload: RelatedPostUpdatePayload): Promise<boolean> {
    const { error } = validateUpdateRelatedPostPayload.validate(payload);
    if (error) {
      throw new ValidationError(error.details[0].message);
    }
    return this.repo.updateRelatedPosts(id, payload);
  }
}


