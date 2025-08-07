export const READ_QUERIES = {
    getProjectsCount: `
      SELECT COUNT(DISTINCT p.id) as total
      FROM projects p
    `,
    getProjects: `
      SELECT 
        p.id, 
        p.name, 
        d.name as developer_name,
        l.country, l.governorate, l.area, l.district
      FROM projects p
      LEFT JOIN developers d ON p.developer_id = d.id
      LEFT JOIN locations l ON p.location_id = l.id
      ORDER BY p.name
      LIMIT $1
      OFFSET $2
    `,
    getPropertyTypes: `
      SELECT id, category, subtype
      FROM property_types
      ORDER BY category, subtype
    `,
    findPropertyById: `
      SELECT 
        p.price_amount,
        p.bedrooms,
        p.bathrooms,
        p.area_sqm,
        p.listing_type,
        p.coverimageurl,
        p.is_approved,
        p.status,
        p.available_from,
        json_build_object(
          'en', json_build_object(
            'title', pt_en.title,
            'address', pt_en.address,
            'description', pt_en.description
          ),
          'ar', json_build_object(
            'title', pt_ar.title,
            'address', pt_ar.address,
            'description', pt_ar.description
          )
        ) AS additional_information,
        json_build_object('name', pr.name) AS project,
        json_build_object('name', d.name) AS developer,
        json_build_object(
          'country', l.country,
          'governorate', l.governorate,
          'area', l.area,
          'district', l.district
        ) AS location,
        json_build_object(
          'category', pt.category,
          'subtype', pt.subtype
        ) AS property_type,
        json_build_object(
          'name', c.name,
          'phone', c.phone,
          'email', c.email,
          'contact_type', c.contact_type
        ) AS contact,
        COALESCE(json_agg(DISTINCT jsonb_build_object(
          'name', f.name,
          'icon', f.icon
        )) FILTER (WHERE f.id IS NOT NULL), '[]') AS features,
        COALESCE(json_agg(DISTINCT jsonb_build_object(
          'name', a.name
        )) FILTER (WHERE a.id IS NOT NULL), '[]') AS actions,
        COALESCE(json_agg(DISTINCT pp.url) FILTER (WHERE pp.id IS NOT NULL), '[]') AS photos
      FROM properties p
      LEFT JOIN projects pr ON p.project_id = pr.id
      LEFT JOIN developers d ON pr.developer_id = d.id
      LEFT JOIN locations l ON pr.location_id = l.id
      LEFT JOIN property_types pt ON p.property_type_id = pt.id
      LEFT JOIN contacts c ON p.id = c.property_id
      LEFT JOIN property_features pf ON p.id = pf.property_id
      LEFT JOIN features f ON pf.feature_id = f.id
      LEFT JOIN property_actions pa ON p.id = pa.property_id
      LEFT JOIN actions a ON pa.action_id = a.id 
      LEFT JOIN property_translations pt_en ON p.id = pt_en.property_id AND pt_en.language_code = 'en'
      LEFT JOIN property_translations pt_ar ON p.id = pt_ar.property_id AND pt_ar.language_code = 'ar'
      LEFT JOIN property_photos pp ON p.id = pp.property_id
      WHERE p.id = $1
      GROUP BY 
        p.id, pr.name, d.name, l.country, l.governorate, l.area, l.district,
        pt_en.title, pt_en.address, pt_en.description,
        pt_ar.title, pt_ar.address, pt_ar.description,
        pt.category, pt.subtype, c.name, c.phone, c.email, c.contact_type
    `,
    findAllPropertiesCount: `
      SELECT COUNT(DISTINCT p.id) as total
      FROM properties p
    `,
    findAllProperties: `
      SELECT 
        p.id,
        p.price_amount,
        p.area_sqm,
        p.bedrooms,
        p.bathrooms,
        p.listing_type,
        p.coverimageurl,
        p.is_approved,
        p.status,
        p.available_from,
        json_build_object(
          'en', json_build_object(
            'title', pt_en.title,
            'address', pt_en.address
          ),
          'ar', json_build_object(
            'title', pt_ar.title,
            'address', pt_ar.address
          )
        ) AS additional_information 
      FROM properties p
      LEFT JOIN property_translations pt_en ON p.id = pt_en.property_id AND pt_en.language_code = 'en'
      LEFT JOIN property_translations pt_ar ON p.id = pt_ar.property_id AND pt_ar.language_code = 'ar'
      GROUP BY 
        p.id, pt_en.title, pt_en.address,
        pt_ar.title, pt_ar.address
      ORDER BY p.id DESC
      LIMIT $1
      OFFSET $2
    `,
    getPropertyStatus: `
      SELECT 
        COUNT(CASE WHEN is_approved = true THEN 1 END) AS approved,
        COUNT(CASE WHEN is_approved = false THEN 1 END) AS pending,
        COUNT(*) AS total
      FROM properties
    `,
    getApprovedProperties: `
      SELECT id
      FROM properties
      WHERE is_approved = true
    `,
    getPendingProperties: `
      SELECT id
      FROM properties
      WHERE is_approved = false
    `,
    findPropertyIDandUserID: `
      SELECT 1
      FROM properties
      WHERE id = $1 AND user_id = $2
      LIMIT 1
    `,
    getPropertyFeatures: `
      SELECT f.id, f.name, f.icon
      FROM features f
      JOIN property_features pf ON f.id = pf.feature_id
      WHERE pf.property_id = $1
    `,
    getPropertyActions: `
      SELECT a.id, a.name
      FROM actions a
      JOIN property_actions pa ON a.id = pa.action_id
      WHERE pa.property_id = $1
    `,
    getPropertyContacts: `
      SELECT id, contact_type, phone, email, name
      FROM contacts
      WHERE property_id = $1
    `
  };