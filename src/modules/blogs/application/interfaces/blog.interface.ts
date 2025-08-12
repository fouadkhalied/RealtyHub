
export interface CreateContentSectionRequest {
    sectionOrder: number;
    heading?: string;
    body: string;
    sectionType: 'text' | 'code' | 'image' | 'video' | 'quote';
  }
  
  export interface ContentSectionUpdatePayload {
    id?: number;
    sectionOrder?: number;
    heading?: string;
    body?: string;
    sectionType?: 'text' | 'code' | 'image' | 'video' | 'quote';
  }
  
  export interface CreateCategoryRequest {
    name: string;
    slug?: string;
    description?: string;
  }
  
  export interface CategoryUpdatePayload {
    id?: number;
    name?: string;
    slug?: string;
    description?: string;
  }
  
  export interface CreateTagRequest {
    name: string;
    slug?: string;
  }
  
  export interface TagUpdatePayload {
    id?: number;
    name?: string;
    slug?: string;
  }
  
  export interface CreateTableOfContentRequest {
    heading: string;
    tocOrder: number;
  }
  
  export interface TableOfContentUpdatePayload {
    id?: number;
    heading?: string;
    tocOrder?: number;
  }
  
  export interface CreateFaqItemRequest {
    question: string;
    answer: string;
    faqOrder: number;
  }
  
  export interface FaqItemUpdatePayload {
    id?: number;
    question?: string;
    answer?: string;
    faqOrder?: number;
  }
  
  export interface CreateReferenceRequest {
    title: string;
    url: string;
  }
  
  export interface ReferenceUpdatePayload {
    id?: number;
    title?: string;
    url?: string;
  }
  
  export interface CreateRelatedPostRequest {
    relatedPostTitle: string;
    relatedPostSlug: string;
    relevanceOrder: number;
  }
  
  export interface RelatedPostUpdatePayload {
    id?: number;
    relatedPostTitle?: string;
    relatedPostSlug?: string;
    relevanceOrder?: number;
  }

// Update-part discriminators
export type UpdatePartType = 'tag' | 'content_section' | 'category' | 'table_of_contents' | 'related_post';