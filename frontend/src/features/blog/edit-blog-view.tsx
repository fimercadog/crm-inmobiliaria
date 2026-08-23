"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import NextImage from "next/image";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { BlogForm, blogPostToFormValues } from "@/features/blog/blog-form";
import { fetchBlogPost, updateBlogPost, uploadBlogPostCoverImage } from "@/features/blog/api";
import { usePermissions } from "@/hooks/use-permissions";
import { ApiError } from "@/types/api";
import type { BlogPost } from "@/types/blog";
import type { BlogFormOutput } from "@/features/blog/blog-form-schema";

export function EditBlogView() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const postId = Number(params.id);
  const { canWrite } = usePermissions();

  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let ignore = false;

    fetchBlogPost(postId)
      .then((data) => {
        if (!ignore) setPost(data);
      })
      .catch((err: unknown) => {
        if (!ignore) setError(err instanceof ApiError ? err.message : "No fue posible cargar el artículo");
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [postId, retryToken]);

  function handleRetry() {
    setIsLoading(true);
    setError(null);
    setRetryToken((token) => token + 1);
  }

  async function handleSubmit(values: BlogFormOutput) {
    try {
      await updateBlogPost(postId, values);
      toast.success("Artículo actualizado correctamente");
      router.push("/blog");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No fue posible actualizar el artículo");
    }
  }

  async function handleCoverImageSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setIsUploading(true);
    try {
      const updated = await uploadBlogPostCoverImage(postId, file);
      setPost(updated);
      toast.success("Imagen de portada actualizada");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No fue posible cargar la imagen");
    } finally {
      setIsUploading(false);
    }
  }

  if (isLoading) {
    return <LoadingState rows={8} />;
  }

  if (error || !post) {
    return <ErrorState description={error ?? undefined} onRetry={handleRetry} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <CardTitle>Portada</CardTitle>
          {canWrite && (
            <>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverImageSelected} />
              <Button size="sm" variant="outline" disabled={isUploading} onClick={() => fileInputRef.current?.click()}>
                {isUploading ? <Loader2 className="animate-spin" /> : <Upload />}
                {post.cover_image ? "Cambiar imagen" : "Subir imagen"}
              </Button>
            </>
          )}
        </CardHeader>
        <CardContent>
          {post.cover_image ? (
            <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-lg border">
              <NextImage src={post.cover_image} alt={post.title} fill className="object-cover" sizes="400px" />
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Este artículo todavía no tiene imagen de portada.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <BlogForm defaultValues={blogPostToFormValues(post)} onSubmit={handleSubmit} submitLabel="Guardar cambios" />
        </CardContent>
      </Card>
    </div>
  );
}
