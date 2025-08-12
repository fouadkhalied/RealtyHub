export const WRITE_QUERIES = {
  // Insert main post - Your schema has both old and new columns
  insertPost: `
    INSERT INTO posts (
      slug, title_ar, title_en, summary_ar, summary_en, author_id, featured_image_url, status, language
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9
    ) RETURNING id as post_id;
  `,

  // Insert content sections - Your schema has both old and new columns
  insertContentSections: `
    INSERT INTO content_sections (
      post_id, section_order, heading_ar, heading_en, body_ar, body_en, section_type
    ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id;
  `,

  // Insert categories - Your schema has both old and new columns
  insertCategories: `
    INSERT INTO categories (name_ar, name_en, slug, description_ar, description_en)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (slug) DO UPDATE SET
      name_ar = EXCLUDED.name_ar,
      name_en = EXCLUDED.name_en,
      description_ar = EXCLUDED.description_ar,
      description_en = EXCLUDED.description_en
    RETURNING id;
  `,

  // Insert tags - Your schema has both old and new columns
  insertTags: `
    INSERT INTO tags (name_ar, name_en, slug)
    VALUES ($1, $2, $3)
    ON CONFLICT (slug) DO UPDATE SET
      name_ar = EXCLUDED.name_ar,
      name_en = EXCLUDED.name_en
    RETURNING id;
  `,

  // Insert post-category relationships - No change needed
  insertPostCategories: `
    INSERT INTO post_categories (post_id, category_id)
    VALUES ($1, $2)
    ON CONFLICT (post_id, category_id) DO NOTHING;
  `,

  // Insert post-tag relationships - No change needed
  insertPostTags: `
    INSERT INTO post_tags (post_id, tag_id)
    VALUES ($1, $2)
    ON CONFLICT (post_id, tag_id) DO NOTHING;
  `,

  // Insert table of contents - Your schema has both old and new columns
  insertTableOfContents: `
    INSERT INTO table_of_contents (
      post_id, heading_ar, heading_en, toc_order
    ) VALUES ($1, $2, $3, $4) RETURNING id;
  `,

  // Insert FAQ items - Your schema has both old and new columns
  insertFaqItems: `
    INSERT INTO faq_items (
      content_section_id, question_ar, question_en, answer_ar, answer_en, faq_order
    ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id;
  `,
  
  // Insert related posts - Your schema has both old and new columns
  insertRelatedPosts: `
    INSERT INTO related_posts (
      post_id, related_post_title_ar, related_post_title_en, related_post_slug, 
      relevance_order
    ) VALUES ($1, $2, $3, $4, $5) RETURNING id;
  `
};