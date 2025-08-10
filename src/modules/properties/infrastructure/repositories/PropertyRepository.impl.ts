import { db, sql } from "@vercel/postgres";
import { IPropertyRepository } from "../../domain/repositories/IPropertyRepository";
import { WRITE_QUERIES } from "../quires/quires.write";
import { CreatePropertyRequest } from "../../application/dto/requests/CreatePropertyRequest.dto";
import { READ_QUERIES } from "../quires/quires.read";
import { PropertyListItem } from "../../application/dto/responses/PropertyListResponse.dto";
import { PaginationParams } from "../../../../libs/common/pagination.vo";
import { PropertyQueryResult } from "../../application/dto/responses/PropertyResponse.dto";
import { UPDATE_QUIRES } from "../quires/quires.update";
import { DELETE_QUIRES } from "../quires/quires.delete";

export class PropertyRepositoryImplementation implements IPropertyRepository {

  async create(data: CreatePropertyRequest, userId: number): Promise<number> {
      const client = await db.connect();
      
      try {
          await client.sql`BEGIN`;
          
          const result = await client.query(WRITE_QUERIES.createProperty, [
              data.priceAmount, data.bedrooms, data.bathrooms, data.areaSqm,
              data.listingType, data.status, data.available_from,
              data.propertyTypeId, data.projectId, userId
          ]);
          
          const propertyId = result.rows[0]?.id;
          if (!propertyId) {
              throw new Error('Property creation failed: No ID returned from database');
          }
          
          // Insert translations with error checking
          const translationPromises = [
              client.query(WRITE_QUERIES.createPropertyTranslations, [
                  propertyId, 'en', data.titleEn, data.descriptionEn, data.addressEn
              ]),
              client.query(WRITE_QUERIES.createPropertyTranslations, [
                  propertyId, 'ar', data.titleAr, data.descriptionAr, data.addressAr
              ])
          ];
          
          await Promise.all(translationPromises);
          
          // Insert features if provided
          if (data.features && data.features.length > 0) {
              const featurePromises = data.features.map(featureId =>
                  client.query(WRITE_QUERIES.createPropertyFeatures, [propertyId, featureId])
              );
              await Promise.all(featurePromises);
          }
          
          // Insert contact info if provided
          if (data.name && data.email && data.phone) {
              await client.query(WRITE_QUERIES.createContact, [
                  propertyId, data.name, data.email, data.phone
              ]);
          }
          
          await client.sql`COMMIT`;
          return propertyId;
          
      } catch (error) {
          console.error('Property creation transaction failed:', error);
          try {
              await client.sql`ROLLBACK`;
              console.log('Transaction rolled back successfully');
          } catch (rollbackError) {
              console.error('Rollback failed:', rollbackError);
              throw new Error(`Transaction failed and rollback failed: ${rollbackError}`);
          }
          
          // Re-throw with more context
          if (error instanceof Error) {
              throw new Error(`Property creation failed: ${error.message}`);
          }
          throw new Error('Property creation failed: Unknown error');
      } finally {
          client.release();
      }
  }

  async findById(id: number): Promise<PropertyQueryResult | null> {
      try {
          const result = await sql.query(READ_QUERIES.findPropertyById, [id]);
          return result.rows[0] || null;
      } catch (error: any) {
          console.error('Error finding property by ID:', error);
          throw new Error(`Database error while finding property with ID ${id}: ${error.message}`);
      }
  }

  async findAll(params: PaginationParams): Promise<{ properties: PropertyListItem[], totalCount: number }> {
      try {
          const { page, limit } = params;
          const offset = (page - 1) * limit;

          // Execute count and data queries
          const [countResult, propertiesResult] = await Promise.all([
              sql.query(READ_QUERIES.findAllPropertiesCount),
              sql.query(READ_QUERIES.findAllProperties, [limit, offset])
          ]);

          const totalCount = parseInt(countResult.rows[0]?.total || '0');

          return {
              properties: propertiesResult.rows as PropertyListItem[],
              totalCount
          };
      } catch (error: any) {
          console.error('Error fetching properties:', error);
          throw new Error(`Database error while fetching properties: ${error.message}`);
      }
  }

  async update(id: number, props: Partial<CreatePropertyRequest>): Promise<void> {
      const client = await db.connect();
      try {
          const { 
              titleEn, titleAr, descriptionEn, descriptionAr, addressEn, addressAr, 
              features, name, email, phone, priceAmount, bedrooms, bathrooms, 
              areaSqm, listingType, status, available_from, propertyTypeId, projectId
          } = props;

          await client.sql`BEGIN`;

          // Update main property data
          await client.query(UPDATE_QUIRES.updateProperty, [
              priceAmount, bedrooms, bathrooms, areaSqm, listingType, 
              status, available_from, propertyTypeId, projectId, id
          ]);

          // Update translations
          await Promise.all([
              client.query(UPDATE_QUIRES.updatePropertyTranslations, [
                  id, titleEn, descriptionEn, addressEn, 'en'
              ]),
              client.query(UPDATE_QUIRES.updatePropertyTranslations, [
                  id, titleAr, descriptionAr, addressAr, 'ar'
              ])
          ]);

          // Update features
          await client.query(DELETE_QUIRES.deleteFeaturesFromProperty, [id]);
          
          if (features && features.length > 0) {
              const featurePromises = features.map(featureId =>
                  client.query(WRITE_QUERIES.createPropertyFeatures, [id, featureId])
              );
              await Promise.all(featurePromises);
          }
          
          // Update contact info
          await client.query(UPDATE_QUIRES.updatePropertyContact, [id, name, email, phone]);

          // Update approval status
          await client.query(UPDATE_QUIRES.updatePropertyAppropvalToFalse, [id]);

          await client.sql`COMMIT`;
      } catch (error) {
          console.error('Property update transaction failed:', error);
          try {
              await client.sql`ROLLBACK`;
              console.log('Update transaction rolled back successfully');
          } catch (rollbackError) {
              console.error('Update rollback failed:', rollbackError);
              throw new Error(`Update failed and rollback failed: ${rollbackError}`);
          }
          
          if (error instanceof Error) {
              throw new Error(`Property update failed: ${error.message}`);
          }
          throw new Error('Property update failed: Unknown error');
      } finally {
          client.release();
      }
  }

  async delete(id: number): Promise<void> {
      try {
          const result = await sql.query(DELETE_QUIRES.deleteProperty, [id]);
          
          // Check if any rows were affected
          if (result.rowCount === 0) {
              throw new Error(`No property found with ID ${id} to delete`);
          }
      } catch (error: any) {
          console.error('Error deleting property:', error);
          throw new Error(`Database error while deleting property with ID ${id}: ${error.message}`);
      }
  }

  async findPropertyIDandUserID(propertyId: number, userId: number): Promise<boolean> {
      try {
          const result = await sql.query(READ_QUERIES.findPropertyIDandUserID, [propertyId, userId]);
          return result.rows.length > 0;
      } catch (error: any) {
          console.error('Error checking property and user ID authorization:', error);
          throw new Error(`Database error during authorization check: ${error.message}`);
      }
  }
}