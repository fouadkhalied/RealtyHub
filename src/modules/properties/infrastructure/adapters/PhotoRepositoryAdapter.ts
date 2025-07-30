import { sql } from "@vercel/postgres";
import { IPhotoRepository } from "../../domain/repositories/IPhotoRepository";
import { PropertyPhotoRecord } from "../../domain/valueObjects/propertyPhoto.helpers";
import { WRITE_QUERIES } from "../quires/quires.write";

export class PhotoRepositoryAdapter implements IPhotoRepository {
  
  async savePropertyCoverPhoto(propertyId: number, photoData: string): Promise<PropertyPhotoRecord> {
    try {
      const result = await sql.query(WRITE_QUERIES.savePropertyCoverPhoto, [propertyId, photoData]);
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
}
