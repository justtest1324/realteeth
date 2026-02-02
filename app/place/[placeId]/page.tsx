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
  return {
    title: '날씨 상세',
  };
}
