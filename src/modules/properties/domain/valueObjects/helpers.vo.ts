
// Input types for related entities
export interface DeveloperInput {
    id?: number; // If provided, use existing developer
    name?: string; // If no ID, create new developer
    nameAr?: string;
  }
  
  export interface LocationInput {
    id?: number;
    country?: string;
    countryAr?: string;
    governorate?: string;
    governorateAr?: string;
    area?: string;
    areaAr?: string;
    district?: string;
    districtAr?: string;
    latitude?: number;
    longitude?: number;
  }
  
  export interface PropertyTypeInput {
    id?: number;
    category?: string;
    categoryAr?: string;
    subtype?: string;
    subtypeAr?: string;
  }

  export interface ProjectInput {
    
  }
  
  export interface FeatureInput {
    id?: number;
    name?: string;
    nameAr?: string;
    icon?: string;
  }
  
  export interface ActionInput {
    id?: number;
    name?: string;
  }
  
  export interface ContactInput {
    phone?: string[];
    email?: string;
    name?: string;
  }