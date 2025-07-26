import { PropertiesRepositoryInterface } from "../domain/repository/repository.interface";
import { CreatePropertyRequest } from "../prestentaion/dto/CreatePropertyRequest.dto";
import { 
  ProjectWithDeveloperAndLocation, 
  PropertyTypeInput,
  FeatureInput,
  ActionInput,
  ContactInput 
} from "../domain/valueObjects/helpers.vo";
import { sql } from "@vercel/postgres";
import { PropertyQueryResult } from "../prestentaion/dto/GetPropertyResponse.dto";
import { PaginationParams } from "../domain/valueObjects/pagination.vo";
import { PropertyStatus } from "../prestentaion/dto/GetPropertyStatus";

export class PropertiesRepositoryImplementation implements PropertiesRepositoryInterface {
  
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
        ${data.status},
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
        project_id: row.id,
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
      const result = await sql`
        SELECT id, category, subtype
        FROM property_types
        ORDER BY category, subtype
      `;

      return result.rows
    } catch (error:any) {
      throw new Error(`Failed to get property types: ${error.message}`);
    }
  }

  async findById(id: number): Promise<PropertyQueryResult | null> {
    try {
      const result = await sql`
        SELECT 
  p.price_amount,
  p.bedrooms,
  p.bathrooms,
  p.area_sqm,
  p.listing_type,
  p.coverimageurl,
  p.is_approved,
  p.status,
  p.available_from,

  -- Grouped additional info
    json_build_object(
    'en', json_build_object(
      'title', p.title_en,
      'address', p.address_en,
      'description', p.description_en
    ),
    'ar', json_build_object(
      'title', p.title_ar,
      'address', p.address_ar,
      'description', p.description_ar
    )
  ) AS additional_information,

  -- Project object (no id)
  json_build_object(
    'name', pr.name
  ) AS project,

  -- Developer object (no id)
  json_build_object(
    'name', d.name
  ) AS developer,

  -- Location object (no id)
  json_build_object(
    'country', l.country,
    'governorate', l.governorate,
    'area', l.area,
    'district', l.district
  ) AS location,

  -- Property type object (no id)
  json_build_object(
    'category', pt.category,
    'subtype', pt.subtype
  ) AS property_type,

  -- Contact object (no id)
  json_build_object(
    'name', c.name,
    'phone', c.phone,
    'email', c.email,
    'contact_type', c.contact_type
  ) AS contact,

  -- Features array
  COALESCE(json_agg(DISTINCT jsonb_build_object(
    'name', f.name,
    'icon', f.icon
  )) FILTER (WHERE f.id IS NOT NULL), '[]') AS features,

  -- Actions array
  COALESCE(json_agg(DISTINCT jsonb_build_object(
    'name', a.name
  )) FILTER (WHERE a.id IS NOT NULL), '[]') AS actions

FROM properties p
LEFT JOIN projects pr ON p.project_id = pr.id
LEFT JOIN developers d ON pr.developer_id = d.id
LEFT JOIN locations l ON pr.location_id = l.id
LEFT JOIN property_types pt ON p.property_type_id = pt.id
LEFT JOIN contacts c ON p.user_id = c.id AND p.id = c.property_id
LEFT JOIN property_features pf ON p.id = pf.property_id
LEFT JOIN features f ON pf.feature_id = f.id
LEFT JOIN property_actions pa ON p.id = pa.property_id
LEFT JOIN actions a ON pa.action_id = a.id
WHERE p.id = ${id}
GROUP BY 
  p.id, pr.name, d.name, l.country, l.governorate, l.area, l.district,
  pt.category, pt.subtype, c.name, c.phone, c.email, c.contact_type;

      `;

      return result.rows[0] as PropertyQueryResult

    } catch (error:any) {
      throw new Error(`Failed to find property by ID: ${error.message}`);
    }
  }

  async findAll(params: PaginationParams): Promise<{ properties: PropertyQueryResult[], totalCount: number }> {
    try {
      const { page, limit } = params;
      const offset = (page - 1) * limit;

      // Get total count
      const countResult = await sql`
        SELECT COUNT(DISTINCT p.id) as total
        FROM properties p
      `;

      const totalCount = parseInt(countResult.rows[0].total);

      // Get paginated properties using the same query structure as findById
      const result = await sql`
        SELECT 
          p.price_amount,
          p.bedrooms,
          p.bathrooms,
          p.area_sqm,
          p.listing_type,
          p.coverimageurl,
          p.is_approved,
          p.status,
          p.available_from,

          -- Grouped additional info
          json_build_object(
            'en', json_build_object(
              'title', p.title_en,
              'address', p.address_en,
              'description', p.description_en
            ),
            'ar', json_build_object(
              'title', p.title_ar,
              'address', p.address_ar,
              'description', p.description_ar
            )
          ) AS additional_information,

          -- Project object (no id)
          json_build_object(
            'name', pr.name
          ) AS project,

          -- Developer object (no id)
          json_build_object(
            'name', d.name
          ) AS developer,

          -- Location object (no id)
          json_build_object(
            'country', l.country,
            'governorate', l.governorate,
            'area', l.area,
            'district', l.district
          ) AS location,

          -- Property type object (no id)
          json_build_object(
            'category', pt.category,
            'subtype', pt.subtype
          ) AS property_type,

          -- Contact object (no id)
          json_build_object(
            'name', c.name,
            'phone', c.phone,
            'email', c.email,
            'contact_type', c.contact_type
          ) AS contact,

          -- Features array
          COALESCE(json_agg(DISTINCT jsonb_build_object(
            'name', f.name,
            'icon', f.icon
          )) FILTER (WHERE f.id IS NOT NULL), '[]') AS features,

          -- Actions array
          COALESCE(json_agg(DISTINCT jsonb_build_object(
            'name', a.name
          )) FILTER (WHERE a.id IS NOT NULL), '[]') AS actions

        FROM properties p
        LEFT JOIN projects pr ON p.project_id = pr.id
        LEFT JOIN developers d ON pr.developer_id = d.id
        LEFT JOIN locations l ON pr.location_id = l.id
        LEFT JOIN property_types pt ON p.property_type_id = pt.id
        LEFT JOIN contacts c ON p.user_id = c.id AND p.id = c.property_id
        LEFT JOIN property_features pf ON p.id = pf.property_id
        LEFT JOIN features f ON pf.feature_id = f.id
        LEFT JOIN property_actions pa ON p.id = pa.property_id
        LEFT JOIN actions a ON pa.action_id = a.id
        GROUP BY 
          p.id, pr.name, d.name, l.country, l.governorate, l.area, l.district,
          pt.category, pt.subtype, c.name, c.phone, c.email, c.contact_type
        ORDER BY p.id DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `;

      return {
        properties: result.rows as PropertyQueryResult[],
        totalCount
      }
    } catch (error: any) {
        throw new Error(`Failed to fetch properties: ${error.message}`);
      }
    }

    async addFeaturesToProperty(id: number, features: number[]): Promise<boolean> {
      if (features.length === 0) return true;
    
      try {
        // Build the VALUES clause as a string with placeholders
        const placeholders = features.map((_, index) => `($${index * 2 + 1}, $${index * 2 + 2})`).join(', ');
        const values = features.flatMap(featureId => [id, featureId]);
        
        await sql.query(
          `INSERT INTO property_features (property_id, feature_id) VALUES ${placeholders}`,
          values
        );
    
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

  async delete(id: number): Promise<void> {
    try {
      const query = `DELETE FROM properties WHERE id = $1`;
      await this.executeQuery(query, [id]);
    } catch (error:any) {
      throw new Error(`Failed to delete property: ${error.message}`);
    }
  }

  async approveProperty(id: number): Promise<{success: boolean}> {
    try {
      await sql`
        UPDATE properties 
        SET is_approved = true
        WHERE id = ${id}
      `;

      return { success: true };

    } catch (error:any) {
      throw new Error(`Failed to approve property: ${error.message}`);
    }
  }

  async rejectProperty(id: number): Promise<{success: boolean}> {
    try {
      await sql`
        DELETE FROM properties WHERE id = ${id}
      `;

      return { success: true };

    } catch (error: any) {
      throw new Error(`Failed to delete property: ${error.message}`);
    }
  }

  async status(): Promise<PropertyStatus> {
    try {
      const result = await sql`
        SELECT 
          COUNT(CASE WHEN is_approved = true THEN 1 END) AS approved,
          COUNT(CASE WHEN is_approved = false THEN 1 END) AS pending,
          COUNT(*) AS total
        FROM properties;`;
  
      return result.rows[0] as PropertyStatus;
    } catch (error) {
      console.error('Error fetching property status counts:', error);
      throw error;
    }
  }

  async getApproved(): Promise<number[]> {
    try {
      const result = await sql`
        SELECT id
        FROM properties
        WHERE is_approved = true;`;
  
      return result.rows.map(row => row.id);
    } catch (error) {
      console.error('Error fetching pending property IDs:', error);
      throw error;
    }
  }

  async getPending(): Promise<number[]> {
    try {
      const result = await sql`
        SELECT id
        FROM properties
        WHERE is_approved = false;`;
  
      return result.rows.map(row => row.id);
    } catch (error) {
      console.error('Error fetching pending property IDs:', error);
      throw error;
    }
  }

  // Helper methods
  private async getPropertyFeatures(propertyId: number): Promise<FeatureInput[]> {
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