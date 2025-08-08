import { CreatePostRequest } from "../dto/requests/CreatePostRequest.dto";
import { IBlogRepository } from "../../domain/repositories/IBlogRepository";
import { validatePostCreation } from "../validators/blog.validate";
import {
  PaginatedResponse,
  PaginationParams
} from "../../../../libs/common/pagination.vo";
import { SearchRequest } from "../dto/requests/SearchPostRequest.dto";
import { PostResponse } from "../dto/responses/PostResponse.dto";
import { ApiResponseInterface } from "../../../../libs/common/apiResponse/interfaces/apiResponse.interface";
import { ErrorCode } from "../../../../libs/common/errors/enums/basic.error.enum";
import { PostListResponse } from "../dto/responses/PostListResponse.dto";
import { ErrorBuilder } from "../../../../libs/common/errors/errorBuilder";
import { ResponseBuilder } from "../../../../libs/common/apiResponse/apiResponseBuilder";

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
  
  

  async validate(props: CreatePostRequest) {
    return validatePostCreation.validate(props);
  }
}
