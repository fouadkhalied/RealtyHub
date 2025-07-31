import { sql } from "@vercel/postgres";
import { IPropertyLookupRepository } from "../../domain/repositories/IPropertyLookupRepository";
import { READ_QUERIES } from "../quires/quires.read";
import { PaginationParams } from "../../domain/valueObjects/pagination.vo";
import { ProjectWithDeveloperAndLocation } from "../../application/dto/responses/ProjectResponse.dto";
import { PropertyTypeInput } from "../../domain/valueObjects/helpers.vo";

export class PropertyLookupRepositoryImplementation implements IPropertyLookupRepository {
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
}