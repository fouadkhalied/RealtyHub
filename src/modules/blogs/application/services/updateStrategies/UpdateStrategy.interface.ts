import { IBlogRepository } from "../../../domain/repositories/IBlogRepository";

export interface UpdateStrategy<TPayload> {
  execute(id: number, payload: TPayload, language: string): Promise<boolean>;
}

export abstract class BaseUpdateStrategy<TPayload> implements UpdateStrategy<TPayload> {
  protected constructor(protected readonly repo: IBlogRepository) {}
  abstract execute(id: number, payload: TPayload, language: string): Promise<boolean>;
}


