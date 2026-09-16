import { redirect } from 'next/navigation';

export default function PortalPage({ params }: { params: { locale: string } }) {
  redirect(`/${params.locale || 'en'}/login`);
}
