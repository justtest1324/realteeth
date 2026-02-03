import { PlaceDetailWidget } from '@/widgets/place-detail';

interface PlacePageProps {
  params: Promise<{
    placeId: string;
  }>;
}

export default async function PlacePage({ params }: PlacePageProps) {
  const { placeId } = await params;
  return <PlaceDetailWidget placeId={placeId} />;
}

export function generateMetadata({ params }: PlacePageProps) {
  void params; // Required by Next.js signature; title is static
  return {
    title: '날씨 상세',
  };
}
