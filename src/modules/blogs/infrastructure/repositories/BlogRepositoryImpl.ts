import { db, sql } from "@vercel/postgres";
import { CreatePostRequest } from "../../application/dto/requests/CreatePostRequest.dto";
import { IBlogRepository } from "../../domain/repositories/IBlogRepository";
import { BLOG_INSERT_QUERIES } from "../queries/BlogService/queries.write";
import { PostResponse } from "../../application/dto/responses/PostResponse.dto";
import { PaginatedResponse, PaginationParams } from "../../../../libs/common/pagination.vo";
import { PostListResponse } from "../../application/dto/responses/PostListResponse.dto";
import { SearchRequest } from "../../application/dto/requests/SearchPostRequest.dto";
import { READ_QUEIRES } from "../queries/BlogService/queries.read";

export class BlogRepositoryImplementation implements IBlogRepository {
    async create(postData: CreatePostRequest, adminId: number): Promise<{ id: number; message: string }> {
        const client = await db.connect();
        try {
            await client.sql`BEGIN`;

            const { 
                slug, 
                title, 
                summary, 
                featuredImageUrl, 
                status, 
                contentSections, 
                categories, 
                tags, 
                tableOfContents, 
                faqItems,
                relatedPosts 
            } = postData;

            // Insert main post
            const postResult = await client.query(BLOG_INSERT_QUERIES.insertPost, [
                slug, 
                title, 
                summary, 
                adminId, 
                featuredImageUrl, 
                status
            ]);
            
            const post_id = postResult.rows[0].post_id;

            if (!post_id) {
                throw new Error("Error occurred while retrieving post id");
            }

            // Insert content sections and get their IDs
            const contentSectionInserts = await Promise.all(
                contentSections.map((ele) =>
                    client.query(BLOG_INSERT_QUERIES.insertContentSections, [
                        post_id,
                        ele.sectionOrder,
                        ele.heading,
                        ele.body,
                        ele.sectionType,
                    ])
                )
            );
            const contentSectionIds = contentSectionInserts.map((result) => result.rows[0].id);

            // Insert categories and get their IDs
            const categoryInserts = await Promise.all(
                categories.map((ele) =>
                    client.query(BLOG_INSERT_QUERIES.insertCategories, [
                        ele.name, 
                        ele.slug, 
                        ele.description
                    ])
                )
            );
            const categoryIds = categoryInserts.map((result) => result.rows[0].id);

            // Link posts to categories
            await Promise.all(
                categoryIds.map((categoryId) =>
                    client.query(BLOG_INSERT_QUERIES.insertPostCategories, [post_id, categoryId])
                )
            );

            // Insert tags and get their IDs
            const tagInserts = await Promise.all(
                tags.map((ele) =>
                    client.query(BLOG_INSERT_QUERIES.insertTags, [ele.name, ele.slug])
                )
            );
            const tagIds = tagInserts.map((result) => result.rows[0].id);

            // Link posts to tags
            await Promise.all(
                tagIds.map((tagId) =>
                    client.query(BLOG_INSERT_QUERIES.insertPostTags, [post_id, tagId])
                )
            );

            // Insert table of contents
            await Promise.all(
                tableOfContents.map((ele) =>
                    client.query(BLOG_INSERT_QUERIES.insertTableOfContents, [
                        post_id,
                        ele.heading,
                        ele.tocOrder,
                    ])
                )
            );

            // Insert FAQ items (linked to content sections by index)
            await Promise.all(
                faqItems.map((ele, index) => {
                    // Make sure we have a corresponding content section
                    if (index < contentSectionIds.length) {
                        return client.query(BLOG_INSERT_QUERIES.insertFaqItems, [
                            contentSectionIds[index], 
                            ele.question, 
                            ele.answer, 
                            ele.faqOrder
                        ]);
                    }
                    return Promise.resolve(); // Skip if no corresponding section
                })
            );

            // Insert realted posts
            await Promise.all(
                relatedPosts.map((ele)=>{
                    client.query(BLOG_INSERT_QUERIES.insertRelatedPosts, [post_id, ele.relatedPostTitle, ele.relatedPostSlug, ele.relevanceOrder])
                })
            )

            await client.sql`COMMIT`;
            return { id: post_id, message: "Post created successfully" };
        } catch (error) {
            await client.sql`ROLLBACK`;
            throw new Error(`Failed to create post: ${error instanceof Error ? error.message : "Unknown error"}`);
        } finally {
            client.release();
        }
    }

    async findById(id: number): Promise<PostResponse | null> {
        try {
            const result = await sql.query<PostResponse>(READ_QUEIRES.findById, [id]);
            return result.rows[0] || null;
        } catch (error) {
            throw new Error(
                `Failed to get post by id (${id}): ${
                    error instanceof Error ? error.message : "Unknown error"
                }`
            );
        }
    }
    

    async findBySlug(slug: string): Promise<PostResponse[] | null> {
        try {
            const result = await sql.query<PostResponse>(READ_QUEIRES.findBySlug, [slug]);
            return result.rows.length === 0 ? null : result.rows;
        } catch (error) {
            throw new Error(
                `Failed to get post by slug (${slug}): ${
                    error instanceof Error ? error.message : "Unknown error"
                }`
            );
        }
    }

    
    async findAll(
        params: PaginationParams,
        filters: SearchRequest
      ): Promise<PaginatedResponse<PostListResponse>> {
        try {
          const offset = (params.page - 1) * params.limit;
      
          // Get paginated data
          const postsResult = await sql.query<PostListResponse>(
            READ_QUEIRES.findAll,
            [params.limit, offset]
          );
      
          // Get total count
          const countResult = await sql.query<{ count: string }>(READ_QUEIRES.countAll);
          const totalCount = parseInt(countResult.rows[0].count, 10);
      
          const totalPages = Math.ceil(totalCount / params.limit);
      
          return {
            data: postsResult.rows,
            pagination: {
              currentPage: params.page,
              limit: params.limit,
              totalCount,
              totalPages,
              hasNext: params.page < totalPages,
              hasPrevious: params.page > 1,
            },
          };
        } catch (error) {
          throw new Error(
            `Failed to get paginated posts: ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          );
        }
      }
      
            
      

    // async getPosts(params: PostQueryParams): Promise<PaginatedResponse<PostListResponse>> {
    //     try {
    //         return (await sql.query(READ_QUIRES_POSTS.getPost , [params.limit , params.page])).rows as PostListResponse
    //     } catch (error) {
            
    //     }
    // }

    // deletePost(id: number): Promise<void> {
        
    // }

    // publishPost(id: number, publishedAt?: Date): Promise<Post> {
        
    // }

    // unpublishPost(id: number): Promise<Post> {
        
    // }

    // incrementPostViews(id: number): Promise<void> {
        
    // }

    
}
