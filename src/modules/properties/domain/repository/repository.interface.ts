import { CreatePropertyRequest } from "../../prestentaion/dto/CreatePropertyRequest.dto";
import { PropertyQueryResult } from "../../prestentaion/dto/GetPropertyResponse.dto";
import { PropertyStatus } from "../../prestentaion/dto/GetPropertyStatus";
import { ProjectWithDeveloperAndLocation, PropertyTypeInput } from "../valueObjects/helpers.vo";
import { PaginationParams } from "../valueObjects/pagination.vo";

export interface PropertiesRepositoryInterface {
    create(props : CreatePropertyRequest) : Promise<number>
    getProjects() : Promise<ProjectWithDeveloperAndLocation[] | null>
    getPropertyType() : Promise<PropertyTypeInput[] | null>
    findById(id: number): Promise<PropertyQueryResult | null>
    findAll(params: PaginationParams): Promise<{properties: PropertyQueryResult[], totalCount: number }>
    addFeaturesToProperty(id: number , features: number[]):Promise<boolean>
    update(id: number, props: Partial<CreatePropertyRequest>): Promise<void>
    delete(id: number): Promise<void>
    approveProperty(id : number) : Promise<{success : boolean}>
    rejectProperty(id: number): Promise<{success: boolean}>
    status() : Promise<PropertyStatus>
    getApproved() : Promise<number[]>
    getPending() : Promise<number[]> 
}
