export const UPDATE_QUIRES = {
    approveProperty: `
      WITH before_update AS (
        SELECT id, is_approved as was_approved 
        FROM properties 
        WHERE id = $1
      )
      UPDATE properties 
      SET is_approved = true
      FROM before_update
      WHERE properties.id = $1
      RETURNING properties.id, before_update.was_approved
    `,
    updateProperty: `UPDATE properties SET 
  price_amount = $1,
  bedrooms = $2,
  bathrooms = $3,
  area_sqm = $4,
  listing_type = $5,
  status = $6,
  available_from = $7,
  property_type_id = $8,
  project_id = $9,
  floor = $10,
  total_floors = $11,
  min_time_to_read = $12
    WHERE id = $13`,
    updatePropertyTranslations: `
      UPDATE property_translations
      SET title = $2, description = $3, address = $4
      WHERE property_id = $1 AND language_code = $5
    `,
    updatePropertyFeatures: `
      UPDATE property_features
      SET feature_id = $2
      WHERE property_id = $1
    `,
    updatePropertyContact: `
      UPDATE contacts
      SET name = $2, email = $3, phone = $4
      WHERE property_id = $1
    `,
    updatePropertyAppropvalToFalse: `
      UPDATE properties 
      SET is_approved = false
      WHERE id = $1
    `,
    savePropertyCoverPhoto: `
    UPDATE properties 
    SET coverimageurl = $2
    WHERE id = $1
    RETURNING *
    `
}