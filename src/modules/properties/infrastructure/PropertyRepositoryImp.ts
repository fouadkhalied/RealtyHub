import { PropertiesRepositoryInterface } from "../domain/repositories/PropertyRepository";
import { CreatePropertyRequest } from "../prestentaion/dto/CreatePropertyRequest.dto";
import { 
  PropertyTypeInput,
  FeatureInput,
  ActionInput,
  ContactInput 
} from "../domain/valueObjects/helpers.vo";
import { sql, db } from "@vercel/postgres";
import { PropertyQueryResult } from "../prestentaion/dto/GetPropertyResponse.dto";
import { PaginationParams } from "../domain/valueObjects/pagination.vo";
import { PropertyStatus } from "../prestentaion/dto/GetPropertyStatus";
import { PropertyPhotoData, PropertyPhotoRecord } from "../domain/valueObjects/propertyPhoto.helpers";
import { ProjectWithDeveloperAndLocation } from "../prestentaion/dto/GetAvailbleProjects.dto";
import { WRITE_QUERIES } from "./quires/quires.write";
import { READ_QUERIES } from "./quires/quires.read";
import { PropertyListItem } from "../prestentaion/dto/GetMultipleProperties.dto";

export class PropertiesRepositoryImplementation implements PropertiesRepositoryInterface {
  async create(data: CreatePropertyRequest): Promise<number> {
    const client = await db.connect();
    
    try {
      await client.sql`BEGIN`;
      
      const result = await client.query(WRITE_QUERIES.createProperty, [
        data.priceAmount, data.bedrooms, data.bathrooms, data.areaSqm,
        data.listingType, data.status, data.available_from,
        data.propertyTypeId, data.projectId, data.userId
      ]);
      
      const propertyId = result.rows[0]?.id;
      if (!propertyId) {
        throw new Error('Property ID not returned');
      }
      
      // Insert translations
      await Promise.all([
        client.query(WRITE_QUERIES.createPropertyTranslations, [
          propertyId, 'en', data.titleEn, data.descriptionEn, data.addressEn
        ]),
        client.query(WRITE_QUERIES.createPropertyTranslations, [
          propertyId, 'ar', data.titleAr, data.descriptionAr, data.addressAr
        ])
      ]);
      
      // Insert features
      if (data.features && data.features.length > 0) {
        await Promise.all(data.features.map(featureId =>
          client.query(WRITE_QUERIES.createPropertyFeatures, [propertyId, featureId])
        ));
      }
      
      // Insert contact info
      if (data.name && data.email && data.phone) {
        await client.query(WRITE_QUERIES.createContact, [
          propertyId, data.name, data.email, data.phone
        ]);
      }
      
      await client.sql`COMMIT`;
      return propertyId;
      
    } catch (error) {
      console.error('Transaction failed:', error);
      try {
        await client.sql`ROLLBACK`;
        console.log('Transaction rolled back successfully');
      } catch (rollbackError) {
        console.error('Rollback failed:', rollbackError);
      }
      throw error;
    } finally {
      client.release();
    }
  }

  async getProjects(params: PaginationParams): Promise<{ projects: ProjectWithDeveloperAndLocation[], totalCount: number }> {
    try {
      const { page, limit } = params;
      const offset = (page - 1) * limit;

      const countResult = await sql.query(READ_QUERIES.getProjectsCount);
      const totalCount = parseInt(countResult.rows[0].total);

      const result = await sql.query(READ_QUERIES.getProjects, [limit, offset]);

      return {
        projects: result.rows.map((row: any) => ({
          project_id: row.id,
          name: row.name,
          developer_name: row.developer_name,
          country: row.country,
          governorate: row.governorate,
          area: row.area,
          district: row.district,
        })),
        totalCount
      };
    } catch (error: any) {
      throw new Error(`Failed to get projects: ${error.message}`);
    }
  }

  async getPropertyType(): Promise<PropertyTypeInput[] | null> {
    try {
      const result = await sql.query(READ_QUERIES.getPropertyTypes);
      return result.rows;
    } catch (error: any) {
      throw new Error(`Failed to get property types: ${error.message}`);
    }
  }

  async findById(id: number): Promise<PropertyQueryResult | null> {
    try {
      const result = await sql.query(READ_QUERIES.findPropertyById, [id]);
      return result.rows[0] as PropertyQueryResult;
    } catch (error: any) {
      throw new Error(`Failed to find property by ID: ${error.message}`);
    }
  }

  async findAll(params: PaginationParams): Promise<{ properties: PropertyListItem[], totalCount: number }> {
    try {
      const { page, limit } = params;
      const offset = (page - 1) * limit;

      const countResult = await sql.query(READ_QUERIES.findAllPropertiesCount);
      const totalCount = parseInt(countResult.rows[0].total);

      const result = await sql.query(READ_QUERIES.findAllProperties, [limit, offset]);

      return {
        properties: result.rows as PropertyListItem[],
        totalCount
      };
    } catch (error: any) {
      throw new Error(`Failed to fetch properties: ${error.message}`);
    }
  }

  async addFeaturesToProperty(id: number, features: number[]): Promise<boolean> {
    if (features.length === 0) return true;

    try {
      await Promise.all(features.map(featureId =>
        sql.query(WRITE_QUERIES.addFeaturesToProperty, [id, featureId])
      ));
      return true;
    } catch (error) {
      console.error('Error adding features to property:', error);
      return false;
    }
  }

  async update(id: number, props: Partial<CreatePropertyRequest>): Promise<void> {
    try {
      const updateFields: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      Object.entries(props).forEach(([key, value]) => {
        if (value !== undefined && key !== 'mlsId') {
          const dbField = this.mapFieldToDbColumn(key);
          updateFields.push(`${dbField} = $${paramCount}`);
          values.push(value);
          paramCount++;
        }
      });

      if (updateFields.length === 0) {
        return;
      }

      updateFields.push(`updated_at = NOW()`);
      values.push(id);

      const query = WRITE_QUERIES.updateProperty.replace('$1', updateFields.join(', '));
      await sql.query(query, values);
    } catch (error: any) {
      throw new Error(`Failed to update property: ${error.message}`);
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await sql.query(WRITE_QUERIES.deleteProperty, [id]);
    } catch (error: any) {
      throw new Error(`Failed to delete property: ${error.message}`);
    }
  }

  async approveProperty(id: number): Promise<{ success: boolean }> {
    try {
      await sql.query(WRITE_QUERIES.approveProperty, [id]);
      return { success: true };
    } catch (error: any) {
      throw new Error(`Failed to approve property: ${error.message}`);
    }
  }

  async rejectProperty(id: number): Promise<{ success: boolean }> {
    try {
      await sql.query(WRITE_QUERIES.rejectProperty, [id]);
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

  async getApproved(): Promise<number[]> {
    try {
      const result = await sql.query(READ_QUERIES.getApprovedProperties);
      return result.rows.map(row => row.id);
    } catch (error) {
      console.error('Error fetching approved property IDs:', error);
      throw error;
    }
  }

  async getPending(): Promise<number[]> {
    try {
      const result = await sql.query(READ_QUERIES.getPendingProperties);
      return result.rows.map(row => row.id);
    } catch (error) {
      console.error('Error fetching pending property IDs:', error);
      throw error;
    }
  }

  async findPropertyIDandUserID(propertyId: number, userId: number): Promise<boolean> {
    try {
      const result = await sql.query(READ_QUERIES.findPropertyIDandUserID, [propertyId, userId]);
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error checking property and user ID:', error);
      throw error;
    }
  }

  private async getPropertyFeatures(propertyId: number): Promise<FeatureInput[]> {
    try {
      const result = await sql.query(READ_QUERIES.getPropertyFeatures, [propertyId]);
      return result.rows.map((row: any) => ({
        id: row.id,
        name: row.name,
        icon: row.icon
      }));
    } catch (error) {
      console.error('Error fetching property features:', error);
      throw error;
    }
  }

  private async getPropertyActions(propertyId: string): Promise<ActionInput[]> {
    try {
      const result = await sql.query(READ_QUERIES.getPropertyActions, [propertyId]);
      return result.rows.map((row: any) => ({
        id: row.id,
        name: row.name
      }));
    } catch (error) {
      console.error('Error fetching property actions:', error);
      throw error;
    }
  }

  private async getPropertyContacts(propertyId: string): Promise<ContactInput[]> {
    try {
      const result = await sql.query(READ_QUERIES.getPropertyContacts, [propertyId]);
      return result.rows.map((row: any) => ({
        id: row.id,
        contactType: row.contact_type,
        phone: row.phone,
        email: row.email,
        name: row.name
      }));
    } catch (error) {
      console.error('Error fetching property contacts:', error);
      throw error;
    }
  }

  private mapFieldToDbColumn(field: string): string {
    const fieldMap: { [key: string]: string } = {
      priceAmount: 'price_amount',
      areaSqm: 'area_sqm',
      yearBuilt: 'year_built',
      listingType: 'listing_type',
      listedBy: 'listed_by',
      parkingSpaces: 'parking_spaces',
      developerId: 'developer_id',
      locationId: 'location_id',
      propertyTypeId: 'property_type_id',
      projectId: 'project_id',
      titleEn: 'title_en',
      titleAr: 'title_ar',
      DescritpionEn: 'description_en', // Note: Typo in original key
      DescritpionAr: 'description_ar', // Note: Typo in original key
      typeEn: 'type_en',
      typeAr: 'type_ar',
      addressEn: 'address_en',
      addressAr: 'address_ar'
    };

    return fieldMap[field] || field.toLowerCase();
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}