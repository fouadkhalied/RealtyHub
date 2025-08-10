import { PropertySchema } from "../../application/validators/CreatePropertyValidator";
import { CreatePropertyRequest } from "../../application/dto/requests/CreatePropertyRequest.dto";
import { PropertyQueryResult } from "../../application/dto/responses/PropertyResponse.dto";
import { IPropertyRepository } from "../repositories/IPropertyRepository";
import { PaginationParams } from "../../../../libs/common/pagination.vo";
import { PropertyListItem } from "../../application/dto/responses/PropertyListResponse.dto";
import { ApiResponseInterface } from "../../../../libs/common/apiResponse/interfaces/apiResponse.interface";
import { ErrorBuilder } from "../../../../libs/common/errors/errorBuilder";
import { ErrorCode } from "../../../../libs/common/errors/enums/basic.error.enum";
import { ValidationResult } from "../../../../libs/common/validation/validation.interface";

export class PropertyDomainService {
    constructor(private readonly propertyRepository: IPropertyRepository) {}

    async createProperty(
        propertyData: CreatePropertyRequest, 
        userId: number
    ): Promise<ApiResponseInterface<number>> {
        try {
            // Validate user ID
            const userValidation = this.validateUserId(userId);
            if (!userValidation.isValid) {
                return ErrorBuilder.build<number>(
                    ErrorCode.INVALID_ID,
                    userValidation.message!
                );
            }

            // Validate property data
            const propertyValidation = this.validateProperty(propertyData);
            if (!propertyValidation.isValid) {
                return ErrorBuilder.build<number>(
                    ErrorCode.VALIDATION_FAILED,
                    propertyValidation.message!,
                    { validationDetails: propertyValidation.details }
                );
            }

            // Create property
            const propertyId = await this.propertyRepository.create(propertyData, userId);
            
            if (!propertyId || propertyId <= 0) {
                return ErrorBuilder.build<number>(
                    ErrorCode.PROPERTY_CREATION_FAILED,
                    "Failed to create property - invalid ID returned"
                );
            }

            return {
                success: true,
                message: "Property created successfully",
                data: propertyId
            };

        } catch (error: any) {
            console.error('Error in createProperty:', error);
            
            // Handle specific repository errors
            if (this.isDatabaseError(error)) {
                return ErrorBuilder.build<number>(
                    ErrorCode.DATABASE_ERROR,
                    "Database error during property creation",
                    { operation: "property creation", originalError: error.message }
                );
            }

            if (this.isTransactionError(error)) {
                return ErrorBuilder.build<number>(
                    ErrorCode.TRANSACTION_FAILED,
                    "Transaction failed during property creation",
                    { originalError: error.message }
                );
            }

            return ErrorBuilder.build<number>(
                ErrorCode.INTERNAL_SERVER_ERROR,
                "An unexpected error occurred while creating property"
            );
        }
    }

    async getPropertyById(id: number): Promise<ApiResponseInterface<PropertyQueryResult | null>> {
        try {
            // Validate ID
            if (!this.isValidId(id)) {
                return ErrorBuilder.build<PropertyQueryResult | null>(
                    ErrorCode.INVALID_ID,
                    "Invalid property ID provided",
                    { providedId: id }
                );
            }

            const property = await this.propertyRepository.findById(id);
            
            if (!property) {
                return ErrorBuilder.build<PropertyQueryResult | null>(
                    ErrorCode.PROPERTY_NOT_FOUND,
                    `Property not found with ID: ${id}`,
                    { entityType: "Property", id }
                );
            }

            return {
                success: true,
                message: "Property retrieved successfully",
                data: property
            };

        } catch (error: any) {
            console.error('Error in getPropertyById:', error);
            
            if (this.isDatabaseError(error)) {
                return ErrorBuilder.build<PropertyQueryResult | null>(
                    ErrorCode.DATABASE_ERROR,
                    "Database error during property retrieval",
                    { operation: "property retrieval", originalError: error.message }
                );
            }

            return ErrorBuilder.build<PropertyQueryResult | null>(
                ErrorCode.INTERNAL_SERVER_ERROR,
                "An unexpected error occurred while retrieving property"
            );
        }
    }

    async updateProperty(
        id: number, 
        data: CreatePropertyRequest, 
        userId?: number
    ): Promise<ApiResponseInterface<void>> {
        try {
            // Validate ID
            if (!this.isValidId(id)) {
                return ErrorBuilder.build<void>(
                    ErrorCode.INVALID_ID,
                    "Invalid property ID provided",
                    { providedId: id }
                );
            }

            // Validate property data
            const propertyValidation = this.validateProperty(data);
            if (!propertyValidation.isValid) {
                return ErrorBuilder.build<void>(
                    ErrorCode.VALIDATION_FAILED,
                    propertyValidation.message!,
                    { validationDetails: propertyValidation.details }
                );
            }

            // Check if property exists
            const existingProperty = await this.propertyRepository.findById(id);
            if (!existingProperty) {
                return ErrorBuilder.build<void>(
                    ErrorCode.PROPERTY_NOT_FOUND,
                    `Property not found with ID: ${id}`,
                    { entityType: "Property", id }
                );
            }

            // Check authorization if userId is provided
            if (userId !== undefined) {
                const isAuthorized = await this.authorizePropertyAccess(id, userId);
                if (!isAuthorized.success || !isAuthorized.data) {
                    return ErrorBuilder.build<void>(
                        ErrorCode.UNAUTHORIZED_ACCESS,
                        "Unauthorized to update this property",
                        { action: "update this property" }
                    );
                }
            }

            await this.propertyRepository.update(id, data);

            return {
                success: true,
                message: "Property updated successfully"
            };

        } catch (error: any) {
            console.error('Error in updateProperty:', error);
            
            if (this.isDatabaseError(error)) {
                return ErrorBuilder.build<void>(
                    ErrorCode.DATABASE_ERROR,
                    "Database error during property update",
                    { operation: "property update", originalError: error.message }
                );
            }

            if (this.isTransactionError(error)) {
                return ErrorBuilder.build<void>(
                    ErrorCode.TRANSACTION_FAILED,
                    "Transaction failed during property update",
                    { propertyId: id, originalError: error.message }
                );
            }

            return ErrorBuilder.build<void>(
                ErrorCode.INTERNAL_SERVER_ERROR,
                "An unexpected error occurred while updating property"
            );
        }
    }

    async getAllProperties(
        params: PaginationParams
    ): Promise<ApiResponseInterface<{properties: PropertyListItem[], totalCount: number}>> {
        try {
            // Validate pagination parameters
            const paginationValidation = this.validatePaginationParams(params);
            if (!paginationValidation.isValid) {
                return ErrorBuilder.build<{properties: PropertyListItem[], totalCount: number}>(
                    ErrorCode.VALIDATION_FAILED,
                    paginationValidation.message!,
                    { validationDetails: paginationValidation.details }
                );
            }

            const result = await this.propertyRepository.findAll(params);

            return {
                success: true,
                message: "Properties retrieved successfully",
                data: result
            };

        } catch (error: any) {
            console.error('Error in getAllProperties:', error);
            
            if (this.isDatabaseError(error)) {
                return ErrorBuilder.build<{properties: PropertyListItem[], totalCount: number}>(
                    ErrorCode.DATABASE_ERROR,
                    "Database error during properties retrieval",
                    { operation: "properties retrieval", originalError: error.message }
                );
            }

            return ErrorBuilder.build<{properties: PropertyListItem[], totalCount: number}>(
                ErrorCode.INTERNAL_SERVER_ERROR,
                "An unexpected error occurred while retrieving properties"
            );
        }
    }

    async deleteProperty(id: number, userId?: number): Promise<ApiResponseInterface<void>> {
        try {
            // Validate ID
            if (!this.isValidId(id)) {
                return ErrorBuilder.build<void>(
                    ErrorCode.INVALID_ID,
                    "Invalid property ID provided",
                    { providedId: id }
                );
            }

            // Check if property exists
            const existingProperty = await this.propertyRepository.findById(id);
            if (!existingProperty) {
                return ErrorBuilder.build<void>(
                    ErrorCode.PROPERTY_NOT_FOUND,
                    `Property not found with ID: ${id}`,
                    { entityType: "Property", id }
                );
            }

            // Check authorization if userId is provided
            if (userId !== undefined) {
                const isAuthorized = await this.authorizePropertyAccess(id, userId);
                if (!isAuthorized.success || !isAuthorized.data) {
                    return ErrorBuilder.build<void>(
                        ErrorCode.UNAUTHORIZED_ACCESS,
                        "Unauthorized to delete this property",
                        { action: "delete this property" }
                    );
                }
            }

            await this.propertyRepository.delete(id);

            return {
                success: true,
                message: "Property deleted successfully"
            };

        } catch (error: any) {
            console.error('Error in deleteProperty:', error);
            
            if (this.isDatabaseError(error)) {
                return ErrorBuilder.build<void>(
                    ErrorCode.DATABASE_ERROR,
                    "Database error during property deletion",
                    { operation: "property deletion", originalError: error.message }
                );
            }

            return ErrorBuilder.build<void>(
                ErrorCode.PROPERTY_DELETION_FAILED,
                "Failed to delete property",
                { propertyId: id, originalError: error.message }
            );
        }
    }

    async authorizePropertyAccess(
        propertyId: number, 
        userId: number
    ): Promise<ApiResponseInterface<boolean>> {
        try {
            // Validate IDs
            if (!this.isValidId(propertyId)) {
                return ErrorBuilder.build<boolean>(
                    ErrorCode.INVALID_ID,
                    "Invalid property ID provided",
                    { providedId: propertyId }
                );
            }

            if (!this.isValidId(userId)) {
                return ErrorBuilder.build<boolean>(
                    ErrorCode.INVALID_ID,
                    "Invalid user ID provided",
                    { providedId: userId }
                );
            }

            const hasAccess = await this.propertyRepository.findPropertyIDandUserID(propertyId, userId);

            return {
                success: true,
                message: hasAccess ? "Access authorized" : "Access denied",
                data: hasAccess
            };

        } catch (error: any) {
            console.error('Error in authorizePropertyAccess:', error);
            
            if (this.isDatabaseError(error)) {
                return ErrorBuilder.build<boolean>(
                    ErrorCode.DATABASE_ERROR,
                    "Database error during authorization check",
                    { operation: "authorization check", originalError: error.message }
                );
            }

            return ErrorBuilder.build<boolean>(
                ErrorCode.INTERNAL_SERVER_ERROR,
                "An unexpected error occurred during authorization check"
            );
        }
    }

    // Private validation methods
    private validateProperty(propertyData: CreatePropertyRequest): ValidationResult {
        try {
            const { error } = PropertySchema.validate(propertyData);
            if (error) {
                return {
                    isValid: false,
                    message: error.details[0].message,
                    details: {
                        field: error.details[0].path.join('.'),
                        value: error.details[0].context?.value,
                        validationErrors: error.details.map(detail => ({
                            field: detail.path.join('.'),
                            message: detail.message,
                            value: detail.context?.value
                        }))
                    }
                };
            }
            return { isValid: true };
        } catch (error: any) {
            return {
                isValid: false,
                message: "Validation schema error",
                details: { originalError: error.message }
            };
        }
    }

    private validateUserId(userId: number): ValidationResult {
        if (!this.isValidId(userId)) {
            return {
                isValid: false,
                message: "Invalid user ID - must be a positive integer",
                details: { providedUserId: userId }
            };
        }
        return { isValid: true };
    }

    private validatePaginationParams(params: PaginationParams): ValidationResult {
        if (!params) {
            return {
                isValid: false,
                message: "Pagination parameters are required"
            };
        }

        if (!Number.isInteger(params.page) || params.page < 1) {
            return {
                isValid: false,
                message: "Page must be a positive integer",
                details: { providedPage: params.page }
            };
        }

        if (!Number.isInteger(params.limit) || params.limit < 1 || params.limit > 1000) {
            return {
                isValid: false,
                message: "Limit must be a positive integer between 1 and 1000",
                details: { providedLimit: params.limit }
            };
        }

        return { isValid: true };
    }

    private isValidId(id: number): boolean {
        return Number.isInteger(id) && id > 0;
    }

    // Error type detection methods
    private isDatabaseError(error: any): boolean {
        return error?.code?.startsWith?.('23') || // PostgreSQL constraint violations
               error?.code?.startsWith?.('08') || // Connection errors
               error?.message?.toLowerCase?.()?.includes?.('database') ||
               error?.message?.toLowerCase?.()?.includes?.('connection') ||
               error?.message?.toLowerCase?.()?.includes?.('query');
    }

    private isTransactionError(error: any): boolean {
        return error?.message?.toLowerCase?.()?.includes?.('transaction') ||
               error?.message?.toLowerCase?.()?.includes?.('rollback') ||
               error?.message?.toLowerCase?.()?.includes?.('commit');
    }
}