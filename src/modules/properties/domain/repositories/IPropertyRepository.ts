import { CreatePropertyRequest } from "../../prestentaion/dto/CreatePropertyRequest.dto";
import { PropertyListItem } from "../../prestentaion/dto/GetMultipleProperties.dto";
import { PropertyQueryResult } from "../../prestentaion/dto/GetPropertyResponse.dto";
import { PaginationParams } from "../../../../libs/common/pagination.vo";

export interface IPropertyRepository {
    create(props: CreatePropertyRequest): Promise<number>;
    findById(id: number): Promise<PropertyQueryResult | null>;
    findAll(params: PaginationParams): Promise<{properties: PropertyListItem[], totalCount: number}>;
    update(id: number, props: Partial<CreatePropertyRequest>): Promise<void>;
    delete(id: number): Promise<void>;
    findPropertyIDandUserID(propertyId: number, userId: number): Promise<boolean>
}