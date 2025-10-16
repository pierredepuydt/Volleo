'use client';

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function TournamentSkeleton() {
  return (
    <Card className="h-full overflow-hidden rounded-2xl">
      {/* Image skeleton */}
      <Skeleton className="h-48 w-full rounded-none" />
      
      <CardHeader className="pb-3 pt-5">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </CardHeader>

      <CardContent className="space-y-3 pb-4">
        <div className="flex items-center">
          <Skeleton className="h-10 w-10 rounded-lg mr-3" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex items-center">
          <Skeleton className="h-10 w-10 rounded-lg mr-3" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex items-center">
          <Skeleton className="h-10 w-10 rounded-lg mr-3" />
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="pt-3 border-t">
          <Skeleton className="h-3 w-40" />
        </div>
      </CardContent>

      <CardFooter className="pt-0 pb-5">
        <Skeleton className="h-12 w-full rounded-xl" />
      </CardFooter>
    </Card>
  );
}

export function TournamentSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <TournamentSkeleton key={index} />
      ))}
    </div>
  );
}

