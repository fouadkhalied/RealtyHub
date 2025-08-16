
// src/modules/dashboard/infrastructure/dashboard-repository.interface.ts
import {DashboardOverview } from '../application/types';

export interface IDashboardRepository {
    status() : Promise<DashboardOverview>
}