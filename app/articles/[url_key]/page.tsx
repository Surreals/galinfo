import { redirect } from 'next/navigation';

interface ArticleRedirectProps {
  params: Promise<{
    url_key: string;
  }>;
}

export default async function ArticleRedirect({ params }: ArticleRedirectProps) {
  const { url_key } = await params;
  
  // Redirect from /articles/[url_key] to /news/[url_key]
  redirect(`/news/${url_key}`);
}
