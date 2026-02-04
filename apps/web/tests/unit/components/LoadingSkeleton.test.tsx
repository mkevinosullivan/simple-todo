import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { LoadingSkeleton } from '../../../src/components/LoadingSkeleton';

describe('LoadingSkeleton', () => {
  it('renders default number of skeleton items (3)', () => {
    const { container } = render(<LoadingSkeleton />);
    const skeletons = container.querySelectorAll('[class*="skeleton"]');

    // Should render 3 skeleton cards by default
    expect(skeletons.length).toBeGreaterThanOrEqual(3);
  });

  it('renders specified number of skeleton items', () => {
    const { container } = render(<LoadingSkeleton count={5} />);
    const skeletons = container.querySelectorAll('[class*="skeleton"]');

    // Should render 5 skeleton cards
    expect(skeletons.length).toBeGreaterThanOrEqual(5);
  });

  it('renders with aria-hidden attribute for accessibility', () => {
    const { container } = render(<LoadingSkeleton count={1} />);
    const skeleton = container.querySelector('[aria-hidden="true"]');

    expect(skeleton).toBeInTheDocument();
  });

  it('renders skeleton header with dot and line', () => {
    const { container } = render(<LoadingSkeleton count={1} />);

    const skeletonHeader = container.querySelector('[class*="skeletonHeader"]');
    const skeletonDot = container.querySelector('[class*="skeletonDot"]');
    const skeletonLine = container.querySelector('[class*="skeletonLine"]');

    expect(skeletonHeader).toBeInTheDocument();
    expect(skeletonDot).toBeInTheDocument();
    expect(skeletonLine).toBeInTheDocument();
  });

  it('renders short line for secondary content', () => {
    const { container } = render(<LoadingSkeleton count={1} />);
    const skeletonLineShort = container.querySelector('[class*="skeletonLineShort"]');

    expect(skeletonLineShort).toBeInTheDocument();
  });
});
