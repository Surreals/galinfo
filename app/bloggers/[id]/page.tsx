import { redirect } from 'next/navigation';

interface BloggersRedirectProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function BloggersRedirect({ params }: BloggersRedirectProps) {
  const { id } = await params;
  
  // Redirect from /bloggers/[id] to /news/[id]
  redirect(`/news/${id}`);
}
