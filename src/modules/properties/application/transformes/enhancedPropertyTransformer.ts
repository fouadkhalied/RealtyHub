import { PropertyFeature_EN , PropertyFeature_AR} from "../../domain/enum/features.enum";
import { ListingType_AR, ListingType_EN } from "../../domain/enum/listingType.enum";
import { PropertyTypeEn , PropertyTypeAr} from "../../domain/enum/propertyType.enum";
import { STATE_AR , STATE_EN} from "../../domain/enum/state.enum";
import { PropertyQueryResult } from "../dto/responses/PropertyResponse.dto"

  export interface EnhancedPropertyResult extends Omit<PropertyQueryResult, 'listing_type' | 'status' | 'property_type' | 'features'> {
    en: {
        listing_type: string;
        status: string;
        property_type: {
            category: string;
            subtype: string;
        };
        features: string[];
    };
    
    ar: {
        listing_type: string;
        status: string;
        property_type: {
            category: string;
            subtype: string;
        };
        features: string[];
    };
}

// Helper function to find enum key by value
function findEnumKey<T extends Record<string, string>>(enumObj: T, value: string): keyof T | null {
  const entry = Object.entries(enumObj).find(([, val]) => val === value);
  return entry ? entry[0] as keyof T : null;
}

// Main function to enhance property with localized attributes
export function enhancePropertyWithLocalization(property: PropertyQueryResult): EnhancedPropertyResult {
  const enhanced = { ...property } as any;

  // Handle listing_type - find the key and set both languages
  const listingTypeKey = findEnumKey(ListingType_EN, property.listing_type) || 
                         findEnumKey(ListingType_AR, property.listing_type);
  
  // Handle status - find the key and set both languages
  const statusKey = findEnumKey(STATE_EN, property.status) || 
                    findEnumKey(STATE_AR, property.status);
  
  // Handle property_type category and subtype
  const categoryKey = property.property_type?.category ? 
                      (findEnumKey(PropertyTypeEn, property.property_type.category) || 
                       findEnumKey(PropertyTypeAr, property.property_type.category)) : null;
  
  const subtypeKey = property.property_type?.subtype ? 
                     (findEnumKey(PropertyTypeEn, property.property_type.subtype) || 
                      findEnumKey(PropertyTypeAr, property.property_type.subtype)) : null;
  
  // Handle features
  const enhancedFeaturesEn = property.features
    ?.map(feature => {
      const featureKey = findEnumKey(PropertyFeature_EN, feature.name) || 
                         findEnumKey(PropertyFeature_AR, feature.name);
      
      return featureKey ? PropertyFeature_EN[featureKey as keyof typeof PropertyFeature_EN] : null;
    })
    .filter(name => name !== null) as string[] || [];

  const enhancedFeaturesAr = property.features
    ?.map(feature => {
      const featureKey = findEnumKey(PropertyFeature_EN, feature.name) || 
                         findEnumKey(PropertyFeature_AR, feature.name);
      
      return featureKey ? PropertyFeature_AR[featureKey as keyof typeof PropertyFeature_AR] : null;
    })
    .filter(name => name !== null) as string[] || [];

  // Set the localized values grouped by language
  enhanced.en = {
    listing_type: listingTypeKey ? ListingType_EN[listingTypeKey as keyof typeof ListingType_EN] : property.listing_type,
    status: statusKey ? STATE_EN[statusKey as keyof typeof STATE_EN] : property.status,
    property_type: {
      category: categoryKey ? PropertyTypeEn[categoryKey as keyof typeof PropertyTypeEn] : (property.property_type?.category || ''),
      subtype: subtypeKey ? PropertyTypeEn[subtypeKey as keyof typeof PropertyTypeEn] : (property.property_type?.subtype || '')
    },
    features: enhancedFeaturesEn
  };
  
  enhanced.ar = {
    listing_type: listingTypeKey ? ListingType_AR[listingTypeKey as keyof typeof ListingType_AR] : property.listing_type,
    status: statusKey ? STATE_AR[statusKey as keyof typeof STATE_AR] : property.status,
    property_type: {
      category: categoryKey ? PropertyTypeAr[categoryKey as keyof typeof PropertyTypeAr] : (property.property_type?.category || ''),
      subtype: subtypeKey ? PropertyTypeAr[subtypeKey as keyof typeof PropertyTypeAr] : (property.property_type?.subtype || '')
    },
    features: enhancedFeaturesAr
  };

  // Remove original fields that are now localized
  delete enhanced.listing_type;
  delete enhanced.status;
  delete enhanced.property_type;
  delete enhanced.features;

  return enhanced as EnhancedPropertyResult;
}