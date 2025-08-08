import { PaginatedResponse, PaginationParams } from "../../../../libs/common/pagination.vo";
import { CreatePostRequest } from "../../application/dto/requests/CreatePostRequest.dto";
import { SearchRequest } from "../../application/dto/requests/SearchPostRequest.dto";
import { PostListResponse } from "../../application/dto/responses/PostListResponse.dto";
import { PostResponse } from "../../application/dto/responses/PostResponse.dto";
import { Post } from "../entities/post.entity";

export interface IBlogRepository {
  create(postData: CreatePostRequest , adminId : number): Promise<{id : number , message : string}>;
  
  // // Get post by ID with all related data
  findById(id: number): Promise<PostResponse | null>;
  
  // // Get post by slug with all related data
  findBySlug(slug: string): Promise<PostResponse | null>;
  
  // // Get paginated list of posts
  findAll(params: PaginationParams, filters: SearchRequest): Promise<PaginatedResponse<PostListResponse>>;
  
  // // Update post with related data
  // //updatePost(id: number, postData: UpdatePostRequest): Promise<PostResponse>;
  
  // // Delete post and all related data
  // deletePost(id: number): Promise<void>;
  
  // // Publish/unpublish post
  // publishPost(id: number, publishedAt?: Date): Promise<Post>;
  // unpublishPost(id: number): Promise<Post>;
  
  // // Increment post views
  // incrementPostViews(id: number): Promise<void>;
}
