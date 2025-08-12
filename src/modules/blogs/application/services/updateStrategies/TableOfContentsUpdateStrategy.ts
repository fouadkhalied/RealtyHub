import { BaseUpdateStrategy } from "./UpdateStrategy.interface";
import { TableOfContentUpdatePayload } from "../../interfaces/blog.interface";
import { IBlogRepository } from "../../../domain/repositories/IBlogRepository";
import { validateUpdateTableOfContentPayload } from "../../validators/blog.validate";
import { ValidationError } from "./ValidationError";

export class TableOfContentsUpdateStrategy extends BaseUpdateStrategy<TableOfContentUpdatePayload> {
  constructor(repo: IBlogRepository) {
    super(repo);
  }

  execute(id: number, payload: TableOfContentUpdatePayload): Promise<boolean> {
    const { error } = validateUpdateTableOfContentPayload.validate(payload);
    if (error) {
      throw new ValidationError(error.details[0].message);
    }
    return this.repo.updateTableOfContents(id, payload);
  }
}


