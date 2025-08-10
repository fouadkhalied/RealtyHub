import { Request, Response } from 'express';
import { PropertyApplicationService } from '../../application/services/PropertyApplicationService';
import { CreatePropertyRequest } from '../../application/dto/requests/CreatePropertyRequest.dto';
import { ErrorBuilder } from '../../../../libs/common/errors/errorBuilder';
import { ErrorCode } from '../../../../libs/common/errors/enums/basic.error.enum';
import { ERROR_STATUS_MAP } from '../../../../libs/common/errors/mapper/mapperErrorEnum';

interface AuthenticatedRequest extends Request {
    user?: {
        id: number;
        role: string;
        email: string;
    };
}

export class PropertyController {
    constructor(
        private readonly propertyApplicationService: PropertyApplicationService
    ) {}

    // ============= PROPERTY CRUD OPERATIONS =============

    async createProperty(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;

            if (!userId || isNaN(userId) || userId <= 0) {
                const err = ErrorBuilder.build(ErrorCode.INVALID_FORMAT, 'Invalid User ID');
                res.status(ERROR_STATUS_MAP[ErrorCode.INVALID_FORMAT]).json(err);
                return;
            }

            const serviceResponse = await this.propertyApplicationService.createProperty(req.body, userId);

            if (serviceResponse.success) {
                res.status(201).json(serviceResponse);
            } else {
                const statusCode = serviceResponse.error?.details?.httpStatus || 500;
                res.status(statusCode).json(serviceResponse);
            }
        } catch (error) {
            console.error('Error in createProperty:', error);
            const err = ErrorBuilder.build(ErrorCode.INTERNAL_SERVER_ERROR, 'Failed to create property');
            res.status(ERROR_STATUS_MAP[ErrorCode.INTERNAL_SERVER_ERROR]).json(err);
        }
    }

    async getPropertyById(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);

            if (isNaN(id) || id <= 0) {
                const err = ErrorBuilder.build(ErrorCode.INVALID_FORMAT, 'Invalid property ID');
                res.status(ERROR_STATUS_MAP[ErrorCode.INVALID_FORMAT]).json(err);
                return;
            }

            const serviceResponse = await this.propertyApplicationService.getPropertyById(id);

            if (serviceResponse.success) {
                res.status(200).json(serviceResponse);
            } else {
                const statusCode = serviceResponse.error?.details?.httpStatus || 500;
                res.status(statusCode).json(serviceResponse);
            }
        } catch (error) {
            console.error('Error in getPropertyById:', error);
            const err = ErrorBuilder.build(ErrorCode.INTERNAL_SERVER_ERROR, 'Failed to retrieve property');
            res.status(ERROR_STATUS_MAP[ErrorCode.INTERNAL_SERVER_ERROR]).json(err);
        }
    }
    
    async getAllProperties(req: Request, res: Response): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const serviceResponse = await this.propertyApplicationService.getAllProperties(page, limit);

            if (serviceResponse.success) {
                res.status(200).json(serviceResponse);
            } else {
                const statusCode = serviceResponse.error?.details?.httpStatus || 500;
                res.status(statusCode).json(serviceResponse);
            }
        } catch (error) {
            console.error('Error in getAllProperties:', error);
            const errorResponse = ErrorBuilder.build(
                ErrorCode.INTERNAL_SERVER_ERROR,
                'Failed to retrieve properties'
            );
            res.status(ERROR_STATUS_MAP[ErrorCode.INTERNAL_SERVER_ERROR]).json(errorResponse);
        }
    }

    async updateProperty(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            const userId = req.user?.id;

            if (isNaN(id) || id <= 0) {
                const errorResponse = ErrorBuilder.build(ErrorCode.INVALID_FORMAT, 'Invalid property ID');
                res.status(ERROR_STATUS_MAP[ErrorCode.INVALID_FORMAT]).json(errorResponse);
                return;
            }

            if (!userId) {
                const errorResponse = ErrorBuilder.build(ErrorCode.UNAUTHORIZED, 'User not authenticated');
                res.status(ERROR_STATUS_MAP[ErrorCode.UNAUTHORIZED]).json(errorResponse);
                return;
            }

            // Check if user owns the property (authorization)
            const authResponse = await this.propertyApplicationService.authorizePropertyAccess(id, userId);
            if (!authResponse.success || !authResponse.data) {
                const errorResponse = ErrorBuilder.build(ErrorCode.FORBIDDEN, 'Access denied: you do not own this property');
                res.status(ERROR_STATUS_MAP[ErrorCode.FORBIDDEN]).json(errorResponse);
                return;
            }

            const updateData: Partial<CreatePropertyRequest> = req.body;
            const serviceResponse = await this.propertyApplicationService.updateProperty(id, updateData, userId);

            if (serviceResponse.success) {
                res.status(200).json(serviceResponse);
            } else {
                const statusCode = serviceResponse.error?.details?.httpStatus || 500;
                res.status(statusCode).json(serviceResponse);
            }
        } catch (error) {
            console.error('Error in updateProperty:', error);
            const errorResponse = ErrorBuilder.build(
                ErrorCode.INTERNAL_SERVER_ERROR,
                'Failed to update property'
            );
            res.status(ERROR_STATUS_MAP[ErrorCode.INTERNAL_SERVER_ERROR]).json(errorResponse);
        }
    }

    async deleteProperty(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            const userId = req.user?.id;

            if (isNaN(id) || id <= 0) {
                const errorResponse = ErrorBuilder.build(ErrorCode.INVALID_FORMAT, 'Invalid property ID');
                res.status(ERROR_STATUS_MAP[ErrorCode.INVALID_FORMAT]).json(errorResponse);
                return;
            }

            if (!userId) {
                const errorResponse = ErrorBuilder.build(ErrorCode.UNAUTHORIZED, 'User not authenticated');
                res.status(ERROR_STATUS_MAP[ErrorCode.UNAUTHORIZED]).json(errorResponse);
                return;
            }

            // Check if user owns the property (authorization)
            const authResponse = await this.propertyApplicationService.authorizePropertyAccess(id, userId);
            if (!authResponse.success || !authResponse.data) {
                const errorResponse = ErrorBuilder.build(ErrorCode.FORBIDDEN, 'Access denied: you do not own this property');
                res.status(ERROR_STATUS_MAP[ErrorCode.FORBIDDEN]).json(errorResponse);
                return;
            }

            const serviceResponse = await this.propertyApplicationService.deleteProperty(id, userId);
            
            if (serviceResponse.success) {
                res.status(200).json(serviceResponse);
            } else {
                const statusCode = serviceResponse.error?.details?.httpStatus || 500;
                res.status(statusCode).json(serviceResponse);
            }
        } catch (error) {
            console.error('Error in deleteProperty:', error);
            const errorResponse = ErrorBuilder.build(
                ErrorCode.INTERNAL_SERVER_ERROR,
                'Failed to delete property'
            );
            res.status(ERROR_STATUS_MAP[ErrorCode.INTERNAL_SERVER_ERROR]).json(errorResponse);
        }
    }

    // ============= PROPERTY APPROVAL OPERATIONS =============

    async approveProperty(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            const adminUserId = req.user?.id;
    
            if (isNaN(id) || id <= 0) {
                const errorResponse = ErrorBuilder.build(ErrorCode.INVALID_FORMAT, 'Invalid property ID');
                res.status(ERROR_STATUS_MAP[ErrorCode.INVALID_FORMAT]).json(errorResponse);
                return;
            }
            
            if (!adminUserId) {
                const errorResponse = ErrorBuilder.build(ErrorCode.UNAUTHORIZED, 'User not authenticated');
                res.status(ERROR_STATUS_MAP[ErrorCode.UNAUTHORIZED]).json(errorResponse);
                return;
            }
    
            const serviceResponse = await this.propertyApplicationService.approveProperty(id);

            if (serviceResponse.success) {
                res.status(200).json(serviceResponse);
            } else {
                const statusCode = serviceResponse.error?.details?.httpStatus || 500;
                res.status(statusCode).json(serviceResponse);
            }
        } catch (error) {
            console.error('Error in approveProperty:', error);
            const errorResponse = ErrorBuilder.build(
                ErrorCode.INTERNAL_SERVER_ERROR, 
                'Failed to approve property'
            );
            res.status(ERROR_STATUS_MAP[ErrorCode.INTERNAL_SERVER_ERROR]).json(errorResponse);
        }
    }

    async rejectProperty(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            const adminUserId = req.user?.id;

            if (isNaN(id) || id <= 0) {
                const errorResponse = ErrorBuilder.build(ErrorCode.INVALID_FORMAT, 'Invalid property ID');
                res.status(ERROR_STATUS_MAP[ErrorCode.INVALID_FORMAT]).json(errorResponse);
                return;
            }

            if (!adminUserId) {
                const errorResponse = ErrorBuilder.build(ErrorCode.UNAUTHORIZED, 'User not authenticated');
                res.status(ERROR_STATUS_MAP[ErrorCode.UNAUTHORIZED]).json(errorResponse);
                return;
            }

            const serviceResponse = await this.propertyApplicationService.rejectProperty(id);
            
            if (serviceResponse.success) {
                res.status(200).json(serviceResponse);
            } else {
                const statusCode = serviceResponse.error?.details?.httpStatus || 500;
                res.status(statusCode).json(serviceResponse);
            }
        } catch (error) {
            console.error('Error in rejectProperty:', error);
            const errorResponse = ErrorBuilder.build(
                ErrorCode.INTERNAL_SERVER_ERROR,
                'Failed to reject property'
            );
            res.status(ERROR_STATUS_MAP[ErrorCode.INTERNAL_SERVER_ERROR]).json(errorResponse);
        }
    }

    async getPropertyStatus(req: Request, res: Response): Promise<void> {
        try {
            const serviceResponse = await this.propertyApplicationService.getPropertyStatus();

            if (serviceResponse.success) {
                res.status(200).json(serviceResponse);
            } else {
                const statusCode = serviceResponse.error?.details?.httpStatus || 500;
                res.status(statusCode).json(serviceResponse);
            }
        } catch (error) {
            console.error('Error in getPropertyStatus:', error);
            const errorResponse = ErrorBuilder.build(
                ErrorCode.INTERNAL_SERVER_ERROR,
                'Failed to retrieve property status'
            );
            res.status(ERROR_STATUS_MAP[ErrorCode.INTERNAL_SERVER_ERROR]).json(errorResponse);
        }
    }

    async getApprovedProperties(req: Request, res: Response): Promise<void> {
        try {
            const serviceResponse = await this.propertyApplicationService.getApprovedProperties();

            if (serviceResponse.success) {
                res.status(200).json(serviceResponse);
            } else {
                const statusCode = serviceResponse.error?.details?.httpStatus || 500;
                res.status(statusCode).json(serviceResponse);
            }
        } catch (error) {
            console.error('Error in getApprovedProperties:', error);
            const errorResponse = ErrorBuilder.build(
                ErrorCode.INTERNAL_SERVER_ERROR,
                'Failed to retrieve approved properties'
            );
            res.status(ERROR_STATUS_MAP[ErrorCode.INTERNAL_SERVER_ERROR]).json(errorResponse);
        }
    }

    async getPendingProperties(req: Request, res: Response): Promise<void> {
        try {
            const serviceResponse = await this.propertyApplicationService.getPendingProperties();

            if (serviceResponse.success) {
                res.status(200).json(serviceResponse);
            } else {
                const statusCode = serviceResponse.error?.details?.httpStatus || 500;
                res.status(statusCode).json(serviceResponse);
            }
        } catch (error) {
            console.error('Error in getPendingProperties:', error);
            const errorResponse = ErrorBuilder.build(
                ErrorCode.INTERNAL_SERVER_ERROR,
                'Failed to retrieve pending properties'
            );
            res.status(ERROR_STATUS_MAP[ErrorCode.INTERNAL_SERVER_ERROR]).json(errorResponse);
        }
    }

    // ============= PHOTO OPERATIONS =============

    async uploadPhotos(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const propertyId = parseInt(req.params.id);
            const userId = req.user?.id;
            const files = req.files as Express.Multer.File[];
            const coverImageIndex = parseInt(req.params.coverImageIndex);

            if (isNaN(propertyId) || propertyId <= 0) {
                const errorResponse = ErrorBuilder.build(ErrorCode.INVALID_FORMAT, 'Invalid property ID');
                res.status(ERROR_STATUS_MAP[ErrorCode.INVALID_FORMAT]).json(errorResponse);
                return;
            }

            if (isNaN(coverImageIndex) || coverImageIndex < 0) {
                const errorResponse = ErrorBuilder.build(ErrorCode.INVALID_FORMAT, 'Invalid coverImageIndex');
                res.status(ERROR_STATUS_MAP[ErrorCode.INVALID_FORMAT]).json(errorResponse);
                return;
            }

            if (!userId) {
                const errorResponse = ErrorBuilder.build(ErrorCode.UNAUTHORIZED, 'User not authenticated');
                res.status(ERROR_STATUS_MAP[ErrorCode.UNAUTHORIZED]).json(errorResponse);
                return;
            }

            if (!files || files.length === 0) {
                const errorResponse = ErrorBuilder.build(ErrorCode.MISSING_REQUIRED_FIELD, 'No files uploaded');
                res.status(ERROR_STATUS_MAP[ErrorCode.MISSING_REQUIRED_FIELD]).json(errorResponse);
                return;
            }

            // Check if user owns the property (authorization)
            const authResponse = await this.propertyApplicationService.authorizePropertyAccess(propertyId, userId);
            if (!authResponse.success || !authResponse.data) {
                const errorResponse = ErrorBuilder.build(ErrorCode.FORBIDDEN, 'Access denied: you do not own this property');
                res.status(ERROR_STATUS_MAP[ErrorCode.FORBIDDEN]).json(errorResponse);
                return;
            }

            const serviceResponse = await this.propertyApplicationService.uploadPhotos(
                propertyId, 
                files, 
                coverImageIndex
            );

            if (serviceResponse.success) {
                res.status(200).json(serviceResponse);
            } else {
                const statusCode = serviceResponse.error?.details?.httpStatus || 500;
                res.status(statusCode).json(serviceResponse);
            }
        } catch (error) {
            console.error('Error in uploadPhotos:', error);
            const errorResponse = ErrorBuilder.build(
                ErrorCode.INTERNAL_SERVER_ERROR,
                'Failed to upload photos'
            );
            res.status(ERROR_STATUS_MAP[ErrorCode.INTERNAL_SERVER_ERROR]).json(errorResponse);
        }
    }

    // ============= LOOKUP OPERATIONS =============

    async getProjects(req: Request, res: Response): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const serviceResponse = await this.propertyApplicationService.getProjects(page, limit);

            if (serviceResponse.success) {
                res.status(200).json(serviceResponse);
            } else {
                const statusCode = serviceResponse.error?.details?.httpStatus || 500;
                res.status(statusCode).json(serviceResponse);
            }
        } catch (error) {
            console.error('Error in getProjects:', error);
            const err = ErrorBuilder.build(ErrorCode.INTERNAL_SERVER_ERROR, 'Failed to retrieve projects');
            res.status(ERROR_STATUS_MAP[ErrorCode.INTERNAL_SERVER_ERROR]).json(err);
        }
    }

    async getRequiredInterfaces(req: Request, res: Response): Promise<void> {
        try {
            const serviceResponse = await this.propertyApplicationService.getRequiredInterfaces();

            if (serviceResponse.success) {
                res.status(200).json(serviceResponse);
            } else {
                const statusCode = serviceResponse.error?.details?.httpStatus || 500;
                res.status(statusCode).json(serviceResponse);
            }
        } catch (error) {
            console.error('Error in getRequiredInterfaces:', error);
            const errorResponse = ErrorBuilder.build(
                ErrorCode.INTERNAL_SERVER_ERROR,
                'Failed to retrieve required interfaces'
            );
            res.status(ERROR_STATUS_MAP[ErrorCode.INTERNAL_SERVER_ERROR]).json(errorResponse);
        }
    }

    // ============= HELPER METHODS =============

    private validateAdminRole = (userRole: string): boolean => {
        return userRole === 'admin' || userRole === 'super_admin';
    };

    private parseIntSafely = (value: string | undefined, defaultValue: number = 0): number => {
        if (!value) return defaultValue;
        const parsed = parseInt(value);
        return isNaN(parsed) ? defaultValue : parsed;
    };
}