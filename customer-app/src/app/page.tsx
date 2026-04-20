import { redirect } from 'next/navigation';

/**
 * Root of customer-app.
 * In production: QR codes point directly to /<outletSlug>
 * This root route just redirects to a demo or shows a scanner prompt.
 */
export default function Home() {
  // When accessed without a slug, show a placeholder.
  // In practice, QR codes always point to /[outletSlug] directly.
  redirect('/demo'); // will 404 gracefully — QR codes never hit this
}
