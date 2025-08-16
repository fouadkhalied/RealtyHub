export interface CreatePropertyRequest {
  priceAmount: number;
  bedrooms: number;
  bathrooms: number;
  areaSqm: number;
  
  listingType: string;
  status: string;
  
  availableFrom: string;
  
  propertyTypeId: number;
  projectId: number;
  
  titleEn: string;
  titleAr: string;
  
  descriptionEn?: string | null;
  descriptionAr?: string | null;
  
  addressEn: string;
  addressAr: string;
  
  features: number[];
  
  name: string;
  email: string;
  phone: string;
  
  floor: number;
  totalFloors: number;
  minTimeToRead: number;
}