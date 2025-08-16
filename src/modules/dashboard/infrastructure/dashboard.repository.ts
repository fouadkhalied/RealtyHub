
// src/modules/dashboard/infrastructure/dashboard.repository.ts
import { IDashboardRepository } from './dashboard-repository.interface';
import { DashboardOverview } from '../application/types';
import { sql } from '@vercel/postgres';
import { Dashboard_READ } from './quires/quires.read';

export class DashboardRepository implements IDashboardRepository {
  constructor() {}

  async status(): Promise<DashboardOverview> {
    
  const totalPostsResult = (await sql.query(Dashboard_READ.totalPostsQuery)).rows;
  const totalPosts = totalPostsResult[0]?.count || 0;


  const approvedPropertiesResult = (await sql.query(Dashboard_READ.approvedPropertiesQuery)).rows
  const totalApprovedProperties = approvedPropertiesResult[0]?.count || 0;

  const unapprovedPropertiesResult = (await sql.query(Dashboard_READ.rejectedPropertiesQuery)).rows
  const totalUnapprovedProperties = unapprovedPropertiesResult[0]?.count || 0;

  const totalUsersResult = (await sql.query(Dashboard_READ.totalUsersQuery)).rows
  const totalUsers = totalUsersResult[0]?.count || 0;

  return {
    totalPosts: parseInt(totalPosts),
    totalProperties: parseInt(totalApprovedProperties) + parseInt(totalUnapprovedProperties),
    totalAprovedProperties: parseInt(totalApprovedProperties),
    totalUnAprovedProperties: parseInt(totalUnapprovedProperties),
    totalUsers: parseInt(totalUsers)
  };
  }
}