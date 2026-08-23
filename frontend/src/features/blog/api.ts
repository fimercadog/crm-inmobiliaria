import { api } from "@/lib/api/axios";
import type { ApiSuccessResponse } from "@/types/api";
import type { BlogPost, BlogPostFormValues } from "@/types/blog";

export async function createBlogPost(values: BlogPostFormValues): Promise<BlogPost> {
  const response = await api.post<ApiSuccessResponse<BlogPost>>("/blog-posts", values);
  return response.data.data;
}

export async function updateBlogPost(id: number, values: BlogPostFormValues): Promise<BlogPost> {
  const response = await api.put<ApiSuccessResponse<BlogPost>>(`/blog-posts/${id}`, values);
  return response.data.data;
}

export async function deleteBlogPost(id: number): Promise<void> {
  await api.delete(`/blog-posts/${id}`);
}

export async function fetchBlogPost(id: number): Promise<BlogPost> {
  const response = await api.get<ApiSuccessResponse<BlogPost>>(`/blog-posts/${id}`);
  return response.data.data;
}

export async function uploadBlogPostCoverImage(id: number, file: File): Promise<BlogPost> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post<ApiSuccessResponse<BlogPost>>(`/blog-posts/${id}/cover-image`, formData);
  return response.data.data;
}
