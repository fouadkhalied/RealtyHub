import { PropertyPhotosInterface } from "../../domain/valueObjects/propertyPhoto.helpers";

// application/IUploader.ts
export interface IUploader {
    upload(file: PropertyPhotosInterface): Promise<boolean>;
    getUrl(filePath : string) : Promise<string>;
}
  