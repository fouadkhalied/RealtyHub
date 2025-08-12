import { CreateCategoryRequest, CreateContentSectionRequest, CreateFaqItemRequest, CreateReferenceRequest, CreateRelatedPostRequest, CreateTableOfContentRequest, CreateTagRequest } from "../../interfaces/blog.interface";

export interface CreatePostRequest {
    slug: string;
    titleAr: string;
    titleEn: string;
    summaryAr?: string;
    summaryEn?: string;
    featuredImageUrl?: string;
    status?: 'draft' | 'published';
    published_at?: string;
    ar: {
        contentSections: CreateContentSectionRequest[];
        categories: CreateCategoryRequest[];
        tags: CreateTagRequest[];
        tableOfContents: CreateTableOfContentRequest[];
        faqItems: CreateFaqItemRequest[];
        relatedPosts: CreateRelatedPostRequest[];
    };
    en: {
        contentSections: CreateContentSectionRequest[];
        categories: CreateCategoryRequest[];
        tags: CreateTagRequest[];
        tableOfContents: CreateTableOfContentRequest[];
        faqItems: CreateFaqItemRequest[];
        relatedPosts: CreateRelatedPostRequest[];
    };
}