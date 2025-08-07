
export interface BlogInsertQueries {
    // Main post insertion
    insertPost: string;
    
    // Content sections insertion
    insertContentSections: string;
    
    // Categories insertion (if new)
    insertCategories: string;
    
    // Tags insertion (if new)  
    insertTags: string;
    
    // Post-Category relationships
    insertPostCategories: string;
    
    // Post-Tag relationships
    insertPostTags: string;
    
    // Table of contents insertion
    insertTableOfContents: string;
    
    // FAQ items insertion
    insertFaqItems: string;
    
    // References insertion
    insertReferences: string;
    
    // Related posts insertion
    insertRelatedPosts: string;
  }