export const Dashboard_READ = { 
  totalPostsQuery : `
    SELECT COUNT(*) as count 
    FROM posts 
  `,
  approvedPropertiesQuery : `
    SELECT COUNT(*) as count 
    FROM properties 
    WHERE is_approved = true
  `,
  rejectedPropertiesQuery : `
    SELECT COUNT(*) as count 
    FROM properties 
    WHERE is_approved = false
  `,
  totalUsersQuery : `
    SELECT COUNT(*) as count 
    FROM users
  `
}