import { CreatePropertyRequest } from "../../prestentaion/dto/CreatePropertyRequest.dto";
import { EnhancedPropertyResult } from "../../infrastructure/translation/property.translate";
import { PaginatedResponse } from "../../domain/valueObjects/pagination.vo";
import { PropertyStatus } from "../../prestentaion/dto/GetPropertyStatus";
import { PropertyPhotoData, PropertyPhotoRecord, UploadResult } from "../valueObjects/propertyPhoto.vo";

export interface PropertiesServiceInterface {
  create(props: CreatePropertyRequest, userId: number): Promise<{ success: boolean }>;

  getProjects(): Promise<any>;

  getPropertyTypes(): Promise<{
    propertyTypes: any;
    PropertyFeature_EN: any;
    PropertyFeature_AR: any;
    ListingType_EN: any;
    ListingType_AR: any;
    PropertyTypeEn: any;
    PropertyTypeAr: any;
    STATE_EN: any;
    STATE_AR: any;
  }>;

  getPropertyById(id: number): Promise<EnhancedPropertyResult | null>;

  getAllProperties(
    page?: number,
    limit?: number
  ): Promise<PaginatedResponse<EnhancedPropertyResult>>;

  getRequiredInterfaces(): Promise<any>;

  approve(id: number): Promise<{ success: boolean }>;

  reject(id: number): Promise<{ success: boolean }>;

  status(): Promise<PropertyStatus>;

  getApprovedProperties(): Promise<number[]>;

  getPendingProperties(): Promise<number[]>;

  authorizePropertyPhotoUpload(propertyId: number, userId: number): Promise<boolean>;

  prepareAndUploadSupabase(file: Express.Multer.File, propertyId: number): Promise<UploadResult>;

  uploadPhotoRecord(photoData: PropertyPhotoData): Promise<PropertyPhotoRecord>
}
