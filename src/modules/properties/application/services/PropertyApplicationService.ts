import { PropertyApprovalDomainService } from "../../domain/services/PropertyApprovalDomainService";
import { PropertyDomainService } from "../../domain/services/PropertyDomainService";
import { PropertyLookupDomainService } from "../../domain/services/PropertyLookupDomainService";
import { PaginatedResponse, PaginationParams } from "../../../../libs/common/pagination.vo";
import { CreatePropertyRequest } from "../dto/requests/CreatePropertyRequest.dto";
import { requiredInterfacesData } from "../dto/responses/AvailblePropertyInterfaces.dtp";
import { ProjectWithDeveloperAndLocation } from "../dto/responses/ProjectResponse.dto";
import { PropertyStatus } from "../dto/responses/PropertiesStatus";
import { PropertyListItem } from "../dto/responses/PropertyListResponse.dto";
import { ServiceResult } from "../interfaces/serviceResult";
import { EnhancedPropertyResult, enhancePropertyWithLocalization } from "../transformes/enhancedPropertyTransformer";
import { CreatePropertyUseCase } from "../use-cases/CreateProperty.usecase";
import { PropertyApprovalWorkflowUseCase } from "../use-cases/PropertyApprovalWorkflow.usecase";
import { UploadPropertyPhotosUseCase } from "../use-cases/UploadPropertyPhotos.usecase";
import { ApiResponseInterface } from "../../../../libs/common/apiResponse/interfaces/apiResponse.interface";
import { ErrorBuilder } from "../../../../libs/common/errors/errorBuilder";
import { ErrorCode } from "../../../../libs/common/errors/enums/basic.error.enum";
import { ResponseBuilder } from "../../../../libs/common/apiResponse/apiResponseBuilder";

export class PropertyApplicationService {
    constructor(
        private readonly propertyDomainService: PropertyDomainService,
        private readonly propertyApprovalService: PropertyApprovalDomainService,
        private readonly propertyLookupService: PropertyLookupDomainService,
        // Use cases only for complex workflows
        private readonly createPropertyUseCase: CreatePropertyUseCase,
        private readonly approvalWorkflowUseCase: PropertyApprovalWorkflowUseCase,
        private readonly uploadPhotosUseCase: UploadPropertyPhotosUseCase
    ) {}

    // ========== SIMPLE OPERATIONS (Direct Service Calls) ==========
    
    async getPropertyById(id: number): Promise<ApiResponseInterface<EnhancedPropertyResult | null>> {
        const result = await this.propertyDomainService.getPropertyById(id);
        
        if (!result.success) {
            return result as ApiResponseInterface<EnhancedPropertyResult | null>;
        }

        const enhancedProperty = result.data ? enhancePropertyWithLocalization(result.data) : null;
        
        return ResponseBuilder.success(enhancedProperty, result.message);
    }

    async getAllProperties(page: number = 1, limit: number = 10): Promise<ApiResponseInterface<PaginatedResponse<PropertyListItem>>> {
        const paginationParams = this.validatePaginationParams(page, limit);
        const result = await this.propertyDomainService.getAllProperties(paginationParams);
        
        if (!result.success) {
            return ErrorBuilder.build(ErrorCode.DATABASE_ERROR, result.message)
        }

        const { properties, totalCount } = result.data!;
        const paginatedResponse = this.createPaginatedResponse(properties, totalCount, paginationParams);
        
        return ResponseBuilder.success(paginatedResponse, result.message);
    }

    async updateProperty(id: number, data: Partial<CreatePropertyRequest>, userId?: number): Promise<ApiResponseInterface<void>> {
        return await this.propertyDomainService.updateProperty(id, data as CreatePropertyRequest, userId);
    }

    async deleteProperty(id: number, userId?: number): Promise<ApiResponseInterface<void>> {
        return await this.propertyDomainService.deleteProperty(id, userId);
    }

    // async getPropertyTypes(): Promise<ApiResponseInterface<PropertyType[]>> {
    //     return await this.propertyLookupService.getPropertyTypes();
    // }

    async getProjects(page: number = 1, limit: number = 10): Promise<ApiResponseInterface<PaginatedResponse<ProjectWithDeveloperAndLocation>>> {
        const paginationParams = this.validatePaginationParams(page, limit);
        
        try {
            const { projects, totalCount } = await this.propertyLookupService.getProjects(paginationParams);
            const paginatedResponse = this.createPaginatedResponse(projects, totalCount, paginationParams);
            
            return ResponseBuilder.success(paginatedResponse, "Projects retrieved successfully");
        } catch (error: any) {
            return ErrorBuilder.build(
                ErrorCode.DATABASE_ERROR,
                "Failed to retrieve projects",
                { originalError: error.message }
            );
        }
    }

    async getPropertyStatus(): Promise<ApiResponseInterface<PropertyStatus>> {
        try {
            const status = await this.propertyApprovalService.getPropertyStatus();
            return ResponseBuilder.success(status, "Property status retrieved successfully");
        } catch (error: any) {
            return ErrorBuilder.build(
                ErrorCode.DATABASE_ERROR,
                "Failed to retrieve property status",
                { originalError: error.message }
            );
        }
    }

    async getApprovedProperties(): Promise<ApiResponseInterface<number[]>> {
        try {
            const approvedProperties = await this.propertyApprovalService.getApprovedProperties();
            return ResponseBuilder.success(approvedProperties, "Approved properties retrieved successfully");
        } catch (error: any) {
            return ErrorBuilder.build(
                ErrorCode.DATABASE_ERROR,
                "Failed to retrieve approved properties",
                { originalError: error.message }
            );
        }
    }

    async getPendingProperties(): Promise<ApiResponseInterface<number[]>> {
        try {
            const pendingProperties = await this.propertyApprovalService.getPendingProperties();
            return ResponseBuilder.success(pendingProperties, "Pending properties retrieved successfully");
        } catch (error: any) {
            return ErrorBuilder.build(
                ErrorCode.DATABASE_ERROR,
                "Failed to retrieve pending properties",
                { originalError: error.message }
            );
        }
    }

    // ========== COMPLEX OPERATIONS (Use Cases) ==========
    
    async createProperty(props: CreatePropertyRequest, userId: number): Promise<ApiResponseInterface<number>> {
        return await this.propertyDomainService.createProperty(props, userId);
    }

    async approveProperty(propertyId: number): Promise<ApiResponseInterface<{PropertyId: number}>> {
        return await this.approvalWorkflowUseCase.approveProperty(propertyId);
    }

    async rejectProperty(propertyId: number): Promise<ApiResponseInterface<{PropertyId: number}>> {
        return await this.approvalWorkflowUseCase.rejectProperty(propertyId);
    }

    async uploadPhotos(propertyId: number, files: Express.Multer.File[], coverImageIndex: number): Promise<ApiResponseInterface<ServiceResult>> {
        try {
            const result = await this.uploadPhotosUseCase.execute(propertyId, files, coverImageIndex);
            return ResponseBuilder.success(result, "Photos uploaded successfully");
        } catch (error: any) {
            return ErrorBuilder.build(
                ErrorCode.INTERNAL_SERVER_ERROR,
                "Failed to upload photos",
                { originalError: error.message }
            );
        }
    }

    async getRequiredInterfaces(): Promise<ApiResponseInterface<any>> {
        return ResponseBuilder.success(requiredInterfacesData, "Required interfaces retrieved successfully");
    }

    // ========== Helper methods ==========
    
    async authorizePropertyAccess(propertyId: number, userId: number): Promise<ApiResponseInterface<boolean>> {
        return await this.propertyDomainService.authorizePropertyAccess(propertyId, userId);
    }

    private validatePaginationParams(page: number, limit: number): PaginationParams {
        const validPage = Math.max(1, Math.floor(page));
        const validLimit = Math.min(Math.max(1, Math.floor(limit)), 100);
        return { page: validPage, limit: validLimit };
    }

    private createPaginatedResponse<T>(data: T[], totalCount: number, params: PaginationParams): PaginatedResponse<T> {
        const totalPages = Math.ceil(totalCount / params.limit);
        return {
            data,
            pagination: {
                currentPage: params.page,
                limit: params.limit,
                totalCount,
                totalPages,
                hasNext: params.page < totalPages,
                hasPrevious: params.page > 1
            }
        };
    }
}