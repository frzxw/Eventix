import { EventCardSkeleton } from './EventCardSkeleton';

interface EventGridSkeletonProps {
  count?: number;
}

export function EventGridSkeleton({ count = 8 }: EventGridSkeletonProps) {
  const skeletons = Array.from({ length: count });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {skeletons.map((_, index) => (
        <EventCardSkeleton key={index} />
      ))}
    </div>
  );
}
