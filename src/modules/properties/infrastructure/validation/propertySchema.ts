// validators/createProperty.validator.ts
import Joi from 'joi';
import { ListingType_EN } from '../../domain/enum/listingType.enum';
import { STATE_EN } from '../../domain/enum/state.enum';

export const PropertySchema = Joi.object({
  userId: Joi.number().integer().required(),
  priceAmount: Joi.number().positive().required(),
  bedrooms: Joi.number().integer().min(0).required(),
  bathrooms: Joi.number().integer().min(0).required(),
  areaSqm: Joi.number().positive().required(),

  listingType: Joi.string()
    .valid(...Object.values(ListingType_EN))
    .required(),

    status: Joi.string()
    .valid(...Object.values(STATE_EN))
    .required(),

  coverImageUrl: Joi.string().uri().required(),
  available_from: Joi.date().iso().required(),

  propertyTypeId: Joi.number().integer().positive().required(),
  projectId: Joi.number().integer().positive().required(),

  titleEn: Joi.string().max(255).required(),
  titleAr: Joi.string().max(255).required(),

  descriptionEn: Joi.string().allow('', null).optional(),
  descriptionAr: Joi.string().allow('', null).optional(),

  addressEn: Joi.string().max(255).required(),
  addressAr: Joi.string().max(255).required()
});
