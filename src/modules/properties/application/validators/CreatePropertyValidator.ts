import Joi from 'joi';
import { ListingType_EN } from '../../domain/enum/listingType.enum';
import { STATE_EN } from '../../domain/enum/state.enum';

export const PropertySchema = Joi.object({
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

  available_from: Joi.date().iso().required(),

  propertyTypeId: Joi.number().integer().positive().required(),
  projectId: Joi.number().integer().positive().required(),

  titleEn: Joi.string().max(255).required(),
  titleAr: Joi.string().max(255).required(),

  descriptionEn: Joi.string().max(255).disallow(null).required(),
  descriptionAr: Joi.string().max(255).disallow(null).required(),

  addressEn: Joi.string().max(255).required(),
  addressAr: Joi.string().max(255).required(),

  features: Joi.array().items(Joi.number()).required(),

  name : Joi.string().max(50).required(),
  email: Joi.string().max(60).required().custom((value, helpers) => {
    if (!value.includes('@') || !value.includes('.')) {
      return helpers.error('any.invalid');
    }
    return value;
  }, 'Basic email check'),
  phone : Joi.string().max(20).required(), 
});