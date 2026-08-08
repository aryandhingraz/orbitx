import '../styles/components/skeletonPulse.css';

export function SkeletonPulse({ width = '100px', height = '24px' }) {
  return <span className="skeleton-pulse" style={{ width, height }} />;
}
