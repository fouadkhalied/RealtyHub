export interface ContentSection {
    id: number;
    post_id: number;
    section_order: number;
    heading?: string;
    body: string;
    section_type: 'text' | 'code' | 'image' | 'video' | 'quote';
    created_at: Date;
  }