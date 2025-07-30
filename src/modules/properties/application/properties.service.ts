import { supabase, supabaseClient } from "../../../infrastructure/supbase/supbase.connect";
import { PropertyFeature_AR, PropertyFeature_EN } from "../domain/enum/features.enum";
import { ListingType_AR, ListingType_EN } from "../domain/enum/listingType.enum";
import { PropertyTypeAr, PropertyTypeEn } from "../domain/enum/propertyType.enum";
import { STATE_AR, STATE_EN } from "../domain/enum/state.enum";
import { PaginatedResponse } from "../domain/valueObjects/pagination.vo";
import { PropertyPhotoData, PropertyPhotoRecord, UploadResult } from "../domain/valueObjects/propertyPhoto.helpers";
import { PhotoRepositoryAdapter } from "../infrastructure/adapters/PhotoRepositoryAdapter";
import { PropertiesRepositoryImplementation } from "../infrastructure/PropertyRepositoryImp";
import { SupabaseUploader } from "../infrastructure/supabase/supbase.upload";
import { EnhancedPropertyResult, enhancePropertyWithLocalization } from "../infrastructure/translation/property.translate";
import { PropertySchema } from "../infrastructure/validation/propertySchema";
import { CreatePropertyRequest } from "../prestentaion/dto/CreatePropertyRequest.dto";
import { ProjectWithDeveloperAndLocation } from "../prestentaion/dto/GetAvailbleProjects.dto";
import { PropertyListItem } from "../prestentaion/dto/GetMultipleProperties.dto";
import { PropertyQueryResult } from "../prestentaion/dto/GetPropertyResponse.dto";
import { PropertyStatus } from "../prestentaion/dto/GetPropertyStatus";
import { requiredInterfacesData } from "../prestentaion/dto/GetRequiredInterfaces.dto";
import { UploadPhotosUseCase } from "./usecase/propertyPhotoUpload.usecase";
import { IUploader } from "../infrastructure/supabase/PhotoUploaderInterface";

export class PropertyService {
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

      return { success: true , id : id };
    } catch (error) {
      // Better error handling
      console.error("Error creating property in service :", error);
      throw new Error("Failed to create property in service ." + error);
    }
  }

  async getProjects(limit : number = 10 , page : number = 1) : Promise<PaginatedResponse<ProjectWithDeveloperAndLocation>> {
    try {
      if (page < 1) page = 1;
      if (limit < 1 || limit > 100) limit = 10; // Max limit of 100
      const {projects , totalCount } = await this.propertyRepository.getProjects({ page, limit });

      const totalPages = Math.ceil(totalCount / limit);

      return {
        data: projects,
        pagination: {
          currentPage: page,
          limit,
          totalCount,
          totalPages,
          hasNext: page < totalPages,
          hasPrevious: page > 1
        }
      };
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
  ): Promise<PaginatedResponse<PropertyListItem>> {
    // Validate pagination params
    if (page < 1) page = 1;
    if (limit < 1 || limit > 100) limit = 10; // Max limit of 100

    const { properties, totalCount } = await this.propertyRepository.findAll({ page, limit });

    // Enhance all properties with localization
    

    const totalPages = Math.ceil(totalCount / limit);

    return {
      data: properties,
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

  async uploadPhotos(
    propertyId : number,
    files : Express.Multer.File[],
    coverImageIndex : number,
    userId : number | undefined
  ) :Promise<{success : boolean , message : string}> {
    try {
      // Validate inputs
      if (!userId) {
        return {success : false , message : 'User not authenticated'};
      }

      if (isNaN(propertyId) || propertyId <= 0) {
        return { success : false , message: 'Invalid property ID' };
      }

      if (coverImageIndex !== null) {
        if (isNaN(coverImageIndex) || coverImageIndex < 0 || coverImageIndex >= files.length) {
          return{ success: false,
            message: `Invalid coverImageIndex. Must be a number between 0 and ${files.length - 1}` 
          }
        }
      }

      // start
      const uploadPhotoUseCase = new UploadPhotosUseCase(new SupabaseUploader(),propertyId,files,coverImageIndex,new PhotoRepositoryAdapter()) 
      await uploadPhotoUseCase.execute()

      return {success : true , message : `photos uploaded to property ${propertyId} successfully`}
    } catch (error) {
      throw new Error("Failed to upload pics." + error);
    }
  }
}
