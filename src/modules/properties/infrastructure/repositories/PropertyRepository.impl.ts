import { db, sql } from "@vercel/postgres";
import { IPropertyRepository } from "../../domain/repositories/IPropertyRepository";
import { WRITE_QUERIES } from "../quires/quires.write";
import { CreatePropertyRequest } from "../../application/dto/requests/CreatePropertyRequest.dto";
import { READ_QUERIES } from "../quires/quires.read";
import { PropertyListItem } from "../../application/dto/responses/PropertyListResponse.dto";
import { PaginationParams } from "../../domain/valueObjects/pagination.vo";
import { PropertyQueryResult } from "../../application/dto/responses/PropertyResponse.dto";
import { UPDATE_QUIRES } from "../quires/quires.update";
import { DELETE_QUIRES } from "../quires/quires.delete";

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

    const client = await db.connect();
    try {  
     const { 
  titleEn, 
  titleAr, 
  descriptionEn, 
  descriptionAr, 
  addressEn, 
  addressAr, 
  features, 
  name, 
  email, 
  phone,
  
  priceAmount,
  bedrooms,
  bathrooms,
  areaSqm,
  listingType,
  status,
  available_from,
  propertyTypeId,
  projectId
} = props;

      await client.sql`BEGIN`;

      await client.query(UPDATE_QUIRES.updateProperty, [priceAmount,
        bedrooms,
        bathrooms,
        areaSqm,
        listingType,
        status,
        available_from,
        propertyTypeId,
        projectId,id]);

      Promise.all([
        await client.query(UPDATE_QUIRES.updatePropertyTranslations, [id, titleEn, descriptionEn, addressEn, 'en']),
        await client.query(UPDATE_QUIRES.updatePropertyTranslations, [id, titleAr, descriptionAr, addressAr, 'ar'])
      ])


      await client.query(DELETE_QUIRES.deleteFeaturesFromProperty, [id])

      if (features && features.length > 0) {
        await Promise.all(features.map(featureId =>
          client.query(WRITE_QUERIES.createPropertyFeatures, [id, featureId])
        ));
      }
      
      await client.query(UPDATE_QUIRES.updatePropertyContact, [id, name, email, phone]);

      await client.query(UPDATE_QUIRES.updatePropertyAppropvalToFalse, [id]);

      await client.sql`COMMIT`;
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

  async delete(id: number): Promise<void> {
    try {
      await sql.query(DELETE_QUIRES.deleteProperty, [id]);
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