import { CreateCategoryRequest, CreateContentSectionRequest, CreateFaqItemRequest, CreateReferenceRequest, CreateRelatedPostRequest, CreateTableOfContentRequest, CreateTagRequest } from "../../interfaces/blog.interface";

export interface CreatePostRequest {
    slug: string;
    title: string;
    summary?: string;
    featuredImageUrl?: string;
    status?: 'draft' | 'published';
    published_at?: string;
    contentSections: CreateContentSectionRequest[];
    categories: CreateCategoryRequest[];
    tags: CreateTagRequest[];
    tableOfContents: CreateTableOfContentRequest[];
    faqItems: CreateFaqItemRequest[];
    relatedPosts: CreateRelatedPostRequest[];
}

