export interface PropertyQueryResult {
    price_amount: number;
    bedrooms: number;
    bathrooms: number;
    area_sqm: number;
    listing_type: string;
    coverimageurl: string | null;
    is_approved: boolean;
    status: string;
    available_from: string | Date | null;
    
    additional_information: {
      en: {
        title: string | null;
        address: string | null;
        description: string | null;
      };
      ar: {
        title: string | null;
        address: string | null;
        description: string | null;
      };
    };
    
    project: {
      name: string | null;
    };
    
    developer: {
      name: string | null;
    };
    
    location: {
      country: string | null;
      governorate: string | null;
      area: string | null;
      district: string | null;
    };
    
    property_type: {
      category: string | null;
      subtype: string | null;
    };
    
    contact: {
      name: string | null;
      phone: string | null;
      email: string | null;
      contact_type: string | null;
    };
    
    features: Array<{
      name: string;
      icon: string | null;
    }>;
    
    actions: Array<{
      name: string;
    }>;
  }