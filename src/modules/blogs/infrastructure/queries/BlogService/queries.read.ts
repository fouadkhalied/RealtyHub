export const READ_QUERIES = {
    findPostForAdmin:`
    SELECT FROM posts
    WHERE id = $1 and author_id = $2
    `,
    findById: `
      SELECT 
    p.id,
    p.slug,
    p.title_ar,
    p.title_en,
    p.summary_ar,
    p.summary_en,
    p.featured_image_url AS "featuredImageUrl",
    p.status,
    json_build_object('id', u.id, 'username', u.username) AS author,
    
    -- Arabic content
    json_build_object(
        'content_sections', COALESCE(
            (
                SELECT json_agg(
                    json_build_object(
                        'id', cs.id,
                        'section_order', cs.section_order,
                        'heading', cs.heading_ar,
                        'body', cs.body_ar,
                        'section_type', cs.section_type,
                        'faq_items', COALESCE(
                            (
                                SELECT json_agg(
                                    json_build_object(
                                        'id', fi.id,
                                        'question', fi.question_ar,
                                        'answer', fi.answer_ar,
                                        'faq_order', fi.faq_order
                                    )
                                )
                                FROM faq_items fi
                                WHERE fi.content_section_id = cs.id
                            ), '[]'::json
                        )
                    )
                )
                FROM content_sections cs
                WHERE cs.post_id = p.id
            ), '[]'::json
        ),
        'categories', COALESCE(
            (
                SELECT json_agg(
                    json_build_object(
                        'id', c.id,
                        'name', c.name_ar,
                        'slug', c.slug,
                        'description', c.description_ar
                    )
                )
                FROM post_categories pc
                JOIN categories c ON pc.category_id = c.id
                WHERE pc.post_id = p.id
            ), '[]'::json
        ),
        'tags', COALESCE(
            (
                SELECT json_agg(
                    json_build_object(
                        'id', t.id,
                        'name', t.name_ar,
                        'slug', t.slug
                    )
                )
                FROM post_tags pt
                JOIN tags t ON pt.tag_id = t.id
                WHERE pt.post_id = p.id
            ), '[]'::json
        ),
        'table_of_contents', COALESCE(
            (
                SELECT json_agg(
                    json_build_object(
                        'id', toc.id,
                        'heading', toc.heading_ar,
                        'toc_order', toc.toc_order
                    )
                )
                FROM table_of_contents toc
                WHERE toc.post_id = p.id
            ), '[]'::json
        ),
        'faq_items', COALESCE(
            (
                SELECT json_agg(
                    json_build_object(
                        'id', fi.id,
                        'question', fi.question_ar,
                        'answer', fi.answer_ar,
                        'faq_order', fi.faq_order
                    )
                )
                FROM faq_items fi
                JOIN content_sections cs ON fi.content_section_id = cs.id
                WHERE cs.post_id = p.id
            ), '[]'::json
        ),
        'related_posts', COALESCE(
            (
                SELECT json_agg(
                    json_build_object(
                        'id', rp.id,
                        'related_post_title', rp.related_post_title_ar,
                        'related_post_slug', rp.related_post_slug,
                        'relevance_order', rp.relevance_order
                    )
                )
                FROM related_posts rp
                WHERE rp.post_id = p.id
            ), '[]'::json
        )
    ) AS ar,
    
    -- English content
    json_build_object(
        'content_sections', COALESCE(
            (
                SELECT json_agg(
                    json_build_object(
                        'id', cs.id,
                        'section_order', cs.section_order,
                        'heading', cs.heading_en,
                        'body', cs.body_en,
                        'section_type', cs.section_type,
                        'faq_items', COALESCE(
                            (
                                SELECT json_agg(
                                    json_build_object(
                                        'id', fi.id,
                                        'question', fi.question_en,
                                        'answer', fi.answer_en,
                                        'faq_order', fi.faq_order
                                    )
                                )
                                FROM faq_items fi
                                WHERE fi.content_section_id = cs.id
                            ), '[]'::json
                        )
                    )
                )
                FROM content_sections cs
                WHERE cs.post_id = p.id
            ), '[]'::json
        ),
        'categories', COALESCE(
            (
                SELECT json_agg(
                    json_build_object(
                        'id', c.id,
                        'name', c.name_en,
                        'slug', c.slug,
                        'description', c.description_en
                    )
                )
                FROM post_categories pc
                JOIN categories c ON pc.category_id = c.id
                WHERE pc.post_id = p.id
            ), '[]'::json
        ),
        'tags', COALESCE(
            (
                SELECT json_agg(
                    json_build_object(
                        'id', t.id,
                        'name', t.name_en,
                        'slug', t.slug
                    )
                )
                FROM post_tags pt
                JOIN tags t ON pt.tag_id = t.id
                WHERE pt.post_id = p.id
            ), '[]'::json
        ),
        'table_of_contents', COALESCE(
            (
                SELECT json_agg(
                    json_build_object(
                        'id', toc.id,
                        'heading', toc.heading_en,
                        'toc_order', toc.toc_order
                    )
                )
                FROM table_of_contents toc
                WHERE toc.post_id = p.id
            ), '[]'::json
        ),
        'faq_items', COALESCE(
            (
                SELECT json_agg(
                    json_build_object(
                        'id', fi.id,
                        'question', fi.question_en,
                        'answer', fi.answer_en,
                        'faq_order', fi.faq_order
                    )
                )
                FROM faq_items fi
                JOIN content_sections cs ON fi.content_section_id = cs.id
                WHERE cs.post_id = p.id
            ), '[]'::json
        ),
        'related_posts', COALESCE(
            (
                SELECT json_agg(
                    json_build_object(
                        'id', rp.id,
                        'related_post_title', rp.related_post_title_en,
                        'related_post_slug', rp.related_post_slug,
                        'relevance_order', rp.relevance_order
                    )
                )
                FROM related_posts rp
                WHERE rp.post_id = p.id
            ), '[]'::json
        )
    ) AS en
    
FROM posts p
JOIN users u ON p.author_id = u.id
WHERE p.status = 'published' AND p.id = $1;
    `,

    findBySlug: `
      SELECT 
        p.id,
        p.slug,
        p.title,
        p.summary,
        p.featured_image_url AS "featuredImageUrl",
        p.status,
        json_build_object('id', u.id, 'username', u.username) AS author,
        COALESCE(
            (
                SELECT json_agg(
                    json_build_object(
                        'id', c.id,
                        'name', c.name,
                        'slug', c.slug,
                        'description', c.description
                    )
                )
                FROM post_categories pc
                JOIN categories c ON pc.category_id = c.id
                WHERE pc.post_id = p.id
            ), '[]'::json
        ) AS categories,
        COALESCE(
            (
                SELECT json_agg(
                    json_build_object(
                        'id', t.id,
                        'name', t.name,
                        'slug', t.slug
                    )
                )
                FROM post_tags pt
                JOIN tags t ON pt.tag_id = t.id
                WHERE pt.post_id = p.id
            ), '[]'::json
        ) AS tags,
        COALESCE(
            (
                SELECT json_agg(
                    json_build_object(
                        'id', cs.id,
                        'section_order', cs.section_order,
                        'heading', cs.heading,
                        'body', cs.body,
                        'section_type', cs.section_type,
                        'faq_items', COALESCE(
                            (
                                SELECT json_agg(
                                    json_build_object(
                                        'id', fi.id,
                                        'question', fi.question,
                                        'answer', fi.answer,
                                        'faq_order', fi.faq_order
                                    )
                                )
                                FROM faq_items fi
                                WHERE fi.content_section_id = cs.id
                            ), '[]'::json
                        )
                    )
                )
                FROM content_sections cs
                WHERE cs.post_id = p.id
            ), '[]'::json
        ) AS content_sections,
        COALESCE(
            (
                SELECT json_agg(
                    json_build_object(
                        'id', toc.id,
                        'heading', toc.heading,
                        'toc_order', toc.toc_order
                    )
                )
                FROM table_of_contents toc
                WHERE toc.post_id = p.id
            ), '[]'::json
        ) AS table_of_contents,
        COALESCE(
            (
                SELECT json_agg(
                    json_build_object(
                        'id', rp.id,
                        'related_post_title', rp.related_post_title,
                        'related_post_slug', rp.related_post_slug,
                        'relevance_order', rp.relevance_order
                    )
                )
                FROM related_posts rp
                WHERE rp.post_id = p.id
            ), '[]'::json
        ) AS related_posts
      FROM posts p
      JOIN users u ON p.author_id = u.id
      WHERE p.status = 'published' AND p.slug ILIKE '%' || $1 || '%';
    `,

    findAll: `
      SELECT 
    p.id,
    p.slug,
    p.featured_image_url AS "featuredImageUrl",
    p.status,
    p.language,
    json_build_object('id', u.id, 'username', u.username) AS author,
    
    -- Arabic content
    json_build_object(
        'title', COALESCE(p.title_ar, ''),
        'summary', p.summary_ar,
        'categories', COALESCE(
            (
                SELECT json_agg(
                    json_build_object(
                        'id', c.id,
                        'name', COALESCE(c.name_ar, ''),
                        'slug', c.slug
                    )
                )
                FROM post_categories pc
                JOIN categories c ON pc.category_id = c.id
                WHERE pc.post_id = p.id
            ), '[]'::json
        ),
        'tags', COALESCE(
            (
                SELECT json_agg(
                    json_build_object(
                        'id', t.id,
                        'name', COALESCE(t.name_ar, ''),
                        'slug', t.slug
                    )
                )
                FROM post_tags pt
                JOIN tags t ON pt.tag_id = t.id
                WHERE pt.post_id = p.id
            ), '[]'::json
        )
    ) AS ar,
    
    -- English content
    json_build_object(
        'title', COALESCE(p.title_en, ''),
        'summary', p.summary_en,
        'categories', COALESCE(
            (
                SELECT json_agg(
                    json_build_object(
                        'id', c.id,
                        'name', COALESCE(c.name_en, ''),
                        'slug', c.slug
                    )
                )
                FROM post_categories pc
                JOIN categories c ON pc.category_id = c.id
                WHERE pc.post_id = p.id
            ), '[]'::json
        ),
        'tags', COALESCE(
            (
                SELECT json_agg(
                    json_build_object(
                        'id', t.id,
                        'name', COALESCE(t.name_en, ''),
                        'slug', t.slug
                    )
                )
                FROM post_tags pt
                JOIN tags t ON pt.tag_id = t.id
                WHERE pt.post_id = p.id
            ), '[]'::json
        )
    ) AS en
    
FROM posts p
JOIN users u ON p.author_id = u.id
WHERE p.status = 'published'
ORDER BY p.id DESC
LIMIT $1 OFFSET $2;
    `,

    countAll: `
      SELECT COUNT(*) FROM posts WHERE status = 'published';
    `
};