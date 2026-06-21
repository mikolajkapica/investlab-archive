import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { LoginForm } from '@/features/auth/components/login-form';
import { SignUpForm } from '@/features/auth/components/signup-form';
import { IS_DEMO_ARCHIVE } from '@/features/shared/utils/constants';
import { AcceptTermsPrivacy } from '@/features/auth/components/accept-terms-privacy';

export const Route = createFileRoute('/_auth/signup')({
  component: RouteComponent,
  validateSearch: z.object({
    error: z.string().optional(),
  }),
});

function RouteComponent() {
  const { error } = Route.useSearch();
  return (
    <>
      {IS_DEMO_ARCHIVE ? <LoginForm /> : <SignUpForm pageError={error} />}
      <AcceptTermsPrivacy />
    </>
  );
}
