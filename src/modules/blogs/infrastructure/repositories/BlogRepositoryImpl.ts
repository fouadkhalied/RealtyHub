import { db, sql } from "@vercel/postgres";
import { CreatePostRequest } from "../../application/dto/requests/CreatePostRequest.dto";
import { IBlogRepository } from "../../domain/repositories/IBlogRepository";
import { WRITE_QUERIES } from "../queries/BlogService/queries.write";
import { PostResponse } from "../../application/dto/responses/PostResponse.dto";
import { PaginatedResponse, PaginationParams } from "../../../../libs/common/pagination.vo";
import { PostListResponse } from "../../application/dto/responses/PostListResponse.dto";
import { SearchRequest } from "../../application/dto/requests/SearchPostRequest.dto";
import { READ_QUERIES } from "../queries/BlogService/queries.read";
import { DELETE_QUIRES } from "../queries/BlogService/quires.delete";
import { UPDATE_QUERIES } from "../queries/BlogService/queries.update";
import { CategoryUpdatePayload, ContentSectionUpdatePayload, FaqItemUpdatePayload, RelatedPostUpdatePayload, TableOfContentUpdatePayload, TagUpdatePayload } from "../../application/interfaces/blog.interface";

export class BlogRepositoryImplementation implements IBlogRepository {
    
// Updated create function
async create(postData: CreatePostRequest, adminId: number): Promise<{ id: number; message: string }> {
    const client = await db.connect();
    try {
        await client.sql`BEGIN`;

        const { 
            slug, 
            titleAr,
            titleEn, 
            summaryAr,
            summaryEn, 
            featuredImageUrl, 
            status, 
            minTimeToRead,
            ar,
            en
        } = postData;

        // Insert main post with multilingual fields
        const postResult = await client.query(WRITE_QUERIES.insertPost, [
            slug, 
            titleAr,
            titleEn, 
            summaryAr || null,
            summaryEn || null, 
            adminId, 
            featuredImageUrl || null, 
            status || 'draft',
            minTimeToRead,
            'en' // Default language for backward compatibility
        ]);
        
        const post_id = postResult.rows[0].post_id;

        if (!post_id) {
            throw new Error("Error occurred while retrieving post id");
        }

        // Insert content sections by matching section orders (avoiding duplicates)
        const uniqueSectionOrders = [...new Set([
            ...ar.contentSections.map(s => s.sectionOrder),
            ...en.contentSections.map(s => s.sectionOrder)
        ])].sort((a, b) => a - b);

        const contentSectionInserts = await Promise.all(
            uniqueSectionOrders.map((sectionOrder) => {
                const arSection = ar.contentSections.find(s => s.sectionOrder === sectionOrder);
                const enSection = en.contentSections.find(s => s.sectionOrder === sectionOrder);

                return client.query(WRITE_QUERIES.insertContentSections, [
                    post_id,
                    sectionOrder,
                    arSection?.heading || null, // heading_ar
                    enSection?.heading || null, // heading_en
                    arSection?.body || null,    // body_ar
                    enSection?.body || null,    // body_en
                    arSection?.sectionType || enSection?.sectionType || 'text',
                ]);
            })
        );
        const contentSectionIds = contentSectionInserts.map((result) => result.rows[0].id);

        // Merge and deduplicate categories by slug
        const allCategories = [...ar.categories, ...en.categories];
        const uniqueCategories = allCategories.reduce((acc, category) => {
            const existing = acc.find(c => c.slug === category.slug);
            if (existing) {
                // Merge Arabic and English data
                if (ar.categories.some(c => c.slug === category.slug)) {
                    existing.name_ar = category.name;
                    existing.description_ar = category.description;
                } else {
                    existing.name_en = category.name;
                    existing.description_en = category.description;
                }
            } else {
                // Create new entry
                const isArabic = ar.categories.some(c => c.slug === category.slug);
                acc.push({
                    slug: category.slug,
                    name_ar: isArabic ? category.name : null,
                    name_en: isArabic ? null : category.name,
                    description_ar: isArabic ? category.description : null,
                    description_en: isArabic ? null : category.description
                });
            }
            return acc;
        }, [] as any[]);

        // Insert categories with multilingual data
        const categoryInserts = await Promise.all(
            uniqueCategories.map((category) =>
                client.query(WRITE_QUERIES.insertCategories, [
                    category.name_ar,
                    category.name_en, 
                    category.slug, 
                    category.description_ar,
                    category.description_en
                ])
            )
        );
        const categoryIds = categoryInserts.map((result) => result.rows[0].id);

        // Link posts to categories
        await Promise.all(
            categoryIds.map((categoryId) =>
                client.query(WRITE_QUERIES.insertPostCategories, [post_id, categoryId])
            )
        );

        // Merge and deduplicate tags by slug
        const allTags = [...ar.tags, ...en.tags];
        const uniqueTags = allTags.reduce((acc, tag) => {
            const existing = acc.find(t => t.slug === tag.slug);
            if (existing) {
                // Merge Arabic and English data
                if (ar.tags.some(t => t.slug === tag.slug)) {
                    existing.name_ar = tag.name;
                } else {
                    existing.name_en = tag.name;
                }
            } else {
                // Create new entry
                const isArabic = ar.tags.some(t => t.slug === tag.slug);
                acc.push({
                    slug: tag.slug,
                    name_ar: isArabic ? tag.name : null,
                    name_en: isArabic ? null : tag.name
                });
            }
            return acc;
        }, [] as any[]);

        // Insert tags with multilingual data
        const tagInserts = await Promise.all(
            uniqueTags.map((tag) =>
                client.query(WRITE_QUERIES.insertTags, [
                    tag.name_ar,
                    tag.name_en, 
                    tag.slug
                ])
            )
        );
        const tagIds = tagInserts.map((result) => result.rows[0].id);

        // Link posts to tags
        await Promise.all(
            tagIds.map((tagId) =>
                client.query(WRITE_QUERIES.insertPostTags, [post_id, tagId])
            )
        );

        // Insert table of contents - merge by tocOrder
        const uniqueTocOrders = [...new Set([
            ...ar.tableOfContents.map(t => t.tocOrder),
            ...en.tableOfContents.map(t => t.tocOrder)
        ])].sort((a, b) => a - b);

        if (uniqueTocOrders.length > 0) {
            await Promise.all(
                uniqueTocOrders.map((tocOrder) => {
                    const arToc = ar.tableOfContents.find(t => t.tocOrder === tocOrder);
                    const enToc = en.tableOfContents.find(t => t.tocOrder === tocOrder);

                    return client.query(WRITE_QUERIES.insertTableOfContents, [
                        post_id,
                        arToc?.heading || null, // heading_ar
                        enToc?.heading || null, // heading_en
                        tocOrder,
                    ]);
                })
            );
        }

        // Insert FAQ items - merge by faqOrder and link to content sections
        const uniqueFaqOrders = [...new Set([
            ...ar.faqItems.map(f => f.faqOrder),
            ...en.faqItems.map(f => f.faqOrder)
        ])].sort((a, b) => a - b);

        if (uniqueFaqOrders.length > 0 && contentSectionIds.length > 0) {
            await Promise.all(
                uniqueFaqOrders.map((faqOrder) => {
                    const arFaq = ar.faqItems.find(f => f.faqOrder === faqOrder);
                    const enFaq = en.faqItems.find(f => f.faqOrder === faqOrder);

                    // Link to first available content section (you might want to adjust this logic)
                    const contentSectionId = contentSectionIds[0];

                    return client.query(WRITE_QUERIES.insertFaqItems, [
                        contentSectionId,
                        arFaq?.question || null, // question_ar
                        enFaq?.question || null, // question_en
                        arFaq?.answer || null,   // answer_ar
                        enFaq?.answer || null,   // answer_en
                        faqOrder
                    ]);
                })
            );
        }

        // Insert related posts - merge by relevanceOrder
        const uniqueRelevanceOrders = [...new Set([
            ...ar.relatedPosts.map(r => r.relevanceOrder),
            ...en.relatedPosts.map(r => r.relevanceOrder)
        ])].sort((a, b) => a - b);

        if (uniqueRelevanceOrders.length > 0) {
            await Promise.all(
                uniqueRelevanceOrders.map((relevanceOrder) => {
                    const arRelated = ar.relatedPosts.find(r => r.relevanceOrder === relevanceOrder);
                    const enRelated = en.relatedPosts.find(r => r.relevanceOrder === relevanceOrder);

                    return client.query(WRITE_QUERIES.insertRelatedPosts, [
                        post_id, 
                        arRelated?.relatedPostTitle || null, // title_ar
                        enRelated?.relatedPostTitle || null, // title_en
                        arRelated?.relatedPostSlug || enRelated?.relatedPostSlug, 
                        relevanceOrder
                    ]);
                })
            );
        }

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
            const result = await sql.query<PostResponse>(READ_QUERIES.findById, [id]);
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
            const result = await sql.query<PostResponse>(READ_QUERIES.findBySlug, [slug]);
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
            READ_QUERIES.findAll,
            [params.limit, offset]
          );
      
          // Get total count
          const countResult = await sql.query<{ count: string }>(READ_QUERIES.countAll);
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
    
    async updateTags(id: number, payload: TagUpdatePayload[], language: string): Promise<boolean> {
        const client = await db.connect();
        try {
            await client.sql`BEGIN`;
            await Promise.all(
                payload.map(async (ele) => {
                    // Update based on language - tags table should have name_ar and name_en columns
                    if (language === 'ar') {
                        await client.query(UPDATE_QUERIES.updatePostTagAr, [id, ele.id, ele.name, ele.slug]);
                    } else if (language === 'en') {
                        await client.query(UPDATE_QUERIES.updatePostTagEn, [id, ele.id, ele.name, ele.slug]);
                    } else {
                        throw new Error(`Unsupported language: ${language}`);
                    }
                })
            );
            await client.sql`COMMIT`;
            return true;
        } catch (error) {
            await client.sql`ROLLBACK`;
            throw new Error(
                `Failed to update tags for post (${id}): ${
                    error instanceof Error ? error.message : "Unknown error"
                }`
            );
        } finally {
            client.release();
        }
    }
    
    // Update content sections
    async updateContentSections(postId: number, payload: ContentSectionUpdatePayload[], language: string): Promise<boolean> {
        const client = await db.connect();
        try {
            await client.query('BEGIN');
            
            await Promise.all(
                payload.map(async (section) => {
                    // Update based on language - content_sections table should have heading_ar/heading_en and body_ar/body_en
                    if (language === 'ar') {
                        await client.query(UPDATE_QUERIES.updateContentSectionAr, [
                            postId, 
                            section.id,
                            section.sectionOrder, 
                            section.heading, 
                            section.body, 
                            section.sectionType
                        ]);
                    } else if (language === 'en') {
                        await client.query(UPDATE_QUERIES.updateContentSectionEn, [
                            postId, 
                            section.id,
                            section.sectionOrder, 
                            section.heading, 
                            section.body, 
                            section.sectionType
                        ]);
                    } else {
                        throw new Error(`Unsupported language: ${language}`);
                    }
                })
            );
            
            await client.query('COMMIT');
            return true;
        } catch (error) {
            await client.query('ROLLBACK');
            throw new Error(
                `Failed to update content sections for post (${postId}): ${
                    error instanceof Error ? error.message : "Unknown error"
                }`
            );
        } finally {
            client.release();
        }
    }
    
    // Update categories
    async updateCategories(postId: number, payload: CategoryUpdatePayload[], language: string): Promise<boolean> {
        const client = await db.connect();
        try {
            await client.query('BEGIN');
            
            await Promise.all(
                payload.map(async (category) => {
                    // Update based on language - categories table should have name_ar/name_en and description_ar/description_en
                    if (language === 'ar') {
                        await client.query(UPDATE_QUERIES.updateCategoryAr, [
                            postId, 
                            category.id, 
                            category.name, 
                            category.slug, 
                            category.description
                        ]);
                    } else if (language === 'en') {
                        await client.query(UPDATE_QUERIES.updateCategoryEn, [
                            postId, 
                            category.id, 
                            category.name, 
                            category.slug, 
                            category.description
                        ]);
                    } else {
                        throw new Error(`Unsupported language: ${language}`);
                    }
                })
            );
            
            await client.query('COMMIT');
            return true;
        } catch (error) {
            await client.query('ROLLBACK');
            throw new Error(
                `Failed to update categories for post (${postId}): ${
                    error instanceof Error ? error.message : "Unknown error"
                }`
            );
        } finally {
            client.release();
        }
    }
    
    // Update table of contents
    async updateTableOfContents(postId: number, payload: TableOfContentUpdatePayload[], language: string): Promise<boolean> {
        const client = await db.connect();
        try {
            await client.query('BEGIN');
            
            await Promise.all(
                payload.map(async (toc) => {
                    // Update based on language - table_of_contents should have heading_ar and heading_en
                    if (language === 'ar') {
                        await client.query(UPDATE_QUERIES.updateTableOfContentsAr, [
                            postId, 
                            toc.id, 
                            toc.heading, 
                            toc.tocOrder
                        ]);
                    } else if (language === 'en') {
                        await client.query(UPDATE_QUERIES.updateTableOfContentsEn, [
                            postId, 
                            toc.id, 
                            toc.heading, 
                            toc.tocOrder
                        ]);
                    } else {
                        throw new Error(`Unsupported language: ${language}`);
                    }
                })
            );
            
            await client.query('COMMIT');
            return true;
        } catch (error) {
            await client.query('ROLLBACK');
            throw new Error(
                `Failed to update table of contents for post (${postId}): ${
                    error instanceof Error ? error.message : "Unknown error"
                }`
            );
        } finally {
            client.release();
        }
    }
    
    // Update FAQ items
    async updateFaqItems(contentSectionId: number, payload: FaqItemUpdatePayload[], language: string): Promise<boolean> {
        const client = await db.connect();
        try {
            await client.query('BEGIN');
            
            await Promise.all(
                payload.map(async (faq) => {
                    // Update based on language - faq_items should have question_ar/question_en and answer_ar/answer_en
                    if (language === 'ar') {
                        await client.query(UPDATE_QUERIES.updateFaqItemAr, [
                            contentSectionId, 
                            faq.id, 
                            faq.question, 
                            faq.answer, 
                            faq.faqOrder
                        ]);
                    } else if (language === 'en') {
                        await client.query(UPDATE_QUERIES.updateFaqItemEn, [
                            contentSectionId, 
                            faq.id, 
                            faq.question, 
                            faq.answer, 
                            faq.faqOrder
                        ]);
                    } else {
                        throw new Error(`Unsupported language: ${language}`);
                    }
                })
            );
            
            await client.query('COMMIT');
            return true;
        } catch (error) {
            await client.query('ROLLBACK');
            throw new Error(
                `Failed to update FAQ items for content section (${contentSectionId}): ${
                    error instanceof Error ? error.message : "Unknown error"
                }`
            );
        } finally {
            client.release();
        }
    }
    
    // Update related posts
    async updateRelatedPosts(postId: number, payload: RelatedPostUpdatePayload[], language: string): Promise<boolean> {
        const client = await db.connect();
        try {
            await client.query('BEGIN');
            
            await Promise.all(
                payload.map(async (relatedPost) => {
                    // Update based on language - related_posts should have related_post_title_ar/related_post_title_en
                    if (language === 'ar') {
                        await client.query(UPDATE_QUERIES.updateRelatedPostAr, [
                            postId,
                            relatedPost.id,
                            relatedPost.relatedPostTitle, 
                            relatedPost.relatedPostSlug, 
                            relatedPost.relevanceOrder
                        ]);
                    } else if (language === 'en') {
                        await client.query(UPDATE_QUERIES.updateRelatedPostEn, [
                            postId,
                            relatedPost.id,
                            relatedPost.relatedPostTitle, 
                            relatedPost.relatedPostSlug, 
                            relatedPost.relevanceOrder
                        ]);
                    } else {
                        throw new Error(`Unsupported language: ${language}`);
                    }
                })
            );
            
            await client.query('COMMIT');
            return true;
        } catch (error) {
            await client.query('ROLLBACK');
            throw new Error(
                `Failed to update related posts for post (${postId}): ${
                    error instanceof Error ? error.message : "Unknown error"
                }`
            );
        } finally {
            client.release();
        }
    }

    async deletePost(id: number): Promise<void> {
        try {
            const result = await sql.query(DELETE_QUIRES.deleteById,[id])

            // Check if any rows were affected
            if (result.rowCount === 0) {
                throw new Error(`No post found with ID ${id} to delete`);
            }
        } catch (error) {
            throw new Error(
                `Failed to delete post (${id}) : ${
                  error instanceof Error ? error.message : "Unknown error"
                }`
              );
        }
    }

    async findBlogIDandAdminID(blogId: number, adminId: number): Promise<{success : boolean}> {
        try {
            const result = await sql.query(READ_QUERIES.findPostForAdmin,[blogId,adminId])

            // Check if any rows were affected
            if (result.rowCount === 0) {
                return {success : false}
            }

            return {success : true}

        } catch (error) {
            throw new Error(
                `Failed to verify admin post validation (${blogId}) : ${
                  error instanceof Error ? error.message : "Unknown error"
                }`
              );
        }
    }

    // publishPost(id: number, publishedAt?: Date): Promise<Post> {
        
    // }

    // unpublishPost(id: number): Promise<Post> {
        
    // }

    // incrementPostViews(id: number): Promise<void> {
        
    // }

    
}