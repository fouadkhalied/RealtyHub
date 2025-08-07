import { PaginatedResponse } from "../../../../libs/common/pagination.vo";
import { CreatePostRequest } from "../dto/requests/CreatePostRequest.dto";
import { PostListResponse } from "../dto/responses/PostListResponse.dto";
import { PostResponse } from "../dto/responses/PostResponse.dto";
import { Post } from "../entites/post.entity";
import { PostQueryParams } from "../quires/PostQueryParams";

export interface IBlogRepository {
  create(postData: CreatePostRequest , adminId : number): Promise<{id : number , message : string}>;
  
  // // Get post by ID with all related data
  // getPostById(id: number): Promise<PostResponse | null>;
  
  // // Get post by slug with all related data
  // getPostBySlug(slug: string): Promise<PostResponse | null>;
  
  // // Get paginated list of posts
  //getPosts(params: PostQueryParams): Promise<PaginatedResponse<PostListResponse>>;
  
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