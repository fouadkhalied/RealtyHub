import { sql } from "@vercel/postgres";
import { IPhotoRepository } from "../../domain/repositories/IPhotoRepository";
import { PropertyPhotoRecord } from "../../domain/valueObjects/propertyPhoto.helpers";
import { WRITE_QUERIES } from "../quires/quires.write";
import { READ_QUERIES } from "../quires/quires.read";
import { UPDATE_QUIRES } from "../quires/quires.update";

export class PhotoRepositoryImplementation implements IPhotoRepository {
  
  async savePropertyCoverPhoto(propertyId: number, photoData: string): Promise<PropertyPhotoRecord> {
    try {
      const result = await sql.query(UPDATE_QUIRES.savePropertyCoverPhoto, [propertyId, photoData]);
      return result.rows[0] as PropertyPhotoRecord;
    } catch (error) {
      console.error('Error saving property photo:', error);
      throw error;
    }
  }

  async savePropertyPhotos(propertyId: number, photoData: string[]): Promise<PropertyPhotoRecord[]> {
    const result = await sql.query(WRITE_QUERIES.savePropertyPhotos, [propertyId, photoData]);
    return result.rows as PropertyPhotoRecord[];
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
