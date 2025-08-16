export interface DashboardOverview {
      totalPosts: number;
      totalProperties: number;
      totalAprovedProperties: number;
      totalUnAprovedProperties: number;
      totalUsers: number;
  }
  
  export interface DashboardStats {
    period: string;
    posts: number;
    views: number;
    engagement: number;
    growth: number;
  }
  
  export interface RecentActivity {
    id: string;
    type: 'post' | 'comment' | 'like' | 'view';
    description: string;
    timestamp: Date;
    metadata?: any;
  }
  
  export interface DashboardAnalytics {
    dailyViews: Array<{ date: string; views: number }>;
    topPosts: Array<{ id: string; title: string; views: number }>;
    engagementRate: number;
    growthRate: number;
  }