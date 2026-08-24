import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PublicContainer } from "@/components/public/public-container";
import { fetchPublicBlogPostBySlug } from "@/lib/api/public";
import { SITE_CONFIG } from "@/constants/site";

export async function generateMetadata(props: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const post = await fetchPublicBlogPostBySlug(slug);

  if (!post) {
    return { title: `Artículo no encontrado | ${SITE_CONFIG.name}` };
  }

  const title = post.meta_title ?? `${post.title} | ${SITE_CONFIG.name}`;
  const description = post.meta_description ?? post.excerpt ?? undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: post.cover_image ? [{ url: post.cover_image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: post.cover_image ? [post.cover_image] : undefined,
    },
  };
}

export default async function BlogPostPage(props: PageProps<"/blog/[slug]">) {
  const { slug } = await props.params;
  const post = await fetchPublicBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <PublicContainer className="flex flex-col gap-8 py-14">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 text-center">
        {post.published_at && (
          <p className="text-sm text-muted-foreground uppercase">
            {new Date(post.published_at).toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" })}
            {post.author && ` · Por ${post.author}`}
          </p>
        )}
        <h1 className="font-(family-name:--font-display) text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {post.title}
        </h1>
      </div>

      {post.cover_image && (
        <div className="relative mx-auto aspect-16/9 w-full max-w-4xl overflow-hidden rounded-2xl bg-muted">
          <Image src={post.cover_image} alt={post.title} fill priority className="object-cover" sizes="(min-width: 1024px) 896px, 100vw" />
        </div>
      )}

      <div className="mx-auto w-full max-w-3xl whitespace-pre-line text-muted-foreground">{post.content}</div>
    </PublicContainer>
  );
}
