import HamburgerMenu from '@/components/HamburgerMenu';

export default function HomePageSkeleton() {
  return (
    <>
      <header className="site-header">
        <HamburgerMenu />
      </header>

      <main className="top-page">
        {/* Hero Section - show immediately */}
        <section className="hero">
          <div className="hero__bg">
            <div className="skeleton-image hero__img hero__img--sp" style={{ width: '100%', height: '100vh' }} />
          </div>
          <div className="hero__overlay"></div>
          <div className="hero__content">
            <div className="hero__title gsap-hero">
              <div className="skeleton-text" style={{ width: '300px', height: '60px', margin: '0 auto' }} />
            </div>
          </div>
          <div className="hero__scroll-indicator">
            <span></span>
          </div>
        </section>

        {/* Philosophy Section Skeleton */}
        <section className="philosophy">
          <div className="philosophy__inner">
            <div className="philosophy__image">
              <div className="skeleton-image" style={{ width: '100%', aspectRatio: '4/3' }} />
            </div>
            <div className="philosophy__text">
              <div className="skeleton-text" style={{ width: '200px', height: '32px', marginBottom: '1rem' }} />
              <div className="skeleton-text" style={{ width: '100%', height: '120px' }} />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
