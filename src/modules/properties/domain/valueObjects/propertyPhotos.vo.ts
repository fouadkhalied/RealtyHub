import { PropertyPhotoData, PropertyPhotoRecord, UploadResult } from "./propertyPhoto.vo";

export class PropertyPhoto {
    private files : Express.Multer.File[] = [];
    private maxPhotos : number = 10;
    private maxFileSize : number = 1 * 1024 * 1024; // 1 MB

    constructor(files : Express.Multer.File[]) {
        this.files = files

    }


}