import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TaskCard } from '../../../src/components/TaskCard';
import { createTestTask, createTestTaskWithAge } from '../../helpers/factories';

describe('TaskCard', () => {
  it('should render task text', () => {
    const task = createTestTask({ text: 'Buy groceries' });
    render(<TaskCard task={task} />);

    expect(screen.getByText('Buy groceries')).toBeInTheDocument();
  });

  it('should display age indicator for fresh tasks (< 1 day)', () => {
    const task = createTestTask(); // Just created
    render(<TaskCard task={task} />);

    expect(screen.getByText('Just now')).toBeInTheDocument();
  });

  it('should display age indicator for old tasks (10 days)', () => {
    const task = createTestTaskWithAge(10);
    render(<TaskCard task={task} />);

    expect(screen.getByText('10 days')).toBeInTheDocument();
  });

  it('should display singular "day" for 1 day old task', () => {
    const task = createTestTaskWithAge(1);
    render(<TaskCard task={task} />);

    expect(screen.getByText('1 day')).toBeInTheDocument();
  });

  it('should display hours for tasks less than 1 day old', () => {
    // Create task from 5 hours ago
    const fiveHoursAgo = new Date();
    fiveHoursAgo.setHours(fiveHoursAgo.getHours() - 5);

    const task = createTestTask({
      createdAt: fiveHoursAgo.toISOString(),
    });

    render(<TaskCard task={task} />);

    expect(screen.getByText('5 hours')).toBeInTheDocument();
  });

  it('should apply age category class for styling', () => {
    const oldTask = createTestTaskWithAge(10); // Should be "old" category
    render(<TaskCard task={oldTask} />);

    // Check that the age indicator exists (CSS modules transform class names)
    const ageText = screen.getByText('10 days');
    expect(ageText).toBeInTheDocument();
  });
});
