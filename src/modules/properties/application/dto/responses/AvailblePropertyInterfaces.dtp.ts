import { PropertyFeature_AR, PropertyFeature_EN , PropertyFeature_IDS } from "../../../domain/enum/features.enum";
import { ListingType_AR, ListingType_EN } from "../../../domain/enum/listingType.enum";
import { PropertyTypeAr, PropertyTypeEn } from "../../../domain/enum/propertyType.enum";
import { STATE_AR, STATE_EN } from "../../../domain/enum/state.enum";

export const requiredInterfacesData = {
    features: {
      id: PropertyFeature_IDS,
      en: PropertyFeature_EN,
      ar: PropertyFeature_AR,
    },
  
    listingTypes: {
      en: ListingType_EN,
      ar: ListingType_AR,
    },
  
    propertyTypes: {
      en: PropertyTypeEn,
      ar: PropertyTypeAr,
    },
  
    states: {
      en: STATE_EN,
      ar: STATE_AR,
    },
  };
  