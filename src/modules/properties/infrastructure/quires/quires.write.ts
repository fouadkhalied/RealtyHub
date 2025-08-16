export const WRITE_QUERIES = {
  createProperty: `
  INSERT INTO properties (
    price_amount, bedrooms, bathrooms, area_sqm, listing_type, status,
    available_from, property_type_id, project_id, user_id,
    floor, total_floors
  ) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
    $11, $12
  )
  RETURNING id
`,
    createPropertyTranslations: `
      INSERT INTO property_translations (property_id, language_code, title, description, address)
      VALUES ($1, $2, $3, $4, $5)
    `,
    createPropertyFeatures: `
      INSERT INTO property_features (property_id, feature_id)
      VALUES ($1, $2)
    `,
    createContact: `
      INSERT INTO contacts (property_id, name, email, phone)
      VALUES ($1, $2, $3, $4)
    `,
    addFeaturesToProperty: `
      INSERT INTO property_features (property_id, feature_id)
      VALUES ($1, $2)
    `,
    savePropertyPhotos: `
      INSERT INTO property_photos (property_id, url)
      SELECT $1, unnest($2::text[])
      RETURNING *
    `
  };