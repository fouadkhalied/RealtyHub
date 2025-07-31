import { db, sql } from "@vercel/postgres";
import { IPropertyRepository } from "../../domain/repositories/IPropertyRepository";
import { WRITE_QUERIES } from "../quires/quires.write";
import { CreatePropertyRequest } from "../../application/dto/requests/CreatePropertyRequest.dto";
import { READ_QUERIES } from "../quires/quires.read";
import { PropertyListItem } from "../../application/dto/responses/PropertyListResponse.dto";
import { PaginationParams } from "../../domain/valueObjects/pagination.vo";
import { PropertyQueryResult } from "../../application/dto/responses/PropertyResponse.dto";

export class PropertyRepositoryImplementation implements IPropertyRepository {

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

  

  async update(id: number, props: Partial<CreatePropertyRequest>): Promise<void> {
    try {
      const updateFields: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

    //   Object.entries(props).forEach(([key, value]) => {
    //     if (value !== undefined && key !== 'mlsId') {
    //       const dbField = this.mapFieldToDbColumn(key);
    //       updateFields.push(`${dbField} = $${paramCount}`);
    //       values.push(value);
    //       paramCount++;
    //     }
    //   });

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

  async findPropertyIDandUserID(propertyId: number, userId: number): Promise<boolean> {
    try {
      const result = await sql.query(READ_QUERIES.findPropertyIDandUserID, [propertyId, userId]);
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error checking property and user ID:', error);
      throw error;
    }
  }
}