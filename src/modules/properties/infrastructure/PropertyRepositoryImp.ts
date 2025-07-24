import { PropertiesRepositoryInterface } from "../domain/repository/repository.interface";
import { CreatePropertyRequest } from "../prestentaion/dto/CreatePropertyRequest.dto";
import { Property } from "../prestentaion/dto/property.dto";
import { 
  DeveloperInput, 
  LocationInput, 
  ProjectWithDeveloperAndLocation, 
  PropertyTypeInput,
  FeatureInput,
  ActionInput,
  ContactInput 
} from "../domain/valueObjects/helpers.vo";
import { MLSIDValueObject } from "../domain/valueObjects/mls-ID.vo";
import { sql } from "@vercel/postgres";

export class PropertiesRepositoryImp implements PropertiesRepositoryInterface {
  
  async create(data: CreatePropertyRequest): Promise<number> {
    const result = await sql`
      INSERT INTO properties (
        price_amount,
        bedrooms,
        bathrooms,
        area_sqm,
        listing_type,
        status,
        coverImageUrl,
        available_from,
        property_type_id,
        project_id,
        title_en,
        title_ar,
        description_en,
        description_ar,
        address_en,
        address_ar,
        user_id
      ) VALUES (
        ${data.priceAmount},
        ${data.bedrooms},
        ${data.bathrooms},
        ${data.areaSqm},
        ${data.listingType},
        ${data.state},
        ${data.coverImageUrl},
        ${data.available_from},
        ${data.propertyTypeId},
        ${data.projectId},
        ${data.titleEn},
        ${data.titleAr},
        ${data.descriptionEn},
        ${data.descriptionAr},
        ${data.addressEn},
        ${data.addressAr},
        ${data.userId}
      )
      RETURNING id;
    `;
  
    return result.rows[0].id as number;
  }

  async getProjects(): Promise<ProjectWithDeveloperAndLocation[] | null> {
    try {
      const result = await sql`
        SELECT 
          p.id, 
          p.name, 
          p.developer_id,
          p.location_id,
          d.name as developer_name,
          l.country, l.governorate, l.area, l.district
        FROM projects p
        LEFT JOIN developers d ON p.developer_id = d.id
        LEFT JOIN locations l ON p.location_id = l.id
        ORDER BY p.name
      `;

      return result.rows.map((row: any) => ({
        id: row.id,
        name: row.name,
        developer_id: row.developer_id,
        location_id: row.location_id,
        developer_name: row.developer_name,
        country: row.country,
        governorate: row.governorate,
        area: row.area,
        district: row.district,
      }));

    } catch (error:any) {
      throw new Error(`Failed to get projects: ${error.message}`);
    }
  }

  async getPropertyType(): Promise<PropertyTypeInput[] | null> {
    try {
      const query = `
        SELECT id, category, subtype
        FROM property_types
        ORDER BY category, subtype
      `;
      
      const result = await this.executeQuery(query);
      
      if (!result || result.length === 0) {
        return null;
      }

      return result.map((row: any) => ({
        id: row.id,
        category: row.category,
        subtype: row.subtype
      }));

    } catch (error:any) {
      throw new Error(`Failed to get property types: ${error.message}`);
    }
  }

  async findById(id: string): Promise<Property | null> {
    try {
      const query = `
        SELECT 
          p.*,
          d.name as developer_name,
          l.country, l.governorate, l.area, l.district, l.latitude, l.longitude,
          pt.category, pt.subtype,
          pr.name as project_name
        FROM properties p
        LEFT JOIN developers d ON p.developer_id = d.id
        LEFT JOIN locations l ON p.location_id = l.id
        LEFT JOIN property_types pt ON p.property_type_id = pt.id
        LEFT JOIN projects pr ON p.project_id = pr.id
        WHERE p.id = $1
      `;
      
      const result = await this.executeQuery(query, [id]);
      
      if (!result || result.length === 0) {
        return null;
      }

      const row = result[0];
      
      // Get features, actions, and contacts
      const [features, actions, contacts] = await Promise.all([
        this.getPropertyFeatures(id),
        this.getPropertyActions(id),
        this.getPropertyContacts(id)
      ]);

      return this.mapRowToProperty(row, features, actions, contacts);

    } catch (error:any) {
      throw new Error(`Failed to find property by ID: ${error.message}`);
    }
  }

  async findByMlsId(mlsId: string): Promise<Property | null> {
    try {
      const query = `
        SELECT 
          p.*,
          d.name as developer_name,
          l.country, l.governorate, l.area, l.district, l.latitude, l.longitude,
          pt.category, pt.subtype,
          pr.name as project_name
        FROM properties p
        LEFT JOIN developers d ON p.developer_id = d.id
        LEFT JOIN locations l ON p.location_id = l.id
        LEFT JOIN property_types pt ON p.property_type_id = pt.id
        LEFT JOIN projects pr ON p.project_id = pr.id
        WHERE p.mls_id = $1
      `;
      
      const result = await this.executeQuery(query, [mlsId]);
      
      if (!result || result.length === 0) {
        return null;
      }

      const row = result[0];
      
      // Get features, actions, and contacts
      const [features, actions, contacts] = await Promise.all([
        this.getPropertyFeatures(row.id),
        this.getPropertyActions(row.id),
        this.getPropertyContacts(row.id)
      ]);

      return this.mapRowToProperty(row, features, actions, contacts);

    } catch (error:any) {
      throw new Error(`Failed to find property by MLS ID: ${error.message}`);
    }
  }

  async update(id: string, props: Partial<CreatePropertyRequest>): Promise<void> {
    try {
      const updateFields: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      // Build dynamic update query
      Object.entries(props).forEach(([key, value]) => {
        if (value !== undefined && key !== 'mlsId') {
          const dbField = this.mapFieldToDbColumn(key);
          updateFields.push(`${dbField} = $${paramCount}`);
          values.push(value);
          paramCount++;
        }
      });

      if (updateFields.length === 0) {
        return; // Nothing to update
      }

      updateFields.push(`updated_at = NOW()`);
      values.push(id); // Add ID as last parameter

      const query = `
        UPDATE properties 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramCount}
      `;

      await this.executeQuery(query, values);

    } catch (error:any) {
      throw new Error(`Failed to update property: ${error.message}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const query = `DELETE FROM properties WHERE id = $1`;
      await this.executeQuery(query, [id]);
    } catch (error:any) {
      throw new Error(`Failed to delete property: ${error.message}`);
    }
  }

  async approveProperty(id: string): Promise<{success: boolean}> {
    try {
      const query = `
        UPDATE properties 
        SET is_approved = true, updated_at = NOW()
        WHERE id = $1
      `;
      
      const result = await this.executeQuery(query, [id]);
      
      return { success: true };

    } catch (error:any) {
      throw new Error(`Failed to approve property: ${error.message}`);
    }
  }

  // Helper methods
  private async getPropertyFeatures(propertyId: string): Promise<FeatureInput[]> {
    const query = `
      SELECT f.id, f.name, f.icon
      FROM features f
      JOIN property_features pf ON f.id = pf.feature_id
      WHERE pf.property_id = $1
    `;
    
    const result = await this.executeQuery(query, [propertyId]);
    return result?.map((row: any) => ({
      id: row.id,
      name: row.name,
      icon: row.icon
    })) || [];
  }

  private async getPropertyActions(propertyId: string): Promise<ActionInput[]> {
    const query = `
      SELECT a.id, a.name
      FROM actions a
      JOIN property_actions pa ON a.id = pa.action_id
      WHERE pa.property_id = $1
    `;
    
    const result = await this.executeQuery(query, [propertyId]);
    return result?.map((row: any) => ({
      id: row.id,
      name: row.name
    })) || [];
  }

  private async getPropertyContacts(propertyId: string): Promise<ContactInput[]> {
    const query = `
      SELECT id, contact_type, phone, email, name
      FROM contacts
      WHERE property_id = $1
    `;
    
    const result = await this.executeQuery(query, [propertyId]);
    return result?.map((row: any) => ({
      id: row.id,
      contactType: row.contact_type,
      phone: row.phone,
      email: row.email,
      name: row.name
    })) || [];
  }

  private mapRowToProperty(
    row: any, 
    features: FeatureInput[], 
    actions: ActionInput[], 
    contacts: ContactInput[]
  ): Property {
    return {
      id: row.id,
      mlsId: MLSIDValueObject.fromString(row.mls_id),
      priceAmount: row.price_amount,
      bedrooms: row.bedrooms,
      bathrooms: row.bathrooms,
      areaSqm: row.area_sqm,
      developer: {
        id: row.developer_id,
        name: row.developer_name
      },
      location: {
        id: row.location_id,
        country: row.country,
        governorate: row.governorate,
        area: row.area,
        district: row.district,
        latitude: row.latitude,
        longitude: row.longitude
      },
      propertyType: {
        id: row.property_type_id,
        category: row.category,
        subtype: row.subtype
      },
      project: row.project_id ? {
        id: row.project_id,
        name: row.project_name
      } : undefined,
      features: features.length > 0 ? features : undefined,
      actions: actions.length > 0 ? actions : undefined,
      contacts: contacts.length > 0 ? contacts : undefined,
      titleEn: row.title_en || '',
      titleAr: row.title_ar || '',
      DescritpionEn: row.description_en || '',
      DescritpionAr: row.description_ar || '',
      typeEn: row.type_en || '',
      typeAr: row.type_ar || '',
      addressEn: row.address_en || '',
      addressAr: row.address_ar || ''
    };
  }

  private mapFieldToDbColumn(field: string): string {
    const fieldMap: { [key: string]: string } = {
      'priceAmount': 'price_amount',
      'areaSqm': 'area_sqm',
      'yearBuilt': 'year_built',
      'listingType': 'listing_type',
      'listedBy': 'listed_by',
      'parkingSpaces': 'parking_spaces',
      'developerId': 'developer_id',
      'locationId': 'location_id',
      'propertyTypeId': 'property_type_id',
      'projectId': 'project_id',
      'titleEn': 'title_en',
      'titleAr': 'title_ar',
      'DescritpionEn': 'description_en',
      'DescritpionAr': 'description_ar',
      'typeEn': 'type_en',
      'typeAr': 'type_ar',
      'addressEn': 'address_en',
      'addressAr': 'address_ar'
    };

    return fieldMap[field] || field.toLowerCase();
  }

  private generateUUID(): string {
    // Simple UUID v4 generator (in production, use crypto.randomUUID() or uuid library)
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // Abstract method for database connection - implement based on your DB library
  private async executeQuery(query: string, params: any[] = []): Promise<any[]> {
    // This should be implemented based on your database library
    // Example implementations:
    
    // For pg (PostgreSQL):
    // return await this.client.query(query, params).then(result => result.rows);
    
    // For mysql2:
    // return await this.connection.execute(query, params).then(([rows]) => rows);
    
    // For now, throwing an error to indicate implementation needed
    throw new Error('Database connection method not implemented. Please implement executeQuery based on your database library.');
  }
}