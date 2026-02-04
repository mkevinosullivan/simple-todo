import type React from 'react';

import styles from './LoadingSkeleton.module.css';

interface LoadingSkeletonProps {
  count?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ count = 3 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={styles.skeleton} aria-hidden="true">
          <div className={styles.skeletonHeader}>
            <div className={styles.skeletonDot} />
            <div className={styles.skeletonLine} />
          </div>
          <div className={styles.skeletonLineShort} />
        </div>
      ))}
    </>
  );
};
