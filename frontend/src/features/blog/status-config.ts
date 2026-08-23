import type { StatusConfig } from "@/components/shared/status-badge";
import { BLOG_POST_STATUS_LABELS, type BlogPostStatusValue } from "@/types/blog";

export const BLOG_POST_STATUS_CONFIG: Record<BlogPostStatusValue, StatusConfig> = {
  borrador: { label: BLOG_POST_STATUS_LABELS.borrador, tone: "outline" },
  publicado: { label: BLOG_POST_STATUS_LABELS.publicado, tone: "success" },
};
