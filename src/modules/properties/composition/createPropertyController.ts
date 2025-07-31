import { PropertyApplicationService } from '../../properties/application/services/PropertyApplicationService';
import { PropertyDomainService } from '../../properties/domain/services/PropertyDomainService';
import { PropertyApprovalDomainService } from '../../properties/domain/services/PropertyApprovalDomainService';
import { PropertyLookupDomainService } from '../../properties/domain/services/PropertyLookupDomainService';
import { CreatePropertyUseCase } from '../../properties/application/use-cases/CreateProperty.usecase';
import { UploadPropertyPhotosUseCase } from '../../properties/application/use-cases/UploadPropertyPhotos.usecase';
import { PropertyApprovalWorkflowUseCase } from '../../properties/application/use-cases/PropertyApprovalWorkflow.usecase';

import { PropertyRepositoryImplementation } from "../../properties/infrastructure/repositories/PropertyRepository.impl";
import { PropertyApprovalRepositoryImplementation } from "../../properties/infrastructure/repositories/PropertyApprovalRepository.impl";
import { PropertyLookupRepositoryImplementation } from "../../properties/infrastructure/repositories/PropertyLookupRepository.impl";
import { PhotoRepositoryImplementation } from "../../properties/infrastructure/repositories/PhotoRepository.impl";
import { SupabaseUploader } from '../../properties/infrastructure/supabase/supbase.upload';
import { PropertyController } from '../prestentaion/contollers/PropertyController';
import { IPropertyRepository } from '../domain/repositories/IPropertyRepository';
import { IPropertyApprovalRepository } from '../domain/repositories/IPropertyApprovalRepository';
import { IPropertyLookupRepository } from '../domain/repositories/IPropertyLookupRepository';
import { IPhotoRepository } from '../domain/repositories/IPhotoRepository';
import { IUploader } from '../infrastructure/supabase/PhotoUploaderInterface';

export function createPropertyController(): PropertyController {
    const propertyRepo : IPropertyRepository = new PropertyRepositoryImplementation();
    const approvalRepo : IPropertyApprovalRepository = new PropertyApprovalRepositoryImplementation();
    const lookupRepo : IPropertyLookupRepository = new PropertyLookupRepositoryImplementation();
    const photoRepo : IPhotoRepository = new PhotoRepositoryImplementation();
    const uploader : IUploader = new SupabaseUploader();

    const propertyDomainService = new PropertyDomainService(propertyRepo);
    const approvalDomainService = new PropertyApprovalDomainService(approvalRepo);
    const lookupDomainService = new PropertyLookupDomainService(lookupRepo);
  
    const createPropertyUseCase = new CreatePropertyUseCase(propertyDomainService);
    const approvalWorkflowUseCase = new PropertyApprovalWorkflowUseCase(approvalDomainService);
    const uploadPhotosUseCase = new UploadPropertyPhotosUseCase(uploader, photoRepo);
  
    const appService = new PropertyApplicationService(
      propertyDomainService,
      approvalDomainService,
      lookupDomainService,
      createPropertyUseCase,
      approvalWorkflowUseCase,
      uploadPhotosUseCase
    );
  
    return new PropertyController(appService);
  }
  