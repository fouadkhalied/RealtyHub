export const UPDATE_QUERIES = {
    // Update main post
    updatePost: `
      UPDATE posts SET
        slug = $2,
        title = $3,
        summary = $4,
        author_id = $5,
        featured_image_url = $6,
        status = $7
      WHERE id = $1
      RETURNING id as post_id;
    `,

    // Update post tags
    updatePostTag: `
      UPDATE tags 
      SET name = $3, slug = $4 
      WHERE id = $2 
      AND EXISTS (
        SELECT 1 FROM post_tags 
        WHERE post_id = $1 AND tag_id = $2
      )
      RETURNING id;
    `,
  
    // Update table of contents
    updateTableOfContents: `
      UPDATE table_of_contents SET
        heading = $3,
        toc_order = $4
      WHERE id = $2 AND post_id = $1
      RETURNING id;
    `,

    // Update FAQ items  
    updateFaqItem: `
      UPDATE faq_items SET
        question = $3,
        answer = $4,
        faq_order = $5
      WHERE id = $2 AND content_section_id = $1
      RETURNING id;
    `,

    // Update related posts
    updateRelatedPost: `
      UPDATE related_posts SET
        related_post_title = $3,
        related_post_slug = $4,
        relevance_order = $5
      WHERE id = $2 AND post_id = $1
      RETURNING id;
    `,

    // Update post status (quick utility)
    updatePostStatus: `
      UPDATE posts SET
        status = $2
      WHERE id = $1
      RETURNING id as post_id;
    `,

    // Update content section order
    updateContentSectionOrder: `
      UPDATE content_sections SET
        section_order = $3
      WHERE id = $2 AND post_id = $1
      RETURNING id;
    `,

    // Update content section
    updateContentSection: `
      UPDATE content_sections SET
        section_order = $3,
        heading = $4,
        body = $5,
        section_type = $6
      WHERE id = $2 AND post_id = $1
      RETURNING id;
    `,

    // Update category
    updateCategory: `
      UPDATE categories 
      SET name = $3, slug = $4, description = $5 
      WHERE id = $2 
      AND EXISTS (
        SELECT 1 FROM post_categories 
        WHERE post_id = $1 AND category_id = $2
      )
      RETURNING id;
    `
};
