import { PropertySchema } from "../../application/validators/CreatePropertyValidator";
import { CreatePropertyRequest } from "../../application/dto/requests/CreatePropertyRequest.dto";
import { PropertyQueryResult } from "../../application/dto/responses/PropertyResponse.dto";
import { IPropertyRepository } from "../repositories/IPropertyRepository";
import { PaginationParams } from "../valueObjects/pagination.vo";
import { PropertyListItem } from "../../application/dto/responses/PropertyListResponse.dto";

export class PropertyDomainService {
    constructor(private readonly propertyRepository: IPropertyRepository) {}

    async createProperty(propertyData: CreatePropertyRequest & { userId: number }): Promise<number> {
        this.validatePropertyData(propertyData);
        return await this.propertyRepository.create(propertyData);
    }

    async getPropertyById(id: number): Promise<PropertyQueryResult | null> {
        if (!this.isValidId(id)) {
            throw new Error("Invalid property ID");
        }
        return await this.propertyRepository.findById(id);
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

    private validatePropertyData(propertyData: CreatePropertyRequest & { userId: number }): void {
        const { error } = PropertySchema.validate(propertyData);
        if (error) {
            throw new Error(error.details[0].message);
        }
    }

    private isValidId(id: number): boolean {
        return Number.isInteger(id) && id > 0;
    }
}
