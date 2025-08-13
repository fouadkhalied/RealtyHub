export const UPDATE_QUERIES = {
  // Update main post
  updatePost: `
    UPDATE posts SET
      slug = $2,
      title_ar = $3,
      title_en = $4,
      summary_ar = $5,
      summary_en = $6,
      author_id = $7,
      featured_image_url = $8,
      status = $9
    WHERE id = $1
    RETURNING id as post_id;
  `,

  // Update post tags - Arabic
  updatePostTagAr: `
    UPDATE tags 
    SET name_ar = $3, slug = $4
    WHERE id = $2
    AND EXISTS (
      SELECT 1 FROM post_tags 
      WHERE post_id = $1 AND tag_id = $2
    )
    RETURNING id;
  `,

  // Update post tags - English
  updatePostTagEn: `
    UPDATE tags 
    SET name_en = $3, slug = $4
    WHERE id = $2
    AND EXISTS (
      SELECT 1 FROM post_tags 
      WHERE post_id = $1 AND tag_id = $2
    )
    RETURNING id;
  `,

  // Update table of contents - Arabic
  updateTableOfContentsAr: `
    UPDATE table_of_contents SET
      heading_ar = $3,
      toc_order = $4
    WHERE id = $2 AND post_id = $1
    RETURNING id;
  `,

  // Update table of contents - English
  updateTableOfContentsEn: `
    UPDATE table_of_contents SET
      heading_en = $3,
      toc_order = $4
    WHERE id = $2 AND post_id = $1
    RETURNING id;
  `,

  // Update FAQ items - Arabic
  updateFaqItemAr: `
    UPDATE faq_items SET
      question_ar = $3,
      answer_ar = $4,
      faq_order = $5
    WHERE id = $2 AND content_section_id = $1
    RETURNING id;
  `,

  // Update FAQ items - English
  updateFaqItemEn: `
    UPDATE faq_items SET
      question_en = $3,
      answer_en = $4,
      faq_order = $5
    WHERE id = $2 AND content_section_id = $1
    RETURNING id;
  `,

  // Update related posts - Arabic
  updateRelatedPostAr: `
    UPDATE related_posts SET
      related_post_title_ar = $3,
      related_post_slug = $4,
      relevance_order = $5
    WHERE id = $2 AND post_id = $1
    RETURNING id;
  `,

  // Update related posts - English
  updateRelatedPostEn: `
    UPDATE related_posts SET
      related_post_title_en = $3,
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

  // Update content section - Arabic
  updateContentSectionAr: `
    UPDATE content_sections SET
      section_order = $3,
      heading_ar = $4,
      body_ar = $5,
      section_type = $6
    WHERE id = $2 AND post_id = $1
    RETURNING id;
  `,

  // Update content section - English
  updateContentSectionEn: `
    UPDATE content_sections SET
      section_order = $3,
      heading_en = $4,
      body_en = $5,
      section_type = $6
    WHERE id = $2 AND post_id = $1
    RETURNING id;
  `,

  // Update category - Arabic
  updateCategoryAr: `
    UPDATE categories 
    SET name_ar = $3, slug = $4, description_ar = $5
    WHERE id = $2
    AND EXISTS (
      SELECT 1 FROM post_categories 
      WHERE post_id = $1 AND category_id = $2
    )
    RETURNING id;
  `,

  // Update category - English
  updateCategoryEn: `
    UPDATE categories 
    SET name_en = $3, slug = $4, description_en = $5
    WHERE id = $2
    AND EXISTS (
      SELECT 1 FROM post_categories 
      WHERE post_id = $1 AND category_id = $2
    )
    RETURNING id;
  `
};