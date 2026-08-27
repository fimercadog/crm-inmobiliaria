import { Suspense } from "react";
import type { Metadata } from "next";
import { PublicContainer } from "@/components/public/public-container";
import { SectionHeading } from "@/components/public/section-heading";
import { Pagination } from "@/components/public/pagination";
import { BlogCard } from "@/features/public-blog/blog-card";
import { fetchPublicBlogPosts } from "@/lib/api/public";
import { SITE_CONFIG } from "@/constants/site";

// Needs a live backend at request time — don't prerender at build time.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Blog | ${SITE_CONFIG.name}`,
  description: "Consejos, tendencias del mercado y guías para comprar, arrendar o vender tu propiedad.",
};

export default async function BlogPage(props: PageProps<"/blog">) {
  const searchParams = await props.searchParams;
  const page = Number(searchParams.page ?? 1) || 1;

  const { items, meta } = await fetchPublicBlogPosts(page);

  return (
    <PublicContainer className="flex flex-col gap-10 py-14">
      <div className="realty-animate-fade-up">
        <SectionHeading level={1} title="Blog" description="Ideas y guías útiles para tu próxima decisión inmobiliaria." />
      </div>

      {items.length === 0 ? (
        <p className="py-10 text-center text-muted-foreground">Todavía no hay artículos publicados.</p>
      ) : (
        <div className="realty-animate-fade-up realty-animate-delay-1 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      )}

      <Suspense>
        <Pagination currentPage={meta.current_page} lastPage={meta.last_page} basePath="/blog" />
      </Suspense>
    </PublicContainer>
  );
}
