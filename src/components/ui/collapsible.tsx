/**
 * Collapsible Component
 * Expandable/collapsible section with controlled open state
 */

import * as React from 'react';
import { cn } from '../../lib/utils';

// Define context interface to pass open state down to child components
interface CollapsibleContextProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const CollapsibleContext = React.createContext<CollapsibleContextProps | null>(null);

// Props interface for Collapsible main container
export interface CollapsibleProps
  extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const Collapsible = React.forwardRef<HTMLDivElement, CollapsibleProps>(
  ({ className, open, onOpenChange, children, ...props }, ref) => {
    const [internalOpen, setInternalOpen] = React.useState(open ?? false);
    
    const effectiveOpen = open !== undefined ? open : internalOpen;

    const handleSetOpen = React.useCallback((newOpen: boolean) => {
      if (open === undefined) {
        setInternalOpen(newOpen);
      }
      onOpenChange?.(newOpen);
    }, [open, onOpenChange]);

    return (
      <CollapsibleContext.Provider value={{ open: effectiveOpen, setOpen: handleSetOpen }}>
        <div
          ref={ref}
          className={cn(
            'overflow-hidden transition-all duration-200 ease-in-out',
            className
          )}
          style={{
            maxHeight: effectiveOpen ? '1000px' : '0',
            opacity: effectiveOpen ? 1 : 0,
          }}
          {...props}
        >
          {children}
        </div>
      </CollapsibleContext.Provider>
    );
  }
);
Collapsible.displayName = 'Collapsible';

// Props interface for Collapsible Trigger
export interface CollapsibleTriggerProps
  extends React.HTMLAttributes<HTMLButtonElement> {}

const CollapsibleTrigger = React.forwardRef<
  HTMLButtonElement,
  CollapsibleTriggerProps
>(({ className, onClick, children, ...props }, ref) => {
  const context = React.useContext(CollapsibleContext);
  if (!context) {
    throw new Error('CollapsibleTrigger must be used within a Collapsible');
  }
  
  const { open, setOpen } = context;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    setOpen(!open); // Toggle open state when clicked
  };

  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        'flex items-center gap-2 font-medium',
        'bg-transparent border-none text-left cursor-pointer py-2',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded',
        className
      )}
      aria-expanded={open}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
});
CollapsibleTrigger.displayName = 'CollapsibleTrigger';

// Props interface for Collapsible Content
export interface CollapsibleContentProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const CollapsibleContent = React.forwardRef<
  HTMLDivElement,
  CollapsibleContentProps
>(({ className, children, ...props }, ref) => {
  const context = React.useContext(CollapsibleContext);
  if (!context) {
    throw new Error('CollapsibleContent must be used within a Collapsible');
  }

  return (
    <div
      ref={ref}
      className={cn(
        'pt-2 border-t border-border mt-2 transition-all duration-200 ease-in-out',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
CollapsibleContent.displayName = 'CollapsibleContent';

export { Collapsible, CollapsibleTrigger, CollapsibleContent };