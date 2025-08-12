export const DELETE_QUIRES = {
    deleteById: `
        DELETE FROM posts WHERE id = $1 RETURNS id
    `,
    // Remove post-category relationship
    removePostCategory: `
      DELETE FROM post_categories
      WHERE post_id = $1 AND category_id = $2;
    `,

    // Remove post-tag relationship
    removePostTag: `
      DELETE FROM post_tags
      WHERE post_id = $1 AND tag_id = $2;
    `,

    // Remove content section
    removeContentSection: `
      DELETE FROM content_sections
      WHERE id = $1 AND post_id = $2;
    `,

    // Remove FAQ item
    removeFaqItem: `
      DELETE FROM faq_items
      WHERE id = $1 AND content_section_id = $2;
    `,

    // Remove table of contents item
    removeTableOfContents: `
      DELETE FROM table_of_contents
      WHERE id = $1 AND post_id = $2;
    `,

    // Remove related post
    removeRelatedPost: `
      DELETE FROM related_posts
      WHERE id = $1 AND post_id = $2;
    `
}