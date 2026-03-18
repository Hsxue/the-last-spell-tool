/**
 * Base UI Components
 * TileMapEditor Web - Slider Component
 */

import * as React from 'react';
import { cn } from '../../lib/utils';

export interface SliderProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, min, max, step, value, onChange, ...props }, ref) => {
    return (
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        className={cn(
          'w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700',
          'accent-primary',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Slider.displayName = 'Slider';

export { Slider };