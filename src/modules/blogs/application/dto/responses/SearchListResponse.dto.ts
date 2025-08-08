import { CategoryResponse } from "./CategoryResponse.dto";
import { PostListResponse } from "./PostListResponse.dto";
import { TagResponse } from "./TagResponse.dto";

export interface SearchResponse {
  posts: PostListResponse[];
  categories: CategoryResponse[];
  tags: TagResponse[];
  total_results: number;
  search_time_ms: number;
  suggestions?: string[];
  facets?: {
    categories: Array<{ id: number; name: string; count: number }>;
    tags: Array<{ id: number; name: string; count: number }>;
    authors: Array<{ id: number; name: string; count: number }>;
  };
}
