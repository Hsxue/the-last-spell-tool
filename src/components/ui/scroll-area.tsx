/**
 * Custom ScrollArea Component
 * Scrollable container with proper overflow handling for TreeView
 */

import * as React from 'react';
import { cn } from '../../lib/utils';

// Define props interface for ScrollArea
export interface ScrollAreaProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative overflow-hidden',
          className
        )}
        {...props}
      >
        <div
          className={cn(
            'h-full w-full overflow-y-auto overflow-x-hidden'
          )}
        >
          {children}
        </div>
      </div>
    );
  }
);
ScrollArea.displayName = 'ScrollArea';

// Define props interface for ScrollBar 
export interface ScrollBarProps
  extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'vertical' | 'horizontal';
}

const ScrollBar = React.forwardRef<HTMLDivElement, ScrollBarProps>(
  ({ orientation = 'vertical', className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'absolute right-0 top-0 z-[1] flex touch-none select-none transition-colors',
          'opacity-0 group-hover:opacity-100',
          orientation === 'vertical' &&
            'h-full w-2.5 border-l border-l-transparent p-px',
          className
        )}
        {...props}
      >
        <div className="flex-1 bg-border rounded-full" />
      </div>
    );
  }
);
ScrollBar.displayName = 'ScrollBar';

export { ScrollArea, ScrollBar };