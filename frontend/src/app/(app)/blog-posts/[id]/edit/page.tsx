import { Suspense } from "react";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { RequireWrite } from "@/features/auth/require-write";
import { EditBlogView } from "@/features/blog/edit-blog-view";

export default function EditBlogPostPage() {
  return (
    <RequireWrite>
      <PageContainer>
        <PageHeader
          title="Editar artículo"
          breadcrumbs={[
            { title: "Dashboard", href: "/dashboard" },
            { title: "Blog", href: "/blog-posts" },
            { title: "Editar" },
          ]}
        />
        <Suspense fallback={<LoadingState rows={8} />}>
          <EditBlogView />
        </Suspense>
      </PageContainer>
    </RequireWrite>
  );
}
