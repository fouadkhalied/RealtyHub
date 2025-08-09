import { ResponseBuilder } from "../../../../libs/common/apiResponse/apiResponseBuilder";
import { ApiResponseInterface } from "../../../../libs/common/apiResponse/interfaces/apiResponse.interface";
import { ErrorCode } from "../../../../libs/common/errors/enums/basic.error.enum";
import { ErrorBuilder } from "../../../../libs/common/errors/errorBuilder";
import { PropertyStatus } from "../../application/dto/responses/PropertiesStatus";
import { IPropertyApprovalRepository } from "../repositories/IPropertyApprovalRepository";


export class PropertyApprovalDomainService {
    constructor(private readonly approvalRepository: IPropertyApprovalRepository) {}

    async approveProperty(id: number): Promise<ApiResponseInterface<{PropertyId: number}>> {
        if (!this.isValidId(id)) {
          return ErrorBuilder.build(ErrorCode.INVALID_FORMAT, "Invalid property ID");
        }
      
        try {
          const { success, alreadyApproved } = await this.approvalRepository.approveProperty(id);
      
          if (!success) {
            return ResponseBuilder.fail(
              { PropertyId: id }, 
              `Failed to approve property ID (${id})`
            );
          }
      
          if (alreadyApproved) {
            return ResponseBuilder.success(
              { PropertyId: id }, 
              `Property ID (${id}) is already approved`
            );
          }
      
          return ResponseBuilder.success(
            { PropertyId: id }, 
            `Property ID (${id}) approved successfully`
          );
      
        } catch (error: any) {
          // Handle specific "Property not found" error
          if (error.message.includes('Property not found')) {
            return ErrorBuilder.build(
              ErrorCode.PROPERTY_NOT_FOUND, 
              `Property ID (${id}) not found`
            );
          }
      
          // Handle other database errors
          return ErrorBuilder.build(
            ErrorCode.DATABASE_ERROR, 
            `Failed to approve property ID (${id}): ${error.message}`
          );
        }
      }
      

    async rejectProperty(id: number): Promise<ApiResponseInterface<{PropertyId: number}>> {
        if (!this.isValidId(id)) {
            return ErrorBuilder.build(ErrorCode.INVALID_FORMAT, "Invalid property ID");
        }
        try {
            const {success} = await this.approvalRepository.rejectProperty(id);
            
            if (!success) {
                return ResponseBuilder.fail(
                    {PropertyId : id},
                    `Failed to reject property ID (${id})`
                );
            }

            return ResponseBuilder.success(
                { PropertyId: id },
                `Property ID (${id}) rejected successfully`
            );
        } catch (error: any) {
            if (error.message.includes('not found')) {
                return ErrorBuilder.build(
                    ErrorCode.PROPERTY_NOT_FOUND,
                    `Property ID (${id}) not found`
                );
            }
            return ErrorBuilder.build(
                ErrorCode.DATABASE_ERROR,
                `Failed to reject property ID (${id}): ${error.message}`
            );
        }
    }

    async getPropertyStatus(): Promise<PropertyStatus> {
        return await this.approvalRepository.status();
    }

    async getApprovedProperties() : Promise<number[]>{
        return await this.approvalRepository.getApprovedProperties()
    }

    async getPendingProperties() : Promise<number[]>{
        return await this.approvalRepository.getPendingProperties()
    }

    private isValidId(id: number): boolean {
        return Number.isInteger(id) && id > 0;
    }
}