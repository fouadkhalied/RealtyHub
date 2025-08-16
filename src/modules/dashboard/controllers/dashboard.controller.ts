
// src/modules/dashboard/controllers/dashboard.controller.ts
import { Request, Response } from 'express';
import { DashboardApplicationService } from '../application/dashboard-application.service';
import { ErrorBuilder } from '../../../libs/common/errors/errorBuilder';
import { ErrorCode } from '../../../libs/common/errors/enums/basic.error.enum';

export class DashboardController {
  constructor(
    private readonly dashboardApplicationService: DashboardApplicationService
  ) {}

  async getDashBoardOverview(req: Request, res: Response): Promise<void> {
    try {
  
      const serviceResponse = await this.dashboardApplicationService.getDashboardOverview();
  
      const statusCode = serviceResponse.success ? 201 : serviceResponse.error?.details?.httpStatus || 500;
  
      res.status(statusCode).json(serviceResponse);
    } catch (error: any) {
      res
        .status(500)
        .json(
          ErrorBuilder.build(
            ErrorCode.INTERNAL_SERVER_ERROR,
            error.message || "Unexpected error occurred"
          )
        );
    }
  }
}