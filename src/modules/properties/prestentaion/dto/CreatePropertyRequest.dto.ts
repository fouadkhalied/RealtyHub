import { ListingType_EN } from "../../domain/enum/listingType.enum";
import { STATE_EN } from "../../domain/enum/state.enum";

export interface CreatePropertyRequest {
  mlsId: string;
  userId: number;

  priceAmount: number;

  bedrooms: number;
  bathrooms: number;
  areaSqm: number;

  listingType: ListingType_EN;
  state: STATE_EN;

  coverImageUrl: string;
  available_from: string;

  propertyTypeId: number;
  projectId: number;

  titleEn: string;
  titleAr: string;

  descriptionEn?: string | null;
  descriptionAr?: string | null;

  addressEn: string;
  addressAr: string;
}
