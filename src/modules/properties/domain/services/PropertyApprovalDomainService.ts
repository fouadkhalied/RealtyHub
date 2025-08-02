import { PropertyStatus } from "../../application/dto/responses/PropertiesStatus";
import { IPropertyApprovalRepository } from "../repositories/IPropertyApprovalRepository";


export class PropertyApprovalDomainService {
    constructor(private readonly approvalRepository: IPropertyApprovalRepository) {}

    async approveProperty(id: number): Promise<{success: boolean}> {
        if (!this.isValidId(id)) {
            throw new Error("Invalid property ID");
        }
        return await this.approvalRepository.approveProperty(id);
    }

    async rejectProperty(id: number): Promise<{success: boolean}> {
        if (!this.isValidId(id)) {
            throw new Error("Invalid property ID");
        }
        return await this.approvalRepository.rejectProperty(id);
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