import { MLSIDValueObject } from "../domain/valueObjects/mls-ID.vo";
import { PropertiesRepositoryImp } from "../infrastructure/PropertyRepositoryImp";
import { PropertySchema } from "../infrastructure/validation/propertySchema";
import { CreatePropertyRequest } from "../prestentaion/dto/CreatePropertyRequest.dto";

export class PropertyService {
  constructor(
    private readonly propertyRepository: PropertiesRepositoryImp) {}

  async create(props: CreatePropertyRequest, userId: number) {
    try { 
      
      const propertyToCreate = {
        ...props,
        userId: userId,
      };

      const { error } = PropertySchema.validate(propertyToCreate)
      if (error) {
        throw new Error(error.details[0].message)
      }
      // optionally convert to entity here before saving
      await this.propertyRepository.create(propertyToCreate);

      return { success: true };
    } catch (error) {
      // Better error handling
      console.error("Error creating property:", error);
      throw new Error("Failed to create property." + error);
    }
  }

  async getProjects() {
    try {
      return this.propertyRepository.getProjects()
    } catch (error) {
      console.error("Error in retriveing projects:", error);
      throw new Error("Failed to retrive projects." + error);
    }
  }
}
