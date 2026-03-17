/**
 * Performance monitoring utilities
 */

interface Metrics {
  fps: number | null;
  renderTime: number | null;
  memory?: MemoryInfo;
}

interface MemoryInfo {
  used: number;
  total: number;
}

class PerformanceMonitorService {
  private animationFrameId: number | null = null;
  private lastTimestamp: number = 0;
  private frameCount: number = 0;
  private fps: number | null = null;
  private renderTime: number | null = null;
  private isActive: boolean = false;

  constructor() {
    this.setupKeyboardListener();
  }

  private setupKeyboardListener(): void {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'p') {
        // Toggle overlay visibility (implementation will depend on actual DOM element)
        const overlay = document.getElementById('perf-overlay');
        if (overlay) {
          overlay.style.display = overlay.style.display === 'none' ? 'block' : 'none';
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeyDown);
    }
  }

  public startMonitoring(): void {
    if (this.isActive) {
      return;
    }

    this.isActive = true;
    this.lastTimestamp = performance.now();
    this.frameCount = 0;
    this.fps = null;
    this.renderTime = null;

    this.animateLoop();
  }

  private animateLoop = (): void => {
    if (!this.isActive) return;

    const now = performance.now();
    
    // Calculate render time for last frame
    this.renderTime = now - this.lastTimestamp;
    
    // Calculate FPS every second
    this.frameCount++;
    if (now >= this.lastTimestamp + 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (now - this.lastTimestamp));
      this.frameCount = 0;
      this.lastTimestamp = now;
      
      console.log(`Render time: ${Math.round(this.renderTime)}ms, FPS: ${this.fps}`);
    }

    this.animationFrameId = requestAnimationFrame(this.animateLoop);
  };

  public stopMonitoring(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.isActive = false;
  }

  public getMetrics(): Metrics {
    let memoryInfo: MemoryInfo | undefined;
    
    if (typeof performance !== 'undefined') {
      // @ts-expect-error: memory API exists in some browsers but not typed by default
      const mem = performance.memory as { usedJSHeapSize: number; totalJSHeapSize: number } | undefined;
      if (mem) {
        memoryInfo = {
          used: mem.usedJSHeapSize,
          total: mem.totalJSHeapSize
        };
      }
    }

    return {
      fps: this.fps,
      renderTime: this.renderTime,
      ...(memoryInfo && { memory: memoryInfo })
    };
  }
}

const performanceMonitor = new PerformanceMonitorService();

/**
 * Start performance monitoring
 * Tracks FPS, render time, and memory usage in development environment
 */
export function startMonitoring(): void {
  performanceMonitor.startMonitoring();
}

/**
 * Stop performance monitoring
 */
export function stopMonitoring(): void {
  performanceMonitor.stopMonitoring();
}

/**
 * Get current performance metrics
 */
export function getMetrics(): Metrics {
  return performanceMonitor.getMetrics();
}

/**
 * React component for performance overlay
 * Displays FPS indicator and can be toggled with P key
 */
export function PerformanceMonitor(): null {
  // Always enabled for performance monitoring

  // Create overlay element if it doesn't exist
  if (typeof window !== 'undefined' && !document.getElementById('perf-overlay')) {
    const overlay = document.createElement('div');
    overlay.id = 'perf-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 10px;
      left: 10px;
      z-index: 9999;
      background-color: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 10px;
      font-family: monospace;
      font-size: 14px;
      border-radius: 4px;
      pointer-events: none;
    `;
    document.body.appendChild(overlay);

    // Monitor metrics and update display
    const updateDisplay = () => {
      const metrics = getMetrics();
      overlay.textContent = 
        `FPS: ${metrics.fps ?? '--'} | ` +
        `Render: ${metrics.renderTime ? Math.round(metrics.renderTime) + 'ms' : '--'}`;

      requestAnimationFrame(updateDisplay);
    };
    
    // Start monitoring and update display
    startMonitoring();
    requestAnimationFrame(() => setTimeout(updateDisplay, 0));
  }

  return null;
}