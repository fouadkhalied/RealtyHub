import { ProjectWithDeveloperAndLocation } from "../../application/dto/responses/ProjectResponse.dto";
import { IPropertyLookupRepository } from "../repositories/IPropertyLookupRepository";
import { PaginationParams } from "../../../../libs/common/pagination.vo";


export class PropertyLookupDomainService {
    constructor(private readonly lookupRepository: IPropertyLookupRepository) {}

    async getProjects(params: PaginationParams): Promise<{projects: ProjectWithDeveloperAndLocation[], totalCount: number}> {
        return await this.lookupRepository.getProjects(params);
    }
}