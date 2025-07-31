export interface CreatePropertyRequest {
    userId: number;
  
    priceAmount: number;
  
    bedrooms: number;
    bathrooms: number;
    areaSqm: number;
  
    listingType: string;
    status: string;
  
    available_from: string;
  
    propertyTypeId: number;
    projectId: number;
  
    titleEn: string;
    titleAr: string;
  
    descriptionEn?: string | null;
    descriptionAr?: string | null;
  
    addressEn: string;
    addressAr: string;
  
    features:number[];
  
    name : string;
    email : string;
    phone : string; 
  }
  