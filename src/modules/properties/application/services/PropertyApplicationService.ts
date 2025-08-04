import { PropertyApprovalDomainService } from "../../domain/services/PropertyApprovalDomainService";
import { PropertyDomainService } from "../../domain/services/PropertyDomainService";
import { PropertyLookupDomainService } from "../../domain/services/PropertyLookupDomainService";
import { PaginatedResponse, PaginationParams } from "../../domain/valueObjects/pagination.vo";
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
    
    async getPropertyById(id: number): Promise<EnhancedPropertyResult | null> {
        const result = await this.propertyDomainService.getPropertyById(id);
        return result ? enhancePropertyWithLocalization(result) : null;
    }

    async getAllProperties(page: number = 1, limit: number = 10): Promise<PaginatedResponse<PropertyListItem>> {
        const paginationParams = this.validatePaginationParams(page, limit);
        const { properties, totalCount } = await this.propertyDomainService.getAllProperties(paginationParams);
        return this.createPaginatedResponse(properties, totalCount, paginationParams);
    }

    async updateProperty(id: number, data: Partial<CreatePropertyRequest>): Promise<void> {
        return await this.propertyDomainService.updateProperty(id, data);
    }

    // async deleteProperty(id: number): Promise<void> {
    //     return await this.propertyDomainService.deleteProperty(id);
    // }

    // async getPropertyTypes() {
    //     return await this.propertyLookupService.getPropertyTypes();
    // }

    async getProjects(page: number = 1, limit: number = 10): Promise<PaginatedResponse<ProjectWithDeveloperAndLocation>> {
        const paginationParams = this.validatePaginationParams(page, limit);
        const { projects, totalCount } = await this.propertyLookupService.getProjects(paginationParams);
        return this.createPaginatedResponse(projects, totalCount, paginationParams);
    }

    async getPropertyStatus(): Promise<PropertyStatus> {
        return await this.propertyApprovalService.getPropertyStatus();
    }

    async getApprovedProperties(): Promise<number[]> {
        return await this.propertyApprovalService.getApprovedProperties();
    }

    async getPendingProperties(): Promise<number[]> {
        return await this.propertyApprovalService.getPendingProperties();
    }

    // ========== COMPLEX OPERATIONS (Use Cases) ==========
    
    async createProperty(props: CreatePropertyRequest, userId: number): Promise<number> {
        return await this.createPropertyUseCase.execute(props, userId);
    }

    async approveProperty(propertyId: number): Promise<ServiceResult> {
        return await this.approvalWorkflowUseCase.approveProperty(propertyId);
    }

    async rejectProperty(propertyId: number): Promise<ServiceResult> {
        return await this.approvalWorkflowUseCase.rejectProperty(propertyId);
    }

    async uploadPhotos(propertyId: number, files: Express.Multer.File[], coverImageIndex: number): Promise<ServiceResult> { 
        return await this.uploadPhotosUseCase.execute(propertyId,files,coverImageIndex);
    }

    async getRequiredInterfaces() : Promise<any> {
        return requiredInterfacesData
    }

    // ========== Helper methods... ==========
    async authorizePropertyAccess(propertyId: number, userId: number) : Promise<boolean> {
        return await this.propertyDomainService.authorizePropertyAccess(propertyId,userId)
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