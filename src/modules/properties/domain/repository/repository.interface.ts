import { CreatePropertyRequest } from "../../prestentaion/dto/CreatePropertyRequest.dto";
import { ProjectWithDeveloperAndLocation } from "../../prestentaion/dto/GetAvailbleProjects.dto";
import { PropertyQueryResult } from "../../prestentaion/dto/GetPropertyResponse.dto";
import { PropertyStatus } from "../../prestentaion/dto/GetPropertyStatus";
import { PropertyTypeInput } from "../valueObjects/helpers.vo";
import { PaginationParams } from "../valueObjects/pagination.vo";
import { PropertyPhotoData, PropertyPhotoRecord } from "../valueObjects/propertyPhoto.vo";

export interface PropertiesRepositoryInterface {
    create(props : CreatePropertyRequest) : Promise<number>
    getProjects(params: PaginationParams) : Promise<{projects : ProjectWithDeveloperAndLocation[] , totalCount : number}>
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
    findPropertyIDandUserID(propertyId : number , userId : number) : Promise<boolean>
    savePropertyPhoto(photoData: PropertyPhotoData): Promise<PropertyPhotoRecord>
}
