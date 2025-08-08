import { Request, Response, NextFunction } from 'express';
import { TagService } from '../../application/services/TagService';

export class TagController {
  constructor(private tagService: TagService) {}

  async createTag(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tagData: CreateTagRequest = req.body;
      const tag = await this.tagService.createTag(tagData);

      const response: ApiResponse<TagResponse> = {
        success: true,
        message: 'Tag created successfully',
        data: tag,
        timestamp: new Date().toISOString()
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getTags(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const queryParams: TagQueryParams = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: req.query.search as string,
        sort_by: req.query.sort_by as 'name' | 'created_at' | 'posts_count',
        sort_order: req.query.sort_order as 'asc' | 'desc',
        include_posts_count: req.query.include_posts_count === 'true',
        include_recent_posts: req.query.include_recent_posts === 'true'
      };

      const tags = await this.tagService.getTags(queryParams);

    } catch(error) {
        next(error);
    }
} 
}
