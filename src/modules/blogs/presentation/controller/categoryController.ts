import { Request, Response, NextFunction } from 'express';
import { CategoryService } from '../../application/services/CategoryService';
import { 
  CreateCategoryRequest, 
  UpdateCategoryRequest, 
  CategoryQueryParams 
} from '../../types';
import { ApiResponse, PaginatedResponse, CategoryResponse } from '../../types/responses';
import { NotFoundError } from '../../types/errors';

export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  async createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categoryData: CreateCategoryRequest = req.body;
      const category = await this.categoryService.createCategory(categoryData);

      const response: ApiResponse<CategoryResponse> = {
        success: true,
        message: 'Category created successfully',
        data: category,
        timestamp: new Date().toISOString()
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const queryParams: CategoryQueryParams = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: req.query.search as string,
        sort_by: req.query.sort_by as 'name' | 'created_at' | 'posts_count',
        sort_order: req.query.sort_order as 'asc' | 'desc',
        include_posts_count: req.query.include_posts_count === 'true',
        include_recent_posts: req.query.include_recent_posts === 'true'
      };

      const categories = await this.categoryService.getCategories(queryParams);

      const response: ApiResponse<PaginatedResponse<CategoryResponse>> = {
        success: true,
        message: 'Categories retrieved successfully',
        data: categories,
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async getCategoryById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const category = await this.categoryService.getCategoryById(id);

      if (!category) {
        throw new NotFoundError('Category', id);
      }

      const response: ApiResponse<CategoryResponse> = {
        success: true,
        message: 'Category retrieved successfully',
        data: category,
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async updateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const updateData: UpdateCategoryRequest = req.body;
      
      const category = await this.categoryService.updateCategory(id, updateData);

      const response: ApiResponse<CategoryResponse> = {
        success: true,
        message: 'Category updated successfully',
        data: category,
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      await this.categoryService.deleteCategory(id);

      const response: ApiResponse<null> = {
        success: true,
        message: 'Category deleted successfully',
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}
