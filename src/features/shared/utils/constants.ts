export const THIS_URL = import.meta.env.VITE_THIS_URL;

export const IS_PROD = import.meta.env.PROD;

export const IS_DEMO_ARCHIVE = import.meta.env.VITE_DEMO_ARCHIVE === 'true';

export const CLERK_PUBLIC_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!IS_DEMO_ARCHIVE && !CLERK_PUBLIC_KEY) {
  throw new Error('Missing Clerk Publishable Key');
}

export const POSTHOG_KEY = import.meta.env.VITE_PUBLIC_POSTHOG_KEY;
if (!IS_DEMO_ARCHIVE && !POSTHOG_KEY) {
  throw new Error('VITE_PUBLIC_POSTHOG_KEY is not defined');
}

export const POSTHOG_HOST = import.meta.env.VITE_PUBLIC_POSTHOG_HOST;
if (!IS_DEMO_ARCHIVE && !POSTHOG_HOST) {
  throw new Error('VITE_PUBLIC_POSTHOG_HOST is not defined');
}

export const LANDING_IMGS_BASE_URL =
  import.meta.env.VITE_LANDING_IMGS_BASE_URL ||
  (IS_DEMO_ARCHIVE ? '/landing' : undefined);
if (!IS_DEMO_ARCHIVE && !LANDING_IMGS_BASE_URL) {
  throw new Error('VITE_LANDING_IMGS_BASE_URL is not defined');
}
