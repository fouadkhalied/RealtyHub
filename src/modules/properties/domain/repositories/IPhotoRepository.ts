import { PropertyPhotoRecord } from "../valueObjects/propertyPhoto.helpers";

export interface IPhotoRepository {
    savePropertyPhotos(propertyId : number , photoData: string[]): Promise<PropertyPhotoRecord[]>;
    savePropertyCoverPhoto(propertyId : number , photoData: string): Promise<PropertyPhotoRecord>;
  }