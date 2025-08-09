export const DELETE_QUIRES = {
    deleteProperty: `
      DELETE FROM properties
      WHERE id = $1
      RETURNING id;
    `,
    deleteFeaturesFromProperty: `
    DELETE FROM property_features
    WHERE property_id = $1
    `
}