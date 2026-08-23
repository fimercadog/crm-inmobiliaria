import { z } from "zod";
import { BLOG_POST_STATUSES } from "@/types/blog";

export const blogFormSchema = z
  .object({
    title: z.string().min(1, "El título es obligatorio").max(255),
    excerpt: z.string().max(500).optional(),
    content: z.string().min(1, "El contenido es obligatorio"),
    status: z.enum(BLOG_POST_STATUSES, { message: "Selecciona un estado" }),
    meta_title: z.string().max(255).optional(),
    meta_description: z.string().max(500).optional(),
  })
  .transform(({ status, ...rest }) => ({
    ...rest,
    status,
    published_at: status === "publicado" ? new Date().toISOString() : null,
  }));

export type BlogFormSchema = z.infer<typeof blogFormSchema>;
export type BlogFormInput = z.input<typeof blogFormSchema>;
export type BlogFormOutput = z.output<typeof blogFormSchema>;
