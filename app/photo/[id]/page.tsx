import { redirect } from 'next/navigation';

interface PhotoRedirectProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PhotoRedirect({ params }: PhotoRedirectProps) {
  const { id } = await params;
  
  // Redirect from /photo/[id] to /news/[id]
  redirect(`/news/${id}`);
}
