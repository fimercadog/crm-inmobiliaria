import { Suspense } from "react";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { BlogTable } from "@/features/blog/blog-table";

export default function BlogPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Blog"
        description="Administra los artículos publicados en el sitio web."
        breadcrumbs={[{ title: "Dashboard", href: "/dashboard" }, { title: "Blog" }]}
      />
      <Suspense fallback={<LoadingState />}>
        <BlogTable />
      </Suspense>
    </PageContainer>
  );
}
