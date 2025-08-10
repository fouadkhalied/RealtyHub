import { BlogInsertQueries } from "../../interfaces/blogInsertion";

export const BLOG_INSERT_QUERIES: BlogInsertQueries = {
    // Insert main post - FIXED: Removed extra parameters and trailing comma
    insertPost: `
      INSERT INTO posts (
        slug, title, summary, author_id, featured_image_url, status
      ) VALUES (
        $1, $2, $3, $4, $5, $6
      ) RETURNING id as post_id;
    `,
  
    // Insert content sections - FIXED: Added RETURNING id
    insertContentSections: `
      INSERT INTO content_sections (
        post_id, section_order, heading, body, section_type
      ) VALUES ($1, $2, $3, $4, $5) RETURNING id;
    `,
  
    // Insert categories (batch) - Already correct
    insertCategories: `
      INSERT INTO categories (name, slug, description)
      VALUES ($1, $2, $3)
      ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description
      RETURNING id;
    `,
  
    // Insert tags (batch) - Already correct
    insertTags: `
      INSERT INTO tags (name, slug)
      VALUES ($1, $2)
      ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name
      RETURNING id;
    `,
  
    // Insert post-category relationships - Already correct
    insertPostCategories: `
      INSERT INTO post_categories (post_id, category_id)
      VALUES ($1, $2)
      ON CONFLICT (post_id, category_id) DO NOTHING;
    `,
  
    // Insert post-tag relationships - Already correct
    insertPostTags: `
      INSERT INTO post_tags (post_id, tag_id)
      VALUES ($1, $2)
      ON CONFLICT (post_id, tag_id) DO NOTHING;
    `,
  
    // Insert table of contents - FIXED: Added RETURNING id
    insertTableOfContents: `
      INSERT INTO table_of_contents (
        post_id, heading, toc_order
      ) VALUES ($1, $2, $3) RETURNING id;
    `,
  
    // Insert FAQ items - Already correct
    insertFaqItems: `
      INSERT INTO faq_items (
        content_section_id, question, answer, faq_order
      ) VALUES ($1, $2, $3, $4) RETURNING id;
    `,
    // Insert related posts - Already correct
    insertRelatedPosts: `
      INSERT INTO related_posts (
        post_id, related_post_title, related_post_slug, 
        relevance_order
      ) VALUES ($1, $2, $3, $4) RETURNING id;
    `
};
