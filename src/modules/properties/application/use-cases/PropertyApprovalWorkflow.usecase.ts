import { ApiResponseInterface } from "../../../../libs/common/apiResponse/interfaces/apiResponse.interface";
import { ErrorCode } from "../../../../libs/common/errors/enums/basic.error.enum";
import { ErrorBuilder } from "../../../../libs/common/errors/errorBuilder";
import { PropertyApprovalDomainService } from "../../domain/services/PropertyApprovalDomainService";
import { ServiceResult } from "../interfaces/serviceResult";

export class PropertyApprovalWorkflowUseCase {
    constructor(
        private readonly propertyApprovalService: PropertyApprovalDomainService
    ) {}

    async approveProperty(propertyId: number): Promise<ApiResponseInterface<{PropertyId: number}>> {
        try {
            // Approve property
            return await this.propertyApprovalService.approveProperty(propertyId);
        } catch (error: any) {
            return ErrorBuilder.build(
                ErrorCode.INTERNAL_SERVER_ERROR, 
                `PropertyApprovalWorkflowUseCase : ${error.message}`
              );
        }
    }

    async rejectProperty(propertyId: number): Promise<ApiResponseInterface<{PropertyId: number}>> {
        try {
            // Reject property
            return await this.propertyApprovalService.rejectProperty(propertyId);
        } catch (error: any) {
            return ErrorBuilder.build(
                ErrorCode.INTERNAL_SERVER_ERROR,
                `PropertyApprovalWorkflowUseCase : ${error.message}`
            );
        }
    }
}