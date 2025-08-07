export interface PropertyListItem  {
    id: number;
    price_amount: number;
    area_sqm: number;
    bedrooms: number;
    listing_type: string;
    coverimageurl: string | null;
    status: string;
    is_approved: boolean;
    additional_information: {
      en: {
        title: string | null;
        address: string | null;
      };
      ar: {
        title: string | null;
        address: string | null;
      };
    };
}