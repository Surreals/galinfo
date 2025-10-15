import { redirect } from 'next/navigation';

interface VideoRedirectProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function VideoRedirect({ params }: VideoRedirectProps) {
  const { id } = await params;
  
  // Redirect from /video/[id] to /news/[id]
  redirect(`/news/${id}`);
}
