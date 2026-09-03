import { Link } from 'react-router-dom';
import Seo from '../../components/seo/Seo';

export default function NotFoundPage() {
  return (
    <>
      <Seo
        title="Page Not Found"
        description="The requested Abron Shop page could not be found."
        canonical={false}
        noindex
      />
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-ink mb-2">Page Not Found</h1>
        <p className="text-ink-muted mb-6">
          The page you requested does not exist or has moved.
        </p>
        <Link to="/" className="text-ink underline">
          Back to Abron Shop
        </Link>
      </div>
    </>
  );
}
