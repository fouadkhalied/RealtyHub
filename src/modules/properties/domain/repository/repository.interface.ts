import { CreatePropertyRequest } from "../../prestentaion/dto/CreatePropertyRequest.dto";
import { Property } from "../../prestentaion/dto/property.dto";
import { DeveloperInput, LocationInput, ProjectInput, PropertyTypeInput } from "../valueObjects/helpers.vo";

export interface PropertiesRepositoryInterface {
    create(props : CreatePropertyRequest) : Promise<number>
    getLocations() : Promise<LocationInput[] | null>
    getDevolpers() : Promise<DeveloperInput[] | null>
    getProjects() : Promise<ProjectInput[] | null>
    getPropertyType() : Promise<PropertyTypeInput[] | null>
    findById(id: string): Promise<Property | null>
    findByMlsId(mlsId: string): Promise<Property | null>
    update(id: string, props: Partial<CreatePropertyRequest>): Promise<void>
    delete(id: string): Promise<void>
    approveProperty(id : string) : Promise<{success : boolean}>
}