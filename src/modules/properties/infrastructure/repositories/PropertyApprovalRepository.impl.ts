import { sql } from "@vercel/postgres";
import { PropertyStatus } from "../../application/dto/responses/PropertiesStatus";
import { IPropertyApprovalRepository } from "../../domain/repositories/IPropertyApprovalRepository";
import { READ_QUERIES } from "../quires/quires.read";
import { UPDATE_QUIRES } from "../quires/quires.update";
import { DELETE_QUIRES } from "../quires/quires.delete";

export class PropertyApprovalRepositoryImplementation implements IPropertyApprovalRepository{
    
  async approveProperty(id: number): Promise<{ success: boolean }> {
    try {
      await sql.query(UPDATE_QUIRES.approveProperty, [id]);
      return { success: true };
    } catch (error: any) {
      throw new Error(`Failed to approve property: ${error.message}`);
    }
  }

  async rejectProperty(id: number): Promise<{ success: boolean }> {
    try {
      await sql.query(DELETE_QUIRES.deleteProperty, [id]);
      return { success: true };
    } catch (error: any) {
      throw new Error(`Failed to delete property: ${error.message}`);
    }
  }

  async status(): Promise<PropertyStatus> {
    try {
      const result = await sql.query(READ_QUERIES.getPropertyStatus);
      return result.rows[0] as PropertyStatus;
    } catch (error) {
      console.error('Error fetching property status counts:', error);
      throw error;
    }
  }

  async getApprovedProperties(): Promise<number[]> {
    try {
      const result = await sql.query(READ_QUERIES.getApprovedProperties);
      return result.rows.map(row => row.id);
    } catch (error) {
      console.error('Error fetching approved property IDs:', error);
      throw error;
    }
  }

  async getPendingProperties(): Promise<number[]> {
    try {
      const result = await sql.query(READ_QUERIES.getPendingProperties);
      return result.rows.map(row => row.id);
    } catch (error) {
      console.error('Error fetching pending property IDs:', error);
      throw error;
    }
  }
}