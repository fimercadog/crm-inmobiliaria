"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { RequireWrite } from "@/features/auth/require-write";
import { BlogForm } from "@/features/blog/blog-form";
import { createBlogPost } from "@/features/blog/api";
import { ApiError } from "@/types/api";
import type { BlogFormOutput } from "@/features/blog/blog-form-schema";

export default function NewBlogPostPage() {
  const router = useRouter();

  async function handleSubmit(values: BlogFormOutput) {
    try {
      const post = await createBlogPost(values);
      toast.success("Artículo creado correctamente");
      router.push(`/blog-posts/${post.id}/edit`);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "No fue posible crear el artículo");
    }
  }

  return (
    <RequireWrite>
      <PageContainer>
        <PageHeader
          title="Nuevo artículo"
          description="Completa el contenido del artículo."
          breadcrumbs={[
            { title: "Dashboard", href: "/dashboard" },
            { title: "Blog", href: "/blog-posts" },
            { title: "Nuevo" },
          ]}
        />
        <Card>
          <CardContent className="pt-6">
            <BlogForm onSubmit={handleSubmit} submitLabel="Crear artículo" />
          </CardContent>
        </Card>
      </PageContainer>
    </RequireWrite>
  );
}
