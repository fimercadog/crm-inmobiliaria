"use client";

import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { blogFormSchema, type BlogFormInput, type BlogFormOutput } from "@/features/blog/blog-form-schema";
import { BLOG_POST_STATUS_LABELS, BLOG_POST_STATUSES, type BlogPost } from "@/types/blog";

interface BlogFormProps {
  defaultValues?: Partial<BlogFormInput>;
  onSubmit: SubmitHandler<BlogFormOutput>;
  submitLabel?: string;
}

export function blogPostToFormValues(post: BlogPost): Partial<BlogFormInput> {
  return {
    title: post.title,
    excerpt: post.excerpt ?? undefined,
    content: post.content,
    status: post.status,
    meta_title: post.meta_title ?? undefined,
    meta_description: post.meta_description ?? undefined,
  };
}

export function BlogForm({ defaultValues, onSubmit, submitLabel = "Guardar" }: BlogFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<BlogFormInput, unknown, BlogFormOutput>({
    resolver: zodResolver(blogFormSchema),
    defaultValues: { status: "borrador", ...defaultValues },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-8">
      <FieldSet>
        <FieldLegend>Contenido</FieldLegend>
        <FieldGroup>
          <Field data-invalid={errors.title ? "true" : undefined}>
            <FieldLabel htmlFor="title">Título</FieldLabel>
            <Input id="title" {...register("title")} />
            <FieldError errors={errors.title ? [errors.title] : undefined} />
          </Field>

          <Field data-invalid={errors.excerpt ? "true" : undefined}>
            <FieldLabel htmlFor="excerpt">Extracto</FieldLabel>
            <Textarea id="excerpt" rows={2} {...register("excerpt")} />
            <FieldError errors={errors.excerpt ? [errors.excerpt] : undefined} />
          </Field>

          <Field data-invalid={errors.content ? "true" : undefined}>
            <FieldLabel htmlFor="content">Contenido</FieldLabel>
            <Textarea id="content" rows={12} {...register("content")} />
            <FieldError errors={errors.content ? [errors.content] : undefined} />
          </Field>

          <Field data-invalid={errors.status ? "true" : undefined}>
            <FieldLabel htmlFor="status">Estado</FieldLabel>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                  <SelectTrigger id="status" className="w-full sm:w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BLOG_POST_STATUSES.map((option) => (
                      <SelectItem key={option} value={option}>
                        {BLOG_POST_STATUS_LABELS[option]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={errors.status ? [errors.status] : undefined} />
          </Field>
        </FieldGroup>
      </FieldSet>

      <FieldSet>
        <FieldLegend>SEO</FieldLegend>
        <FieldGroup>
          <Field data-invalid={errors.meta_title ? "true" : undefined}>
            <FieldLabel htmlFor="meta_title">Meta título</FieldLabel>
            <Input id="meta_title" {...register("meta_title")} />
            <FieldError errors={errors.meta_title ? [errors.meta_title] : undefined} />
          </Field>

          <Field data-invalid={errors.meta_description ? "true" : undefined}>
            <FieldLabel htmlFor="meta_description">Meta descripción</FieldLabel>
            <Textarea id="meta_description" rows={2} {...register("meta_description")} />
            <FieldError errors={errors.meta_description ? [errors.meta_description] : undefined} />
          </Field>
        </FieldGroup>
      </FieldSet>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
