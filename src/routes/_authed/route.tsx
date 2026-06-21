import { Outlet, createFileRoute, redirect } from '@tanstack/react-router';
import { IS_DEMO_ARCHIVE } from '@/features/shared/utils/constants';

export const Route = createFileRoute('/_authed')({
  beforeLoad: ({ context: { isLoggedInBefore } }) => {
    if (!IS_DEMO_ARCHIVE && !isLoggedInBefore) {
      throw redirect({ to: '/' });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { auth, isLoggedInBefore } = Route.useRouteContext();

  if (!auth.isLoaded && isLoggedInBefore) {
    return <Outlet />;
  }

  if (!IS_DEMO_ARCHIVE && !auth.isSignedIn) {
    throw redirect({ to: '/' });
  }

  return <Outlet />;
}
