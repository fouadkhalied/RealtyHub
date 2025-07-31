import { PropertyStatus } from "../../prestentaion/dto/GetPropertyStatus";

export interface IPropertyApprovalRepository {
    approveProperty(id: number): Promise<{success: boolean}>;
    rejectProperty(id: number): Promise<{success: boolean}>;
    status(): Promise<PropertyStatus>;
    getApprovedProperties(): Promise<number[]>;
    getPendingProperties(): Promise<number[]>;
}