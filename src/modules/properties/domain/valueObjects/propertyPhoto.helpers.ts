export interface UploadResult {
    fileName: string;
    publicUrl: string;
    fileSize: number;
    mimeType: string;
}

export interface PropertyPhotosInterface {
    fileName: string;
    isMain: boolean;
    buffer: Buffer;
    mimeType: string;
    size: number;
  }
  

export interface PropertyPhotoData {
    propertyId: number;
    fileName: string;
    url: string;
    fileSize: number;
    mimeType: string;
    isMain:boolean
}
  
export interface PropertyPhotoRecord {
    id: number;
    property_id: number;
    file_name: string;
    url: string;
    file_size: number;
    mime_type: string;
}  