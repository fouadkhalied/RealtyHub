import { db, sql } from "@vercel/postgres";
import { CreatePostRequest } from "../../application/dto/requests/CreatePostRequest.dto";
import { IBlogRepository } from "../../application/repositories/IBlogRepository";
import { BLOG_INSERT_QUERIES } from "../quires/quires.write";
import { PostResponse } from "../../application/dto/responses/PostResponse.dto";
import { PaginatedResponse } from "../../../../libs/common/pagination.vo";
import { PostListResponse } from "../../application/dto/responses/PostListResponse.dto";
import { PostQueryParams } from "../../application/quires/PostQueryParams";
import { Post } from "../../application/entites/post.entity";

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

    // getPostById(id: number): Promise<PostResponse | null> {
        
    // }

    // getPostBySlug(slug: string): Promise<PostResponse | null> {
        
    // }

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