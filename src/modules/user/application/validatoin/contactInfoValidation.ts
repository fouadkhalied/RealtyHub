import Joi from "joi";
import { ContactMessageDto } from "../../domain/entites/UserContactInfo";

export const contactMessageSchema = Joi.object<ContactMessageDto>({
    fullName: Joi.string().min(3).max(100).required(),
    emailAddress: Joi.string().email().required(),
    phoneNumber: Joi.string().pattern(/^[0-9+\-\s()]+$/).min(7).max(20).required(),
    propertyType: Joi.string().min(3).max(50).required(),
    subject: Joi.string().min(3).max(100).required(),
    message: Joi.string().min(5).max(1000).required(),
  });