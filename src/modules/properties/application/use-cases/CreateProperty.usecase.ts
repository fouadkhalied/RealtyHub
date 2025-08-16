import { ResponseBuilder } from "../../../../libs/common/apiResponse/apiResponseBuilder";
import { ApiResponseInterface } from "../../../../libs/common/apiResponse/interfaces/apiResponse.interface";
import { ErrorCode } from "../../../../libs/common/errors/enums/basic.error.enum";
import { ErrorBuilder } from "../../../../libs/common/errors/errorBuilder";
import { PropertyDomainService } from "../../domain/services/PropertyDomainService";
import { CreatePropertyRequest } from "../dto/requests/CreatePropertyRequest.dto";

export class CreatePropertyUseCase {
    constructor(
        private readonly propertyDomainService: PropertyDomainService,
    ) {}

    async execute(props: CreatePropertyRequest, userId: number): Promise<ApiResponseInterface<{propertyId : number}>> {
        try {
            // Domain logic
            
            return await this.propertyDomainService.createProperty(props,userId);
            

            // Domain Event

            // for future changes


            // Notifications

            // if (this.notificationService) {
            //     await this.notificationService.notifyPropertyCreated(id, userId);
            // }
            
        } catch (error) {
            return ErrorBuilder.build(
                ErrorCode.PROPERTY_CREATION_FAILED, 
                `Failed to create property: ${error instanceof Error ? error.message : error}`,
                {ErrorLoaction : 'CreatePropertyUseCase'}
            )
        }
    }
}