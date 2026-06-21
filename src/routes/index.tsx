import { createFileRoute } from '@tanstack/react-router';
import { useEffect } from 'react';
import { z } from 'zod';
import { LandingPage } from '@/routes/-components/landing-page';
import { IS_DEMO_ARCHIVE } from '@/features/shared/utils/constants';
import { Dashboard } from '@/routes/-components/dashboard';
import { DashboardPending } from '@/routes/-components/dashboard-pending';
import { syncLanguage } from '@/features/shared/queries/update-language';
import {
  investorsMeAccountValueRetrieveOptions,
  statisticsAssetAllocationRetrieveOptions,
  statisticsCurrentAccountValueRetrieveOptions,
  statisticsOwnedSharesListOptions,
  statisticsStatsRetrieveOptions,
} from '@/client/@tanstack/react-query.gen';

export const Route = createFileRoute('/')({
  validateSearch: z.object({
    initial_session: z.boolean().optional(),
    landing: z.boolean().optional(),
  }),
  loader: async ({ context: { i18n, auth, queryClient } }) => {
    if (auth.isSignedIn) {
      try {
        await Promise.all([
          queryClient.ensureQueryData(statisticsStatsRetrieveOptions()),
          queryClient.ensureQueryData(
            statisticsCurrentAccountValueRetrieveOptions()
          ),
          queryClient.ensureQueryData(
            statisticsAssetAllocationRetrieveOptions({
              query: { instruments_number: 4 },
            })
          ),
          queryClient.ensureQueryData(investorsMeAccountValueRetrieveOptions()),
          queryClient.ensureQueryData(statisticsOwnedSharesListOptions()),
        ]);
      } catch {}
    }

    return {
      crumb: i18n.t('common.dashboard'),
    };
  },
  pendingComponent: DashboardPending,
  component: RouteComponent,
});

function RouteComponent() {
  const { auth, isLoggedInBefore } = Route.useRouteContext();

  const { initial_session, landing } = Route.useSearch();

  useEffect(() => {
    if (!initial_session) return;
    void syncLanguage();
  }, [initial_session]);

  if (IS_DEMO_ARCHIVE && landing) {
    return <LandingPage />;
  }

  if (!auth.isLoaded && isLoggedInBefore) {
    return <Dashboard />;
  }

  return auth.isSignedIn ? <Dashboard /> : <LandingPage />;
}
