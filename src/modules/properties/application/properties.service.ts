import { supabase, supabaseClient } from "../../../infrastructure/supabase/supbase.connect";
import { PropertyFeature_AR, PropertyFeature_EN } from "../domain/enum/features.enum";
import { ListingType_AR, ListingType_EN } from "../domain/enum/listingType.enum";
import { PropertyTypeAr, PropertyTypeEn } from "../domain/enum/propertyType.enum";
import { STATE_AR, STATE_EN } from "../domain/enum/state.enum";
import { PropertiesServiceInterface } from "../domain/service/service.interface";
import { PaginatedResponse } from "../domain/valueObjects/pagination.vo";
import { PropertyPhotoData, PropertyPhotoRecord, UploadResult } from "../domain/valueObjects/propertyPhoto.vo";
import { PropertiesRepositoryImplementation } from "../infrastructure/PropertyRepositoryImp";
import { EnhancedPropertyResult, enhancePropertyWithLocalization } from "../infrastructure/translation/property.translate";
import { PropertySchema } from "../infrastructure/validation/propertySchema";
import { CreatePropertyRequest } from "../prestentaion/dto/CreatePropertyRequest.dto";
import { PropertyQueryResult } from "../prestentaion/dto/GetPropertyResponse.dto";
import { PropertyStatus } from "../prestentaion/dto/GetPropertyStatus";
import { requiredInterfacesData } from "../prestentaion/dto/GetRequiredInterfaces.dto";

export class PropertyService implements PropertiesServiceInterface {
  constructor(
    private readonly propertyRepository: PropertiesRepositoryImplementation) {}

  async create(props: CreatePropertyRequest, userId: number) {
    try { 
      
      const propertyToCreate = {
        ...props,
        userId: userId,
      };

      const { error } = PropertySchema.validate(propertyToCreate)
      if (error) {
        throw new Error(error.details[0].message)
      }
     
      const id : number = await this.propertyRepository.create(propertyToCreate);
      
      await this.propertyRepository.addFeaturesToProperty(id , propertyToCreate.features)

      return { success: true };
    } catch (error) {
      // Better error handling
      console.error("Error creating property in service :", error);
      throw new Error("Failed to create property in service ." + error);
    }
  }

  async getProjects() {
    try {
      return this.propertyRepository.getProjects()
    } catch (error) {
      console.error("Error in retriveing projects:", error);
      throw new Error("Failed to retrive projects." + error);
    }
  }

  async getPropertyTypes() {
    try {
      const result = this.propertyRepository.getPropertyType();
      return {
        propertyTypes : result ,
        PropertyFeature_EN ,
        PropertyFeature_AR ,
        ListingType_EN ,
        ListingType_AR ,
        PropertyTypeEn ,
        PropertyTypeAr ,
        STATE_EN,
        STATE_AR 
      }
    } catch (error) {
      console.error("Error in retriveing projects types :", error);
      throw new Error("Failed to retrive projects types ." + error);
    }
  }

  async getPropertyById(id: number): Promise<EnhancedPropertyResult | null> {
    const result: PropertyQueryResult | null = await this.propertyRepository.findById(id)
    
    if (!result) {
      return null;
    }
    
    return enhancePropertyWithLocalization(result)
  }

  async getAllProperties(
    page: number = 1, 
    limit: number = 10
  ): Promise<PaginatedResponse<EnhancedPropertyResult>> {
    // Validate pagination params
    if (page < 1) page = 1;
    if (limit < 1 || limit > 100) limit = 10; // Max limit of 100

    const { properties, totalCount } = await this.propertyRepository.findAll({ page, limit });

    // Enhance all properties with localization
    const enhancedProperties = properties.map(property => 
      enhancePropertyWithLocalization(property)
    );

    const totalPages = Math.ceil(totalCount / limit);

    return {
      data: enhancedProperties,
      pagination: {
        currentPage: page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1
      }
    };
  }

  async getRequiredInterfaces() : Promise<any> {
    return requiredInterfacesData
  }

  async approve(id : number) : Promise<{success: boolean}> {
    return await this.propertyRepository.approveProperty(id)
  }

  async reject(id : number) : Promise<{success: boolean}> {
    return await this.propertyRepository.rejectProperty(id)
  }

  async status() : Promise<PropertyStatus> {
    return await this.propertyRepository.status()
  }

  async getApprovedProperties() : Promise<number[]> {
    return await this.propertyRepository.getApproved()
  }

  async getPendingProperties() : Promise<number[]> {
    return await this.propertyRepository.getPending()
  }

  async authorizePropertyPhotoUpload(propertyId : number , userId : number) : Promise<boolean> {
    return await this.propertyRepository.findPropertyIDandUserID(propertyId,userId)
  }

  async prepareAndUploadSupabase(file: Express.Multer.File, propertyId: number): Promise<UploadResult> {
    // Create unique filename
    const fileExtension = file.originalname.split('.').pop() || 'jpg';
    const fileName = `property-${propertyId}-${Date.now()}.${fileExtension}`;
  
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('propertyphotos')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });
  
    if (uploadError) {
      throw new Error(`Storage upload failed: ${uploadError.message}`);
    }
  
    if (!uploadData) {
      throw new Error('Upload succeeded but no data returned');
    }
  
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('propertyphotos')
      .getPublicUrl(fileName);
  
    return {
      fileName: uploadData.path,
      publicUrl,
      fileSize: file.size,
      mimeType: file.mimetype
    };
  }

  async uploadPhotoRecord(photoData: PropertyPhotoData): Promise<PropertyPhotoRecord> {
    return await this.propertyRepository.savePropertyPhoto(photoData)
  }
}
