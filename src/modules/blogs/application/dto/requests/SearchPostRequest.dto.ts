export interface SearchRequest {
    query: string;
    filters?: {
      categories?: number[];
      tags?: number[];
      author_id?: number;
      title?: string;
    };
    page?: number;
    limit?: number;
}
