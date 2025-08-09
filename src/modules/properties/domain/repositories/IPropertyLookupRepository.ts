import { ProjectWithDeveloperAndLocation } from "../../application/dto/responses/ProjectResponse.dto";
import { PropertyTypeInput } from "../valueObjects/helpers.vo";
import { PaginationParams } from "../../../../libs/common/pagination.vo";

export interface IPropertyLookupRepository {
    getProjects(params: PaginationParams): Promise<{projects: ProjectWithDeveloperAndLocation[], totalCount: number}>;
    getPropertyType(): Promise<PropertyTypeInput[] | null>;
}