import { Request, Response, NextFunction } from 'express';
import { PostMainService } from '../../application/services/blogMainService';
import { ApiResponseInterface } from "../../../../libs/common/apiResponse/interfaces/apiResponse.interface";
import { PostResponse } from '../../application/dto/responses/PostResponse.dto';
import { CreatePostRequest } from '../../application/dto/requests/CreatePostRequest.dto';
import { PaginatedResponse, PaginationParams } from '../../../../libs/common/pagination.vo';
import { PostListResponse } from '../../application/dto/responses/PostListResponse.dto';
import { AuthenticatedRequest } from '../../../auth/application/authMiddleware';
import { UserRole } from '../../../user/domain/valueObjects/user-role.vo';
import { ResponseBuilder } from '../../../../libs/common/apiResponse/apiResponseBuilder';
import { ErrorCode } from '../../../../libs/common/errors/enums/basic.error.enum';
import { ErrorBuilder } from '../../../../libs/common/errors/errorBuilder';
import { SearchRequest } from '../../application/dto/requests/SearchPostRequest.dto';
import { UpdatePartType } from '../../application/interfaces/blog.interface';


export class PostController {
  constructor(private postService: PostMainService) {}

  async createPost(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const postData: CreatePostRequest = req.body;
      const user = req.user;
  
      // Check authentication & role
      if (!user || user.role !== UserRole.ADMIN) {
        res
          .status(401)
          .json(
            ErrorBuilder.build(
              ErrorCode.UNAUTHORIZED,
              "Admin access required",
              { currentRole: user?.role }
            )
          );
        return;
      }
  
      const serviceResponse = await this.postService.createPost(postData, user.id);
  
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
  
  
  async getPosts(req: Request, res: Response): Promise<void> {
    try {
      const paginatedParams: PaginationParams = {
        page: parseInt(req.query.page as string, 10) || 1,
        limit: parseInt(req.query.limit as string, 10) || 10,
      };
  
      const searchParams: SearchRequest = {
        query: (req.query.query as string) || '',
        filters: {
          categories: req.query.categories
            ? (req.query.categories as string).split(',').map(Number)
            : undefined,
          tags: req.query.tags
            ? (req.query.tags as string).split(',').map(Number)
            : undefined,
          author_id: req.query.author_id ? Number(req.query.author_id) : undefined,
          title: req.query.title as string,
        },
      };
  
      const serviceResponse = await this.postService.getAllPosts(paginatedParams, searchParams);
  
      const statusCode = serviceResponse.success
        ? 200
        : serviceResponse.error?.details?.httpStatus || 500;
  
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
  

  async getPostById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
  
      if (isNaN(id)) {
        res
          .status(400)
          .json(
            ErrorBuilder.build(
              ErrorCode.VALIDATION_ERROR,
              "Invalid post ID format",
              { providedId: req.params.id }
            )
          );
        return;
      }
  
      const serviceResponse = await this.postService.getPostById(id);
  
      const statusCode = serviceResponse.success
        ? 200
        : serviceResponse.error?.details?.httpStatus || 500;
  
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
  

  async getPostsBySlug(req: Request, res: Response): Promise<void> {
    try {
      const slug = req.params.slug;
      if (!slug) {
        res
          .status(400)
          .json(
            ErrorBuilder.build(
              ErrorCode.VALIDATION_ERROR,
              "Invalid post slug format",
              { providedSlug: req.params.slug }
            )
          );
        return;
      }

      const serviceResponse = await this.postService.getPostsBySlug(slug);
  
      const statusCode = serviceResponse.success
        ? 200
        : serviceResponse.error?.details?.httpStatus || 500;
  
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

  // async updatePost(req: Request, res: Response, next: NextFunction): Promise<void> {
  //   try {
  //     const id = parseInt(req.params.id);
  //     const updateData: UpdatePostRequest = req.body;
      
  //     const post = await this.postService.updatePost(id, updateData);

  //     const response: ApiResponseInterface<PostResponse> = {
  //       success: true,
  //       message: 'Post updated successfully',
  //       data: post
  //     };

  //     res.json(response);
  //   } catch (error) {
  //     next(error);
  //   }
  // }

  // async deletePost(req: Request, res: Response, next: NextFunction): Promise<void> {
  //   try {
  //     const id = parseInt(req.params.id);
  //     await this.postService.deletePost(id);

  //     const response: ApiResponseInterface<null> = {
  //       success: true,
  //       message: 'Post deleted successfully'
  //     };

  //     res.json(response);
  //   } catch (error) {
  //     next(error);
  //   }
  // }

  // async publishPost(req: Request, res: Response, next: NextFunction): Promise<void> {
  //   try {
  //     const id = parseInt(req.params.id);
  //     const publishedAt = req.body.published_at ? new Date(req.body.published_at) : new Date();
      
  //     const post = await this.postService.publishPost(id, publishedAt);

  //     const response: ApiResponseInterface<PostResponse> = {
  //       success: true,
  //       message: 'Post published successfully',
  //       data: post
  //     };

  //     res.json(response);
  //   } catch (error) {
  //     next(error);
  //   }
  // }

  // async unpublishPost(req: Request, res: Response, next: NextFunction): Promise<void> {
  //   try {
  //     const id = parseInt(req.params.id);
  //     const post = await this.postService.unpublishPost(id);

  //     const response: ApiResponseInterface<PostResponse> = {
  //       success: true,
  //       message: 'Post unpublished successfully',
  //       data: post
  //     };

  //     res.json(response);
  //   } catch (error) {
  //     next(error);
  //   }
  // }

  async updatePart(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const blogId = parseInt(req.params.id, 10);
      const part = req.params.part as UpdatePartType;
      const adminId = req.user?.id;
      const language = req.params.language

      if (isNaN(blogId) || !part || !['en', 'ar'].includes(part)) {
        res
          .status(400)
          .json(
            ErrorBuilder.build(
              ErrorCode.VALIDATION_ERROR,
              "Invalid language"
            )
          );
        return;
      }

      if (!adminId) {
        res
          .status(401)
          .json(
            ErrorBuilder.build(
              ErrorCode.UNAUTHORIZED,
              "Admin access required"
            )
          );
        return;
      }

      if (isNaN(blogId) || !part || !['tag', 'content_section', 'category', 'table_of_contents', 'related_post'].includes(part)) {
        res
          .status(400)
          .json(
            ErrorBuilder.build(
              ErrorCode.VALIDATION_ERROR,
              "Invalid id or part"
            )
          );
        return;
      }

      const verification = await this.postService.validatePostIdToAdminId(blogId,adminId)

      if (!verification.success) {
        const statusCode = verification.success ? 200 : verification.error?.details?.httpStatus || 500;
         res.status(statusCode).json(verification);
      }

      const serviceResponse = await this.postService.updatePart(blogId, part, req.body as any, language);
      const statusCode = serviceResponse.success ? 200 : serviceResponse.error?.details?.httpStatus || 500;
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

