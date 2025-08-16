export const READ_QUERIES = {
    findPostForAdmin:`
    SELECT FROM posts
    WHERE id = $1 and author_id = $2
    `,
    findById: `
      SELECT 
    p.id,
    p.slug,
    p.title_ar as "titleAr",
    p.title_en as "titleEn",
    p.summary_ar as "summaryAr",
    p.summary_en as "summaryEn",
    p.featured_image_url AS "featuredImageUrl",
    p.status,
    p.min_time_to_read AS "minTimeToRead",
    json_build_object('id', u.id, 'username', u.username) AS author,
    
    -- Arabic content
    json_build_object(
        'contentSections', COALESCE(
            (
                SELECT json_agg(
                    json_build_object(
                        'id', cs.id,
                        'sectionOrder', cs.section_order,
                        'heading', cs.heading_ar,
                        'body', cs.body_ar,
                        'sectionType', cs.section_type,
                        'faqItems', COALESCE(
                            (
                                SELECT json_agg(
                                    json_build_object(
                                        'id', fi.id,
                                        'question', fi.question_ar,
                                        'answer', fi.answer_ar,
                                        'faqOrder', fi.faq_order
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
        'tableOfContents', COALESCE(
            (
                SELECT json_agg(
                    json_build_object(
                        'id', toc.id,
                        'heading', toc.heading_ar,
                        'tocOrder', toc.toc_order
                    )
                )
                FROM table_of_contents toc
                WHERE toc.post_id = p.id
            ), '[]'::json
        ),
        'relatedPosts', COALESCE(
            (
                SELECT json_agg(
                    json_build_object(
                        'id', rp.id,
                        'relatedPostTitle', rp.related_post_title_ar,
                        'relatedPostSlug', rp.related_post_slug,
                        'relevanceOrder', rp.relevance_order
                    )
                )
                FROM related_posts rp
                WHERE rp.post_id = p.id
            ), '[]'::json
        )
    ) AS ar,
    
    -- English content
    json_build_object(
        'contentSections', COALESCE(
            (
                SELECT json_agg(
                    json_build_object(
                        'id', cs.id,
                        'sectionOrder', cs.section_order,
                        'heading', cs.heading_en,
                        'body', cs.body_en,
                        'sectionType', cs.section_type,
                        'faqItems', COALESCE(
                            (
                                SELECT json_agg(
                                    json_build_object(
                                        'id', fi.id,
                                        'question', fi.question_en,
                                        'answer', fi.answer_en,
                                        'faqOrder', fi.faq_order
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
        'tableOfContents', COALESCE(
            (
                SELECT json_agg(
                    json_build_object(
                        'id', toc.id,
                        'heading', toc.heading_en,
                        'tocOrder', toc.toc_order
                    )
                )
                FROM table_of_contents toc
                WHERE toc.post_id = p.id
            ), '[]'::json
        ),
        'relatedPosts', COALESCE(
            (
                SELECT json_agg(
                    json_build_object(
                        'id', rp.id,
                        'relatedPostTitle', rp.related_post_title_en,
                        'relatedPostSlug', rp.related_post_slug,
                        'relevanceOrder', rp.relevance_order
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
                        'sectionOrder', cs.section_order,
                        'heading', cs.heading,
                        'body', cs.body,
                        'sectionType', cs.section_type,
                        'faqItems', COALESCE(
                            (
                                SELECT json_agg(
                                    json_build_object(
                                        'id', fi.id,
                                        'question', fi.question,
                                        'answer', fi.answer,
                                        'faqOrder', fi.faq_order
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
        ) AS "contentSections",
        COALESCE(
            (
                SELECT json_agg(
                    json_build_object(
                        'id', toc.id,
                        'heading', toc.heading,
                        'tocOrder', toc.toc_order
                    )
                )
                FROM table_of_contents toc
                WHERE toc.post_id = p.id
            ), '[]'::json
        ) AS "tableOfContents",
        COALESCE(
            (
                SELECT json_agg(
                    json_build_object(
                        'id', rp.id,
                        'relatedPostTitle', rp.related_post_title,
                        'relatedPostSlug', rp.related_post_slug,
                        'relevanceOrder', rp.relevance_order
                    )
                )
                FROM related_posts rp
                WHERE rp.post_id = p.id
            ), '[]'::json
        ) AS "relatedPosts"
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
    p.min_time_to_read AS "minTimeToRead",
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