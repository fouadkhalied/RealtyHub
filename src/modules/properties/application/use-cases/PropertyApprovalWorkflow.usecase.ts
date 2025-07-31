import { PropertyApprovalDomainService } from "../../domain/services/PropertyApprovalDomainService";
import { ServiceResult } from "../interfaces/serviceResult";

export class PropertyApprovalWorkflowUseCase {
    constructor(
        private readonly propertyApprovalService: PropertyApprovalDomainService
    ) {}

    async approveProperty(propertyId: number): Promise<ServiceResult> {
        try {

            // Approve property
            const result = await this.propertyApprovalService.approveProperty(propertyId);
            
            return {
                success: result.success,
                message: result.success ? "Property approved successfully" : "Failed to approve property"
            };
        } catch (error) {
            console.error("Error in PropertyApprovalWorkflowUseCase:", error);
            throw error;
        }
    }

    async rejectProperty(propertyId: number): Promise<ServiceResult> {
        try {
            const result = await this.propertyApprovalService.rejectProperty(propertyId);
            
            return {
                success: result.success,
                message: result.success ? "Property rejected successfully" : "Failed to reject property"
            };
        } catch (error) {
            console.error("Error in PropertyApprovalWorkflowUseCase:", error);
            throw error;
        }
    }
}