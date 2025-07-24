import { PropertyFeature_EN , PropertyFeature_AR} from "../../domain/enum/features.enum";
import { ListingType_AR, ListingType_EN } from "../../domain/enum/listingType.enum";
import { PropertyTypeEn , PropertyTypeAr} from "../../domain/enum/propertyType.enum";
import { STATE_AR , STATE_EN} from "../../domain/enum/state.enum";
import { PropertyQueryResult } from "../../prestentaion/dto/GetPropertyResponse.dto"

export interface EnhancedPropertyResult extends PropertyQueryResult {
    listing_type_en?: string;
    listing_type_ar?: string;
    status_en?: string;
    status_ar?: string;
    
    property_type: {
      category: string | null;
      subtype: string | null;
      category_en?: string;
      category_ar?: string;
      subtype_en?: string;
      subtype_ar?: string;
    };
    
    features: Array<{
      name: string;
      icon: string | null;
      name_en?: string;
      name_ar?: string;
    }>;
  }
  
  // Helper function to find enum key by value
  function findEnumKey<T extends Record<string, string>>(enumObj: T, value: string): keyof T | null {
    const entry = Object.entries(enumObj).find(([, val]) => val === value);
    return entry ? entry[0] as keyof T : null;
  }
  
  // Main function to enhance property with localized attributes
  export function enhancePropertyWithLocalization(property: PropertyQueryResult): EnhancedPropertyResult {
    const enhanced = { ...property } as EnhancedPropertyResult;
  
    // Handle listing_type
    const listingTypeKey = findEnumKey(ListingType_EN, property.listing_type) || 
                           findEnumKey(ListingType_AR, property.listing_type);
    
    if (listingTypeKey) {
      enhanced.listing_type_en = ListingType_EN[listingTypeKey as keyof typeof ListingType_EN];
      enhanced.listing_type_ar = ListingType_AR[listingTypeKey as keyof typeof ListingType_AR];
    }
  
    // Handle status
    const statusKey = findEnumKey(STATE_EN, property.status) || 
                      findEnumKey(STATE_AR, property.status);
    
    if (statusKey) {
      enhanced.status_en = STATE_EN[statusKey as keyof typeof STATE_EN];
      enhanced.status_ar = STATE_AR[statusKey as keyof typeof STATE_AR];
    }
  
    // Handle property_type category
    if (property.property_type.category) {
      const categoryKey = findEnumKey(PropertyTypeEn, property.property_type.category) || 
                          findEnumKey(PropertyTypeAr, property.property_type.category);
      
      if (categoryKey) {
        enhanced.property_type = {
          ...enhanced.property_type,
          category_en: PropertyTypeEn[categoryKey as keyof typeof PropertyTypeEn],
          category_ar: PropertyTypeAr[categoryKey as keyof typeof PropertyTypeAr]
        };
      }
    }
  
    // Handle property_type subtype
    if (property.property_type.subtype) {
      const subtypeKey = findEnumKey(PropertyTypeEn, property.property_type.subtype) || 
                         findEnumKey(PropertyTypeAr, property.property_type.subtype);
      
      if (subtypeKey) {
        enhanced.property_type = {
          ...enhanced.property_type,
          subtype_en: PropertyTypeEn[subtypeKey as keyof typeof PropertyTypeEn],
          subtype_ar: PropertyTypeAr[subtypeKey as keyof typeof PropertyTypeAr]
        };
      }
    }
  
    // Handle features
    enhanced.features = property.features.map(feature => {
      const featureKey = findEnumKey(PropertyFeature_EN, feature.name) || 
                         findEnumKey(PropertyFeature_AR, feature.name);
      
      if (featureKey) {
        return {
          ...feature,
          name_en: PropertyFeature_EN[featureKey as keyof typeof PropertyFeature_EN],
          name_ar: PropertyFeature_AR[featureKey as keyof typeof PropertyFeature_AR]
        };
      }
      
      return feature;
    });
  
    return enhanced;
  }