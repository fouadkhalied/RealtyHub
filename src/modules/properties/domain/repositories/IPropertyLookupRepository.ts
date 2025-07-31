import { ProjectWithDeveloperAndLocation } from "../../prestentaion/dto/GetAvailbleProjects.dto";
import { PropertyTypeInput } from "../valueObjects/helpers.vo";
import { PaginationParams } from "../valueObjects/pagination.vo";

export interface IPropertyLookupRepository {
    getProjects(params: PaginationParams): Promise<{projects: ProjectWithDeveloperAndLocation[], totalCount: number}>;
    getPropertyType(): Promise<PropertyTypeInput[] | null>;
}