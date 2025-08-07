import { Request, Response, NextFunction } from 'express';
import { PostMainService } from '../../application/services/blogMainService';
import { ApiResponseInterface } from "../../application/interfaces/apiResponse.interface";
import { PostResponse } from '../../application/dto/responses/PostResponse.dto';
import { CreatePostRequest } from '../../application/dto/requests/CreatePostRequest.dto';
import { PostQueryParams } from '../../application/quires/PostQueryParams';
import { PaginatedResponse } from '../../../../libs/common/pagination.vo';
import { PostListResponse } from '../../application/dto/responses/PostListResponse.dto';
import { AuthenticatedRequest } from '../../../auth/application/authMiddleware';
import { UserRole } from '../../../user/domain/valueObjects/user-role.vo';


export class PostController {
  constructor(private postService: PostMainService) {}

  async createPost(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const postData: CreatePostRequest = req.body;
      const user = req.user;
  
      // Ensure user is present and has admin role
      if (!user || user.role !== UserRole.ADMIN) {
        throw new Error("error: unauthorized - admin access required");
      }
  
      const post = await this.postService.createPost(postData, user.id);
  
      const response: ApiResponseInterface<{ id: number; message: string }> = {
        success: true,
        message: 'Post created successfully',
        data: post
      };
  
      res.status(201).json(response);
    } catch (error:any) {
      res.status(404).send(error.message);
    }
  }
  

  // async getPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
  //   try {
  //     const queryParams: PostQueryParams = {
  //       page: parseInt(req.query.page as string) || 1,
  //       limit: parseInt(req.query.limit as string) || 10,
  //       status: req.query.status as 'draft' | 'published' | 'archived',
  //       author_id: req.query.author_id ? parseInt(req.query.author_id as string) : undefined,
  //       category_id: req.query.category_id ? parseInt(req.query.category_id as string) : undefined,
  //       tag_id: req.query.tag_id ? parseInt(req.query.tag_id as string) : undefined,
  //       search: req.query.search as string,
  //       sort_by: req.query.sort_by as 'created_at' | 'updated_at' | 'published_at' | 'views' | 'title',
  //       sort_order: req.query.sort_order as 'asc' | 'desc',
  //       date_from: req.query.date_from as string,
  //       date_to: req.query.date_to as string
  //     };

  //     const posts = await this.postService.getPosts(queryParams);

  //     const response: ApiResponseInterface<PaginatedResponse<PostListResponse>> = {
  //       success: true,
  //       message: 'Posts retrieved successfully',
  //       data: posts
  //     };

  //     res.json(response);
  //   } catch (error) {
  //     next(error);
  //   }
  // }

  // async getPostById(req: Request, res: Response, next: NextFunction): Promise<void> {
  //   try {
  //     const id = parseInt(req.params.id);
  //     const post = await this.postService.getPostById(id);

  //     if (!post) {
  //       throw new Error(`${id} Post is not found`);
  //     }

  //     const response: ApiResponseInterface<PostResponse> = {
  //       success: true,
  //       message: 'Post retrieved successfully',
  //       data: post
  //     };

  //     res.json(response);
  //   } catch (error) {
  //     next(error);
  //   }
  // }

  // async getPostBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
  //   try {
  //     const slug = req.params.slug;
  //     const post = await this.postService.getPostBySlug(slug);

  //     if (!post) {
  //       throw new Error(`${slug} Post is not found`);
  //     }

  //     // Increment view count
  //     await this.postService.incrementPostViews(post.id);

  //     const response: ApiResponseInterface<PostResponse> = {
  //       success: true,
  //       message: 'Post retrieved successfully',
  //       data: post
  //     };

  //     res.json(response);
  //   } catch (error) {
  //     next(error);
  //   }
  // }

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
}

