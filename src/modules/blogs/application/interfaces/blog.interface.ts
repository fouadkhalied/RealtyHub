
export interface CreateContentSectionRequest {
    sectionOrder: number;
    heading?: string;
    body: string;
    sectionType: 'text' | 'code' | 'image' | 'video' | 'quote';
  }
  
  export interface UpdateContentSectionRequest {
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
  
  export interface UpdateCategoryRequest {
    name?: string;
    slug?: string;
    description?: string;
  }
  
  export interface CreateTagRequest {
    name: string;
    slug?: string;
  }
  
  export interface UpdateTagRequest {
    name?: string;
    slug?: string;
  }
  
  export interface CreateTableOfContentRequest {
    heading: string;
    tocOrder: number;
  }
  
  export interface UpdateTableOfContentRequest {
    id?: number;
    heading?: string;
    tocOrder?: number;
  }
  
  export interface CreateFaqItemRequest {
    question: string;
    answer: string;
    faqOrder: number;
  }
  
  export interface UpdateFaqItemRequest {
    id?: number;
    question?: string;
    answer?: string;
    faqOrder?: number;
  }
  
  export interface CreateReferenceRequest {
    title: string;
    url: string;
  }
  
  export interface UpdateReferenceRequest {
    id?: number;
    title?: string;
    url?: string;
  }
  
  export interface CreateRelatedPostRequest {
    relatedPostTitle: string;
    relatedPostSlug: string;
    relevanceOrder: number;
  }
  
  export interface UpdateRelatedPostRequest {
    id?: number;
    relatedPostTitle?: string;
    relatedPostSlug?: string;
    relevanceOrder?: number;
  }
