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

  title: Joi.string().min(1).max(500).required(),

  summary: Joi.string().max(1000).optional(),

  featuredImageUrl: Joi.string().uri().optional(),

  status: Joi.string().valid(...Object.values(PostStatus)).optional(),

  publishedAt: Joi.string().isoDate().optional(),

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
});
