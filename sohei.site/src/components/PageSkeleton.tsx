import HamburgerMenu from './HamburgerMenu';

interface PageSkeletonProps {
  title: string;
}

export default function PageSkeleton({ title }: PageSkeletonProps) {
  return (
    <>
      <header className="site-header">
        <HamburgerMenu />
      </header>

      {/* Hero */}
      <div className="page-hero">
        <div className="page-hero__image">
          <div className="skeleton-image" style={{ width: '100%', height: '100%' }} />
        </div>
        <div className="page-hero__overlay"></div>
        <h1 className="page-hero__title">{title}</h1>
      </div>

      <div className="page-content">
        <main>
          <section className="page-section">
            <div className="skeleton-text" style={{ width: '200px', height: '32px', margin: '0 auto 2rem' }} />
            <div className="skeleton-text" style={{ width: '100%', height: '200px' }} />
          </section>
        </main>
      </div>
    </>
  );
}
