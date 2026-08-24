import Image from "next/image";
import Link from "next/link";
import { SAMPLE_PROPERTY_IMAGE } from "@/constants/images";
import type { PublicBlogPostSummary } from "@/types/public";

export function BlogCard({ post }: { post: PublicBlogPostSummary }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-16/10 w-full overflow-hidden bg-muted">
        <Image
          src={post.cover_image ?? SAMPLE_PROPERTY_IMAGE}
          alt={post.cover_image ? post.title : "Interior moderno de propiedad"}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        />
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        {post.published_at && (
          <p className="text-xs text-muted-foreground uppercase">
            {new Date(post.published_at).toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        )}
        <h3 className="font-(family-name:--font-display) line-clamp-2 text-lg font-semibold">{post.title}</h3>
        {post.excerpt && <p className="line-clamp-3 text-sm text-muted-foreground">{post.excerpt}</p>}
        {post.author && <p className="mt-auto pt-2 text-xs text-muted-foreground">Por {post.author}</p>}
      </div>
    </Link>
  );
}
