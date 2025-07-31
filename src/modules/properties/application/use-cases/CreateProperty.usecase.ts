import { PropertyDomainService } from "../../domain/services/PropertyDomainService";
import { CreatePropertyRequest } from "../dto/requests/CreatePropertyRequest.dto";

export class CreatePropertyUseCase {
    constructor(
        private readonly propertyDomainService: PropertyDomainService,
    ) {}

    async execute(props: CreatePropertyRequest, userId: number): Promise<number> {
        try {
            const propertyToCreate = { ...props, userId };
            
            // Domain logic
            const id = await this.propertyDomainService.createProperty(propertyToCreate);
            
            // Notifications

            // if (this.notificationService) {
            //     await this.notificationService.notifyPropertyCreated(id, userId);
            // }
            
            return id;
        } catch (error) {
            console.error("Error in CreatePropertyUseCase:", error);
            throw new Error(`Failed to create property: ${error instanceof Error ? error.message : error}`);
        }
    }
}