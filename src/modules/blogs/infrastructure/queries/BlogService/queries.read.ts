export const READ_QUEIRES = {
    findById : `SELECT 
    p.slug,
    p.title,
    p.summary,
    p.featured_image_url AS featuredImageUrl,
    p.status,
    json_build_object('id', u.id, 'username', u.username) AS author,
    COALESCE(
        (SELECT json_agg(
            json_build_object(
                'id', c.id,
                'name', c.name,
                'slug', c.slug
            )
        )
        FROM post_categories pc
        JOIN categories c ON pc.category_id = c.id
        WHERE pc.post_id = p.id
        ), '[]'::json
    ) AS categories,
    COALESCE(
        (SELECT json_agg(
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
    ) AS tags
FROM posts p
JOIN users u ON p.author_id = u.id
WHERE p.status = 'published' and p.id = $1`,
    findAll : `
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
                    'slug', c.slug
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
    ) AS tags
FROM posts p
JOIN users u ON p.author_id = u.id
WHERE p.status = 'published'
ORDER BY p.id DESC
LIMIT $1 OFFSET $2;
`,
    countAll : `
    SELECT COUNT(*) FROM posts`
}
