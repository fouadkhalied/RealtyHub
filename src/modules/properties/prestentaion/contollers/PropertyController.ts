import { Request, Response } from 'express';
import { PropertyApplicationService } from '../../application/services/PropertyApplicationService';
import { CreatePropertyRequest } from '../../application/dto/requests/CreatePropertyRequest.dto';
import { ErrorBuilder } from '../../../../libs/common/errors/errorBuilder';
import { ErrorCode } from '../../../../libs/common/errors/enums/basic.error.enum';
import { ERROR_STATUS_MAP } from '../../../../libs/common/errors/mapper/mapperErrorEnum';
//import { UpdatePropertyRequest } from '../../application/dto/requests/UpdatePropertyRequest.dto';

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
            if (!userId) {
                const errorResponse = ErrorBuilder.build(ErrorCode.UNAUTHORIZED, 'User not authenticated');
                res.status(ERROR_STATUS_MAP[ErrorCode.UNAUTHORIZED]).json(errorResponse);
                return;
            }

            const propertyData: CreatePropertyRequest = req.body;
            
            const result = await this.propertyApplicationService.createProperty(propertyData, userId);

            res.status(201).json({
                success: true,
                message: 'Property created successfully',
                data: result
            });
        } catch (error) {
            console.error('Error in createProperty:', error);
            const errorResponse = ErrorBuilder.build(
                ErrorCode.INTERNAL_SERVER_ERROR,
                'Failed to create property'
            );
            res.status(ERROR_STATUS_MAP[ErrorCode.INTERNAL_SERVER_ERROR]).json(errorResponse);
        }
    }

    async getPropertyById(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            
            if (isNaN(id) || id <= 0) {
                const errorResponse = ErrorBuilder.build(ErrorCode.INVALID_FORMAT, 'Invalid property ID');
                res.status(ERROR_STATUS_MAP[ErrorCode.INVALID_FORMAT]).json(errorResponse);
                return;
            }

            const property = await this.propertyApplicationService.getPropertyById(id);

            if (!property) {
                const errorResponse = ErrorBuilder.build(ErrorCode.PROPERTY_NOT_FOUND, 'Property not found');
                res.status(ERROR_STATUS_MAP[ErrorCode.PROPERTY_NOT_FOUND]).json(errorResponse);
                return;
            }

            res.status(200).json({
                success: true,
                data: property
            });
        } catch (error) {
            console.error('Error in getPropertyById:', error);
            const errorResponse = ErrorBuilder.build(
                ErrorCode.INTERNAL_SERVER_ERROR,
                'Failed to retrieve property'
            );
            res.status(ERROR_STATUS_MAP[ErrorCode.INTERNAL_SERVER_ERROR]).json(errorResponse);
        }
    }

    async getAllProperties(req: Request, res: Response): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const result = await this.propertyApplicationService.getAllProperties(page, limit);

            res.status(200).json({
                success: true,
                data: result.data,
                pagination: result.pagination
            });
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
            if (!await this.propertyApplicationService.authorizePropertyAccess(id, userId)) {
                const errorResponse = ErrorBuilder.build(ErrorCode.FORBIDDEN, 'Access denied: you do not own this property');
                res.status(ERROR_STATUS_MAP[ErrorCode.FORBIDDEN]).json(errorResponse);
                return;
            }

            const updateData: Partial<CreatePropertyRequest> = req.body;
            
            await this.propertyApplicationService.updateProperty(id, updateData);

            res.status(200).json({
                success: true,
                message: 'Property updated successfully'
            });
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

            const serviceResponse = await this.propertyApplicationService.rejectProperty(id);
            const statusCode = serviceResponse.success ? 200 : serviceResponse.error?.details?.httpStatus || 500;
            res.status(statusCode).json(serviceResponse);
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

            const statusCode = serviceResponse.success
            ? 200 
            : serviceResponse.error?.details?.httpStatus || 500
            
            res.status(statusCode).json(serviceResponse);
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
            const statusCode = serviceResponse.success ? 200 : serviceResponse.error?.details?.httpStatus || 500;
            res.status(statusCode).json(serviceResponse);
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
            const status = await this.propertyApplicationService.getPropertyStatus();

            res.status(200).json({
                success: true,
                data: status
            });
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
            const approvedIds = await this.propertyApplicationService.getApprovedProperties();

            res.status(200).json({
                success: true,
                data: approvedIds
            });
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
            const pendingIds = await this.propertyApplicationService.getPendingProperties();

            res.status(200).json({
                success: true,
                data: pendingIds
            });
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

            if (!await this.propertyApplicationService.authorizePropertyAccess(propertyId, userId)) {
                const errorResponse = ErrorBuilder.build(ErrorCode.FORBIDDEN, 'Access denied: you do not own this property');
                res.status(ERROR_STATUS_MAP[ErrorCode.FORBIDDEN]).json(errorResponse);
                return;
            }

            const result = await this.propertyApplicationService.uploadPhotos(
                propertyId, 
                files, 
                coverImageIndex
            );

            res.status(200).json({
                success: result.success,
                message: result.message
            });
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

    // async getPropertyTypes(req: Request, res: Response): Promise<void> {
    //     try {
    //         const propertyTypes = await this.propertyApplicationService.();

    //         res.status(200).json({
    //             success: true,
    //             data: propertyTypes
    //         });
    //     } catch (error) {
    //         console.error('Error in getPropertyTypes:', error);
    //         res.status(500).json({
    //             success: false,
    //             message: 'Failed to retrieve property types',
    //             error: error instanceof Error ? error.message : 'Unknown error'
    //         });
    //     }
    // }

    async getProjects(req: Request, res: Response): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const result = await this.propertyApplicationService.getProjects(page, limit);

            res.status(200).json({
                success: true,
                data: result.data,
                pagination: result.pagination
            });
        } catch (error) {
            console.error('Error in getProjects:', error);
            const errorResponse = ErrorBuilder.build(
                ErrorCode.INTERNAL_SERVER_ERROR,
                'Failed to retrieve projects'
            );
            res.status(ERROR_STATUS_MAP[ErrorCode.INTERNAL_SERVER_ERROR]).json(errorResponse);
        }
    }

    async getRequiredInterfaces(req: Request, res: Response): Promise<void> {
        try {
            const interfaces = await this.propertyApplicationService.getRequiredInterfaces();

            res.status(200).json({
                success: true,
                data: interfaces
            });
        } catch (error) {
            console.error('Error in getRequiredInterfaces:', error);
            const errorResponse = ErrorBuilder.build(
                ErrorCode.INTERNAL_SERVER_ERROR,
                'Failed to retrieve required interfaces'
            );
            res.status(ERROR_STATUS_MAP[ErrorCode.INTERNAL_SERVER_ERROR]).json(errorResponse);
        }
    }

    async validatePropertyOwnership(propertyId: number, userId: number): Promise<boolean> {
        try {
            return await this.propertyApplicationService.authorizePropertyAccess(propertyId, userId);
        } catch (error) {
            console.error('Error validating property ownership:', error);
            return false;
        }
    };

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