
// src/modules/dashboard/composition/dashboard.composition.ts
import { DashboardController } from '../controllers/dashboard.controller';
import { DashboardApplicationService } from '../application/dashboard-application.service';
import { DashboardRepository } from '../infrastructure/dashboard.repository';
import { IDashboardRepository } from '../infrastructure/dashboard-repository.interface';

export function createDashboardController() : DashboardController {
    const dashboardRepository: IDashboardRepository = new DashboardRepository();
    const dashboardApplicationService = new DashboardApplicationService(dashboardRepository);
    return new DashboardController(dashboardApplicationService);
}
