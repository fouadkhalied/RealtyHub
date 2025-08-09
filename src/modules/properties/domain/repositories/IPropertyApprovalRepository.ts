import { PropertyStatus } from "../../application/dto/responses/PropertiesStatus";

export interface IPropertyApprovalRepository {
    approveProperty(id: number): Promise<{success: boolean , alreadyApproved: boolean}>;
    rejectProperty(id: number): Promise<{success: boolean}>;
    status(): Promise<PropertyStatus>;
    getApprovedProperties(): Promise<number[]>;
    getPendingProperties(): Promise<number[]>;
}