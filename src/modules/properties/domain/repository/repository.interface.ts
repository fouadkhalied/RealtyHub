import { CreatePropertyRequest } from "../../prestentaion/dto/CreatePropertyRequest.dto";
import { PropertyQueryResult } from "../../prestentaion/dto/GetPropertyResponse.dto";
import { MultipleProperties, Property } from "../../prestentaion/dto/property.dto";
import { DeveloperInput, LocationInput, ProjectWithDeveloperAndLocation, PropertyTypeInput } from "../valueObjects/helpers.vo";
import { PaginationParams } from "../valueObjects/pagination.vo";

export interface PropertiesRepositoryInterface {
    create(props : CreatePropertyRequest) : Promise<number>
    getProjects() : Promise<ProjectWithDeveloperAndLocation[] | null>
    getPropertyType() : Promise<PropertyTypeInput[] | null>
    findById(id: number): Promise<PropertyQueryResult | null>
    findAll(params: PaginationParams): Promise<{properties: PropertyQueryResult[], totalCount: number }>
    addFeaturesToProperty(id: number , features: number[]):Promise<boolean>
    //addActionsToProperty(id: number):Promise<boolean>
    update(id: number, props: Partial<CreatePropertyRequest>): Promise<void>
    delete(id: number): Promise<void>
    approveProperty(id : number) : Promise<{success : boolean}>
    rejectProperty(id: number): Promise<{success: boolean}>
}
