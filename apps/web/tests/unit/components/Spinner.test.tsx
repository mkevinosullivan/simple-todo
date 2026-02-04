import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Spinner } from '../../../src/components/Spinner';

describe('Spinner', () => {
  it('renders with default medium size and white color', () => {
    const { container } = render(<Spinner />);
    const spinner = container.querySelector('[role="status"]');

    expect(spinner).toBeInTheDocument();
    // CSS Modules hash class names, so we check class attribute contains the unhashed names
    expect(spinner?.className).toContain('medium');
    expect(spinner?.className).toContain('white');
  });

  it('renders with small size', () => {
    const { container } = render(<Spinner size="small" />);
    const spinner = container.querySelector('[role="status"]');

    expect(spinner?.className).toContain('small');
  });

  it('renders with large size', () => {
    const { container } = render(<Spinner size="large" />);
    const spinner = container.querySelector('[role="status"]');

    expect(spinner?.className).toContain('large');
  });

  it('renders with primary color', () => {
    const { container } = render(<Spinner color="primary" />);
    const spinner = container.querySelector('[role="status"]');

    expect(spinner?.className).toContain('primary');
  });

  it('has proper ARIA attributes for accessibility', () => {
    const { container } = render(<Spinner />);
    const spinner = container.querySelector('[role="status"]');

    expect(spinner).toHaveAttribute('role', 'status');
    expect(spinner).toHaveAttribute('aria-label', 'Loading');
  });

  it('contains screen reader only text', () => {
    const { container } = render(<Spinner />);
    const srText = container.querySelector('.sr-only');

    expect(srText).toBeInTheDocument();
    expect(srText).toHaveTextContent('Loading...');
  });
});
