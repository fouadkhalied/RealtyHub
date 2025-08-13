import { CreatePostRequest } from "../dto/requests/CreatePostRequest.dto";
import { IBlogRepository } from "../../domain/repositories/IBlogRepository";
import { validatePostCreation } from "../validators/blog.validate";
import {
  PaginationParams
} from "../../../../libs/common/pagination.vo";
import { SearchRequest } from "../dto/requests/SearchPostRequest.dto";
import { PostResponse } from "../dto/responses/PostResponse.dto";
import { ApiResponseInterface } from "../../../../libs/common/apiResponse/interfaces/apiResponse.interface";
import { ErrorCode } from "../../../../libs/common/errors/enums/basic.error.enum";
import { ErrorBuilder } from "../../../../libs/common/errors/errorBuilder";
import { ResponseBuilder } from "../../../../libs/common/apiResponse/apiResponseBuilder";
import { UpdatePartType} from "../interfaces/blog.interface";
import { UpdateStrategyFactory } from "./updateStrategies/UpdateStrategyFactory";

export class PostMainService {
  constructor(private readonly blogRepo: IBlogRepository) {}

  async createPost(
    props: CreatePostRequest,
    adminId: number
  ): Promise<ApiResponseInterface<{ id: number }>> {
    try {
      const { error } = validatePostCreation.validate(props);
      if (error) {
        return ErrorBuilder.build(
          ErrorCode.VALIDATION_ERROR,
          error.details[0].message
        );
      }

      const { id } = await this.blogRepo.create(props, adminId);
      return ResponseBuilder.success({ id }, "Post created successfully");
    } catch (error: any) {
      return ErrorBuilder.build(
        ErrorCode.INTERNAL_SERVER_ERROR,
        error.message || "Unexpected error"
      );
    }
  }

  async getPostById(
    id: number
  ): Promise<ApiResponseInterface<PostResponse>> {
    try {
      const post = await this.blogRepo.findById(id);

      if (!post) {
        return ErrorBuilder.build(
          ErrorCode.POST_NOT_FOUND,
          "No post exists with the specified ID",
          { postId: id }
        );
      }

      return ResponseBuilder.success(post, "Post retrieved successfully");
    } catch (error: any) {
      return ErrorBuilder.build(
        ErrorCode.INTERNAL_SERVER_ERROR,
        error.message || "Unexpected error"
      );
    }
  }

  async getPostsBySlug(
    slug: string
  ): Promise<ApiResponseInterface<any>> {
    try {
      const post = await this.blogRepo.findBySlug(slug);

      if (!post) {
        return ErrorBuilder.build(
          ErrorCode.POST_NOT_FOUND,
          "No post exists with the specified slug",
          { slug: slug }
        );
      }

      return ResponseBuilder.success(post, "Posts retrieved successfully");
    } catch (error: any) {
      return ErrorBuilder.build(
        ErrorCode.INTERNAL_SERVER_ERROR,
        error.message || "Unexpected error"
      );
    }
  }

  async getAllPosts(
    params: PaginationParams,
    filters: SearchRequest
  ): Promise<ApiResponseInterface<any>> {  // <-- allow both success + error shapes
    try {
      const posts = await this.blogRepo.findAll(params, filters);
      return ResponseBuilder.paginatedSuccess(
        posts.data,
        posts.pagination,
        "Posts retrieved successfully"
      );
    } catch (error: any) {
      return ErrorBuilder.build(
        ErrorCode.INTERNAL_SERVER_ERROR,
        error.message || "Failed to fetch posts"
      );
    }
  }

  async validatePostIdToAdminId(
    blogId: number, 
    adminId: number
  ): Promise<ApiResponseInterface<boolean>> {  
    try {
      const {success} = await this.blogRepo.findBlogIDandAdminID(blogId,adminId);
      if (!success) {
        return  ErrorBuilder.build(
          ErrorCode.UNAUTHORIZED_ACCESS,
          `Access denied you don't own this postId (${blogId})`
        );
      }
      return ResponseBuilder.success(true , "admin verified")
    } catch (error: any) {
      return ErrorBuilder.build(
        ErrorCode.INTERNAL_SERVER_ERROR,
        error.message || "Failed to fetch posts"
      );
    }
  }

  async validate(props: CreatePostRequest) {
    return validatePostCreation.validate(props);
  }

  async updatePart(
    id: number,
    part: UpdatePartType,
    payload: object,
    language: string
  ) {
    try {
      const strategy = UpdateStrategyFactory.create(part, this.blogRepo);
      const ok = await strategy.execute(id, payload as any,language);
      if (!ok) {
        return ErrorBuilder.build(
          ErrorCode.INTERNAL_SERVER_ERROR,
          "Update did not modify any records"
        );
      }
      return ResponseBuilder.success(payload, `Post ${part} updated successfully`);
    } catch (error: any) {
      if (error?.name === 'ValidationError') {
        return ErrorBuilder.build(
          ErrorCode.VALIDATION_ERROR,
          error.message
        );
      }
      return ErrorBuilder.build(
        ErrorCode.INTERNAL_SERVER_ERROR,
        error.message || "Unexpected error"
      );
    }
  }
}
