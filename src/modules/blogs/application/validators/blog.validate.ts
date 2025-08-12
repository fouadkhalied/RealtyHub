import Joi from "joi";
import { PostStatus } from "../../domain/enum/postStatus.enum";
import { SectionType } from "../../domain/enum/sectionType.enum";

export const validatePostCreation = Joi.object({
  slug: Joi.string()
    .regex(/^[a-z0-9-]+$/)
    .min(1)
    .max(255)
    .required()
    .messages({
      'string.pattern.base': 'Slug must contain only lowercase letters, numbers, and hyphens',
    }),

  title_ar: Joi.string().min(1).max(500).required(),
  title_en: Joi.string().min(1).max(500).required(),

  summary_ar: Joi.string().max(1000).optional(),
  summary_en: Joi.string().max(1000).optional(),

  featuredImageUrl: Joi.string().uri().optional(),

  status: Joi.string().valid(...Object.values(PostStatus)).optional(),

  publishedAt: Joi.string().isoDate().optional(),

  ar: Joi.object({
    contentSections: Joi.array().items(
      Joi.object({
        sectionOrder: Joi.number().integer().min(1).required(),
        heading: Joi.string().max(500).optional(),
        body: Joi.string().min(1).required(),
        sectionType: Joi.string().valid(...Object.values(SectionType)).required()
      })
    ).min(1).required(),

    categories: Joi.array().items(
      Joi.object({
        name: Joi.string().min(1).max(255).required(),
        slug: Joi.string()
          .regex(/^[a-z0-9-]+$/)
          .min(1)
          .max(255)
          .required()
          .messages({
            'string.pattern.base': 'Category slug must contain only lowercase letters, numbers, and hyphens',
          }),
        description: Joi.string().max(1000).optional()
      })
    ).min(1).required(),

    tags: Joi.array().items(
      Joi.object({
        name: Joi.string().min(1).max(255).required(),
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
        heading: Joi.string().min(1).max(500).optional(),
        tocOrder: Joi.number().integer().min(1).optional()
      })
    ).optional(),

    faqItems: Joi.array().items(
      Joi.object({
        question: Joi.string().min(1).max(1000).optional(),
        answer: Joi.string().min(1).optional(),
        faqOrder: Joi.number().integer().min(1).optional()
      })
    ).optional(),

    relatedPosts: Joi.array().items(
      Joi.object({
        relatedPostTitle: Joi.string().min(1).max(500).optional(),
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
        heading: Joi.string().max(500).optional(),
        body: Joi.string().min(1).required(),
        sectionType: Joi.string().valid(...Object.values(SectionType)).required()
      })
    ).min(1).required(),

    categories: Joi.array().items(
      Joi.object({
        name: Joi.string().min(1).max(255).required(),
        slug: Joi.string()
          .regex(/^[a-z0-9-]+$/)
          .min(1)
          .max(255)
          .required()
          .messages({
            'string.pattern.base': 'Category slug must contain only lowercase letters, numbers, and hyphens',
          }),
        description: Joi.string().max(1000).optional()
      })
    ).min(1).required(),

    tags: Joi.array().items(
      Joi.object({
        name: Joi.string().min(1).max(255).required(),
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
        heading: Joi.string().min(1).max(500).optional(),
        tocOrder: Joi.number().integer().min(1).optional()
      })
    ).optional(),

    faqItems: Joi.array().items(
      Joi.object({
        question: Joi.string().min(1).max(1000).optional(),
        answer: Joi.string().min(1).optional(),
        faqOrder: Joi.number().integer().min(1).optional()
      })
    ).optional(),

    relatedPosts: Joi.array().items(
      Joi.object({
        relatedPostTitle: Joi.string().min(1).max(500).optional(),
        relatedPostSlug: Joi.string().regex(/^[a-z0-9-]+$/).optional()
          .messages({
            'string.pattern.base': 'Related post slug must contain only lowercase letters, numbers, and hyphens',
          }),
        relevanceOrder: Joi.number().integer().min(1).optional()
      })
    ).optional()
  }).required()
});

export const validateUpdateTagPayload = Joi.array().items(
  Joi.object({
    id: Joi.number().integer().required(),
    name: Joi.string().min(1).max(255).required(),
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

// Updated validation for content sections - now array format
export const validateUpdateContentSectionPayload = Joi.array().items(
  Joi.object({
    id: Joi.number().integer().required(),
    sectionOrder: Joi.number().integer().min(1).required(),
    heading: Joi.string().max(500).required(),
    body: Joi.string().min(1).required(),
    sectionType: Joi.string().valid(...Object.values(SectionType)).required()
  })
);

// Updated validation for categories - now array format with required id
export const validateUpdateCategoryPayload = Joi.array().items(
  Joi.object({
    id: Joi.number().integer().required(),
    name: Joi.string().min(1).max(255).required(),
    slug: Joi.string()
      .regex(/^[a-z0-9-]+$/)
      .min(1)
      .max(255)
      .required()
      .messages({
        'string.pattern.base': 'Category slug must contain only lowercase letters, numbers, and hyphens',
      }),
    description: Joi.string().max(1000).required()
  })
);

// Updated validation for table of contents - now array format with required fields
export const validateUpdateTableOfContentPayload = Joi.array().items(
  Joi.object({
    id: Joi.number().integer().required(),
    heading: Joi.string().min(1).max(500).required(),
    tocOrder: Joi.number().integer().min(1).required()
  })
);

// Updated validation for FAQ items - new array format
export const validateUpdateFaqItemPayload = Joi.array().items(
  Joi.object({
    id: Joi.number().integer().required(),
    question: Joi.string().min(1).max(1000).required(),
    answer: Joi.string().min(1).required(),
    faqOrder: Joi.number().integer().min(1).required()
  })
);

// Updated validation for related posts - now array format with required fields
export const validateUpdateRelatedPostPayload = Joi.array().items(
  Joi.object({
    id: Joi.number().integer().required(),
    relatedPostTitle: Joi.string().min(1).max(500).required(),
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
