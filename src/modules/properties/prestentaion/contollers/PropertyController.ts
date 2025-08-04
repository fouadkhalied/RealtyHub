import { Request, Response } from 'express';
import { PropertyApplicationService } from '../../application/services/PropertyApplicationService';
import { CreatePropertyRequest } from '../../application/dto/requests/CreatePropertyRequest.dto';
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
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
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
            res.status(500).json({
                success: false,
                message: 'Failed to create property',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async getPropertyById(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            
            if (isNaN(id) || id <= 0) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid property ID'
                });
                return;
            }

            const property = await this.propertyApplicationService.getPropertyById(id);

            if (!property) {
                res.status(404).json({
                    success: false,
                    message: 'Property not found'
                });
                return;
            }

            res.status(200).json({
                success: true,
                data: property
            });
        } catch (error) {
            console.error('Error in getPropertyById:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve property',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
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
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve properties',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async updateProperty(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            const userId = req.user?.id;

            if (isNaN(id) || id <= 0) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid property ID'
                });
                return;
            }

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
                return;
            }

            // Check if user owns the property (authorization)
            if (!await this.propertyApplicationService.authorizePropertyAccess(id, userId)) {
                res.status(400).json({
                    success: false,
                    message: 'Access denied : you do not own this property'
                });
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
            res.status(500).json({
                success: false,
                message: 'Failed to update property',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async deleteProperty(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            const userId = req.user?.id;

            if (isNaN(id) || id <= 0) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid property ID'
                });
                return;
            }

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
                return;
            }

            await this.propertyApplicationService.rejectProperty(id);

            res.status(200).json({
                success: true,
                message: 'Property deleted successfully'
            });
        } catch (error) {
            console.error('Error in deleteProperty:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete property',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // ============= PROPERTY APPROVAL OPERATIONS =============

    async approveProperty(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            const adminUserId = req.user?.id;

            if (isNaN(id) || id <= 0) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid property ID'
                });
                return;
            }

            if (!adminUserId) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
                return;
            }

            const result = await this.propertyApplicationService.approveProperty(id);

            res.status(200).json({
                success: result.success,
                message: result.message
            });
        } catch (error) {
            console.error('Error in approveProperty:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to approve property',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async rejectProperty(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            const adminUserId = req.user?.id;

            if (isNaN(id) || id <= 0) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid property ID'
                });
                return;
            }

            if (!adminUserId) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
                return;
            }

            const result = await this.propertyApplicationService.rejectProperty(id);

            res.status(200).json({
                success: result.success,
                message: result.message
            });
        } catch (error) {
            console.error('Error in rejectProperty:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to reject property',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
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
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve property status',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
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
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve approved properties',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
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
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve pending properties',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
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
                res.status(400).json({
                    success: false,
                    message: 'Invalid property ID'
                });
                return;
            }

            if (isNaN(coverImageIndex) || coverImageIndex < 0) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid coverImageIndex ID'
                });
                return;
            }

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
                return;
            }

            if (!files || files.length === 0) {
                res.status(400).json({
                    success: false,
                    message: 'No files uploaded'
                });
                return;
            }

            if (!await this.propertyApplicationService.authorizePropertyAccess(propertyId, userId)) {
                res.status(400).json({
                    success: false,
                    message: 'Access denied : you do not own this property'
                });
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
            res.status(500).json({
                success: false,
                message: 'Failed to upload photos',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
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
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve projects',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
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
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve required interfaces',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
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