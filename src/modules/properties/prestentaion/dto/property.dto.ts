import { ActionInput, ContactInput, DeveloperInput, FeatureInput, LocationInput, ProjectInput, PropertyTypeInput } from "../../domain/valueObjects/helpers.vo";

export interface Property {
    id: string;
    priceAmount: number;
    bedrooms: number;
    bathrooms: number;
    areaSqm: number;
    status: string;

    // realtions
    developer: DeveloperInput;
    location: LocationInput;
    propertyType: PropertyTypeInput;
    project?: ProjectInput; // Optional
    features?: FeatureInput[];
    actions?: ActionInput[];
    contacts?: ContactInput;

    // Bilingual content
    titleEn: string;
    titleAr: string;
    DescritpionEn: string;
    DescritpionAr: string;
    typeEn: string;
    typeAr: string;
    addressEn : string;
    addressAr: string;
}

export interface MultipleProperties {
    properties: Property[];
    limit: number;
    page: number;
    total: number;
    hasNext: boolean;
    hasPrevious: boolean;
}
  