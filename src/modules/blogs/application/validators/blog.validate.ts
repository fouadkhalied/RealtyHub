import Joi from "joi";
import { PostStatus } from "../../domain/enum/postStatus.enum";
import { SectionType } from "../../domain/enum/sectionType.enum";

// Helper function to check if text contains Arabic characters
const containsArabic = (text: string): boolean => {
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return arabicRegex.test(text);
};

// Helper function to check if text contains English characters (Latin script)
const containsEnglish = (text: string): boolean => {
  const englishRegex = /[A-Za-z]/;
  return englishRegex.test(text);
};

// Custom Joi validation for Arabic text
const arabicText = Joi.string().custom((value: string, helpers: Joi.CustomHelpers) => {
  if (!containsArabic(value)) {
    return helpers.message('Text must contain Arabic characters' as any);
  }
  return value;
});

// Custom Joi validation for English text
const englishText = Joi.string().custom((value: string, helpers: Joi.CustomHelpers) => {
  if (!containsEnglish(value)) {
    return helpers.message('Text must contain English characters' as any);
  }
  return value;
});

// Alternative: More flexible validation that allows mixed content but requires primary language
const arabicPrimaryText = Joi.string().custom((value: string, helpers: Joi.CustomHelpers) => {
  const arabicCharCount = (value.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g) || []).length;
  const totalCharCount = value.replace(/\s/g, '').length; // excluding spaces
  
  if (totalCharCount === 0) return value; // Allow empty strings if optional
  
  // At least 30% of non-space characters should be Arabic
  if (arabicCharCount / totalCharCount < 0.3) {
    return helpers.message('Text must be primarily in Arabic (at least 30% Arabic characters)' as any);
  }
  return value;
});

const englishPrimaryText = Joi.string().custom((value: string, helpers: Joi.CustomHelpers) => {
  const englishCharCount = (value.match(/[A-Za-z]/g) || []).length;
  const totalCharCount = value.replace(/\s/g, '').length; // excluding spaces
  
  if (totalCharCount === 0) return value; // Allow empty strings if optional
  
  // At least 30% of non-space characters should be English
  if (englishCharCount / totalCharCount < 0.3) {
    return helpers.message('Text must be primarily in English (at least 30% English characters)' as any);
  }
  return value;
});

export const validatePostCreation = Joi.object({
  slug: Joi.string()
    .regex(/^[a-z0-9-]+$/)
    .min(1)
    .max(255)
    .required()
    .messages({
      'string.pattern.base': 'Slug must contain only lowercase letters, numbers, and hyphens',
    }),

  // Use Arabic validation for Arabic titles
  titleAr: arabicText.min(1).max(500).required(),
  // Use English validation for English titles  
  titleEn: englishText.min(1).max(500).required(),

  // Optional summaries with language validation
  summaryAr: arabicPrimaryText.max(1000).optional().allow(''),
  summaryEn: englishPrimaryText.max(1000).optional().allow(''),

  featuredImageUrl: Joi.string().uri().optional(),

  status: Joi.string().valid(...Object.values(PostStatus)).optional(),

  publishedAt: Joi.string().isoDate().optional(),

  minTimeToRead : Joi.number().required(),

  ar: Joi.object({
    contentSections: Joi.array().items(
      Joi.object({
        sectionOrder: Joi.number().integer().min(1).required(),
        heading: arabicPrimaryText.max(500).optional().allow(''),
        body: arabicPrimaryText.min(1).required(),
        sectionType: Joi.string().valid(...Object.values(SectionType)).required()
      })
    ).min(1).required(),

    categories: Joi.array().items(
      Joi.object({
        name: arabicText.min(1).max(255).required(),
        slug: Joi.string()
          .regex(/^[a-z0-9-]+$/)
          .min(1)
          .max(255)
          .required()
          .messages({
            'string.pattern.base': 'Category slug must contain only lowercase letters, numbers, and hyphens',
          }),
        description: arabicPrimaryText.max(1000).optional().allow('')
      })
    ).min(1).required(),

    tags: Joi.array().items(
      Joi.object({
        name: arabicText.min(1).max(255).required(),
        slug: Joi.string()
          .regex(/^[a-z0-9-]+$/)
          .min(1)
          .max(255)
          .required()
          .messages({
            'string.pattern.base': 'Tag slug must contain only lowercase letters, numbers, and hyphens',
          })
      })
    ).min(1).required(),

    tableOfContents: Joi.array().items(
      Joi.object({
        heading: arabicPrimaryText.min(1).max(500).optional(),
        tocOrder: Joi.number().integer().min(1).optional()
      })
    ).optional(),

    faqItems: Joi.array().items(
      Joi.object({
        question: arabicPrimaryText.min(1).max(1000).optional(),
        answer: arabicPrimaryText.min(1).optional(),
        faqOrder: Joi.number().integer().min(1).optional()
      })
    ).optional(),

    relatedPosts: Joi.array().items(
      Joi.object({
        relatedPostTitle: arabicPrimaryText.min(1).max(500).optional(),
        relatedPostSlug: Joi.string().regex(/^[a-z0-9-]+$/).optional()
          .messages({
            'string.pattern.base': 'Related post slug must contain only lowercase letters, numbers, and hyphens',
          }),
        relevanceOrder: Joi.number().integer().min(1).optional()
      })
    ).optional()
  }).required(),

  en: Joi.object({
    contentSections: Joi.array().items(
      Joi.object({
        sectionOrder: Joi.number().integer().min(1).required(),
        heading: englishPrimaryText.max(500).optional().allow(''),
        body: englishPrimaryText.min(1).required(),
        sectionType: Joi.string().valid(...Object.values(SectionType)).required()
      })
    ).min(1).required(),

    categories: Joi.array().items(
      Joi.object({
        name: englishText.min(1).max(255).required(),
        slug: Joi.string()
          .regex(/^[a-z0-9-]+$/)
          .min(1)
          .max(255)
          .required()
          .messages({
            'string.pattern.base': 'Category slug must contain only lowercase letters, numbers, and hyphens',
          }),
        description: englishPrimaryText.max(1000).optional().allow('')
      })
    ).min(1).required(),

    tags: Joi.array().items(
      Joi.object({
        name: englishText.min(1).max(255).required(),
        slug: Joi.string()
          .regex(/^[a-z0-9-]+$/)
          .min(1)
          .max(255)
          .required()
          .messages({
            'string.pattern.base': 'Tag slug must contain only lowercase letters, numbers, and hyphens',
          })
      })
    ).min(1).required(),

    tableOfContents: Joi.array().items(
      Joi.object({
        heading: englishPrimaryText.min(1).max(500).optional(),
        tocOrder: Joi.number().integer().min(1).optional()
      })
    ).optional(),

    faqItems: Joi.array().items(
      Joi.object({
        question: englishPrimaryText.min(1).max(1000).optional(),
        answer: englishPrimaryText.min(1).optional(),
        faqOrder: Joi.number().integer().min(1).optional()
      })
    ).optional(),

    relatedPosts: Joi.array().items(
      Joi.object({
        relatedPostTitle: englishPrimaryText.min(1).max(500).optional(),
        relatedPostSlug: Joi.string().regex(/^[a-z0-9-]+$/).optional()
          .messages({
            'string.pattern.base': 'Related post slug must contain only lowercase letters, numbers, and hyphens',
          }),
        relevanceOrder: Joi.number().integer().min(1).optional()
      })
    ).optional()
  }).required()
});

// Arabic validation schemas
export const validateUpdateTagPayloadAr = Joi.array().items(
  Joi.object({
    id: Joi.number().integer().required(),
    name: arabicText.min(1).max(255).required(),
    slug: Joi.string()
      .regex(/^[a-z0-9-]+$/)
      .min(1)
      .max(255)
      .required()
      .messages({
        'string.pattern.base': 'Tag slug must contain only lowercase letters, numbers, and hyphens',
      })
  })
);

export const validateUpdateContentSectionPayloadAr = Joi.array().items(
  Joi.object({
    id: Joi.number().integer().required(),
    sectionOrder: Joi.number().integer().min(1).required(),
    heading: arabicPrimaryText.max(500).required(),
    body: arabicPrimaryText.min(1).required(),
    sectionType: Joi.string().valid(...Object.values(SectionType)).required()
  })
);

export const validateUpdateCategoryPayloadAr = Joi.array().items(
  Joi.object({
    id: Joi.number().integer().required(),
    name: arabicText.min(1).max(255).required(),
    slug: Joi.string()
      .regex(/^[a-z0-9-]+$/)
      .min(1)
      .max(255)
      .required()
      .messages({
        'string.pattern.base': 'Category slug must contain only lowercase letters, numbers, and hyphens',
      }),
    description: arabicPrimaryText.max(1000).required()
  })
);

export const validateUpdateTableOfContentPayloadAr = Joi.array().items(
  Joi.object({
    id: Joi.number().integer().required(),
    heading: arabicPrimaryText.min(1).max(500).required(),
    tocOrder: Joi.number().integer().min(1).required()
  })
);

export const validateUpdateFaqItemPayloadAr = Joi.array().items(
  Joi.object({
    id: Joi.number().integer().required(),
    question: arabicPrimaryText.min(1).max(1000).required(),
    answer: arabicPrimaryText.min(1).required(),
    faqOrder: Joi.number().integer().min(1).required()
  })
);

export const validateUpdateRelatedPostPayloadAr = Joi.array().items(
  Joi.object({
    id: Joi.number().integer().required(),
    relatedPostTitle: arabicPrimaryText.min(1).max(500).required(),
    relatedPostSlug: Joi.string()
      .regex(/^[a-z0-9-]+$/)
      .min(1)
      .max(255)
      .required()
      .messages({
        'string.pattern.base': 'Related post slug must contain only lowercase letters, numbers, and hyphens',
      }),
    relevanceOrder: Joi.number().integer().min(1).required()
  })
);

// English validation schemas
export const validateUpdateTagPayloadEn = Joi.array().items(
  Joi.object({
    id: Joi.number().integer().required(),
    name: englishText.min(1).max(255).required(),
    slug: Joi.string()
      .regex(/^[a-z0-9-]+$/)
      .min(1)
      .max(255)
      .required()
      .messages({
        'string.pattern.base': 'Tag slug must contain only lowercase letters, numbers, and hyphens',
      })
  })
);

export const validateUpdateContentSectionPayloadEn = Joi.array().items(
  Joi.object({
    id: Joi.number().integer().required(),
    sectionOrder: Joi.number().integer().min(1).required(),
    heading: englishPrimaryText.max(500).required(),
    body: englishPrimaryText.min(1).required(),
    sectionType: Joi.string().valid(...Object.values(SectionType)).required()
  })
);

export const validateUpdateCategoryPayloadEn = Joi.array().items(
  Joi.object({
    id: Joi.number().integer().required(),
    name: englishText.min(1).max(255).required(),
    slug: Joi.string()
      .regex(/^[a-z0-9-]+$/)
      .min(1)
      .max(255)
      .required()
      .messages({
        'string.pattern.base': 'Category slug must contain only lowercase letters, numbers, and hyphens',
      }),
    description: englishPrimaryText.max(1000).required()
  })
);

export const validateUpdateTableOfContentPayloadEn = Joi.array().items(
  Joi.object({
    id: Joi.number().integer().required(),
    heading: englishPrimaryText.min(1).max(500).required(),
    tocOrder: Joi.number().integer().min(1).required()
  })
);

export const validateUpdateFaqItemPayloadEn = Joi.array().items(
  Joi.object({
    id: Joi.number().integer().required(),
    question: englishPrimaryText.min(1).max(1000).required(),
    answer: englishPrimaryText.min(1).required(),
    faqOrder: Joi.number().integer().min(1).required()
  })
);

export const validateUpdateRelatedPostPayloadEn = Joi.array().items(
  Joi.object({
    id: Joi.number().integer().required(),
    relatedPostTitle: englishPrimaryText.min(1).max(500).required(),
    relatedPostSlug: Joi.string()
      .regex(/^[a-z0-9-]+$/)
      .min(1)
      .max(255)
      .required()
      .messages({
        'string.pattern.base': 'Related post slug must contain only lowercase letters, numbers, and hyphens',
      }),
    relevanceOrder: Joi.number().integer().min(1).required()
  })
);

// Export helper functions for use elsewhere
export { 
  containsArabic, 
  containsEnglish, 
  arabicText, 
  englishText, 
  arabicPrimaryText, 
  englishPrimaryText 
};