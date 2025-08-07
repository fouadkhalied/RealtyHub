import { PropertySchema } from "../../application/validators/CreatePropertyValidator";
import { CreatePropertyRequest } from "../../application/dto/requests/CreatePropertyRequest.dto";
import { PropertyQueryResult } from "../../application/dto/responses/PropertyResponse.dto";
import { IPropertyRepository } from "../repositories/IPropertyRepository";
import { PaginationParams } from "../../../../libs/common/pagination.vo";
import { PropertyListItem } from "../../application/dto/responses/PropertyListResponse.dto";
import { UpdatePropertySchema } from "../../application/validators/UpdatePropertyValidator";

export class PropertyDomainService {
    constructor(private readonly propertyRepository: IPropertyRepository) {}

    async createProperty(propertyData: CreatePropertyRequest & { userId: number }): Promise<number> {
        this.validatePropertyDataForCreate(propertyData);
        return await this.propertyRepository.create(propertyData);
    }

    async getPropertyById(id: number): Promise<PropertyQueryResult | null> {
        if (!this.isValidId(id)) {
            throw new Error("Invalid property ID");
        }
        return await this.propertyRepository.findById(id);
    }

    async updateProperty(id: number, data: Partial<CreatePropertyRequest>): Promise<void> {
        this.validatePropertyDataForUpdate(data);
        if (!this.isValidId(id)) {
            throw new Error("Invalid property ID");
        }
        return await this.propertyRepository.update(id, data);
    }

    
    async getAllProperties(params: PaginationParams): Promise<{properties : PropertyListItem[] , totalCount : number}> {
        return await this.propertyRepository.findAll(params);
    }

    async authorizePropertyAccess(propertyId: number, userId: number): Promise<boolean> {
        if (!this.isValidId(propertyId) || !this.isValidId(userId)) {
            return false;
        }
        return await this.propertyRepository.findPropertyIDandUserID(propertyId, userId);
    }

    private validatePropertyDataForCreate(propertyData: CreatePropertyRequest & { userId: number }): void {
        const { error } = PropertySchema.validate(propertyData);
        if (error) {
            throw new Error(error.details[0].message);
        }
    }

    private validatePropertyDataForUpdate(propertyData: Partial<CreatePropertyRequest>): void {
        const { error } = UpdatePropertySchema.validate(propertyData);
        if (error) {
            throw new Error(error.details[0].message);
        }
    }

    private isValidId(id: number): boolean {
        return Number.isInteger(id) && id > 0;
    }
}
