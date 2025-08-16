import { ResponseBuilder } from "../../../libs/common/apiResponse/apiResponseBuilder";
import { ApiResponseInterface } from "../../../libs/common/apiResponse/interfaces/apiResponse.interface";
import { IDashboardRepository } from "../infrastructure/dashboard-repository.interface";
import { DashboardOverview } from "./types";

export class DashboardApplicationService {
  constructor(
    private readonly dashboardRepository: IDashboardRepository
  ) {}

  async getDashboardOverview(): Promise<ApiResponseInterface<DashboardOverview>> {
    try {
      const dashboardData = await this.dashboardRepository.status();
      
      return ResponseBuilder.success(dashboardData, "Dashboard overview retrieved successfully")
    } catch (error: any) {
      return {
        success: false,
        message: "Failed to get dashboard overview",
        error: {
          code: "DASHBOARD_ERROR",
          message: error.message || "Unknown error occurred",
          details: {
            httpStatus: 500
          }
        }
      };
    }
  }
}