export interface TimeEngineOptions {
  fixedFps?: number;
}

/**
 * TimeEngine - Manages timed functions and provides delta time updates
 *
 * Handles registration of functions that need to be called repeatedly with delta time
 * and provides start/stop functionality for the timing loop.
 */
export class TimeEngine {
  private functions: ((deltaTime: number) => void)[] = [];
  private fixedFunctions: ((fixedDeltaTime: number) => void)[] = [];
  private isRunning = false;
  private lastTime = 0;
  private animationFrameId: number | null = null;

  // Fixed timestep properties
  private fixedTimeStep: number;
  private fixedAccumulator = 0;

  constructor(options: TimeEngineOptions = {}) {
    this.fixedTimeStep = 1000 / (options.fixedFps || 60); // Default 60 FPS
  }

  /**
   * Adds a function to be called on each update with deltaTime
   * @param func - Function that receives deltaTime as parameter
   */
  add(func: (deltaTime: number) => void): void {
    this.functions.push(func);
  }

  /**
   * Removes a function from the update loop
   * @param func - Function to remove
   */
  remove(func: (deltaTime: number) => void): void {
    const index = this.functions.indexOf(func);
    if (index > -1) {
      this.functions.splice(index, 1);
    }
  }

  /**
   * Adds a function to be called at fixed intervals
   * @param func - Function that receives fixed deltaTime as parameter
   */
  addFixed(func: (fixedDeltaTime: number) => void): void {
    this.fixedFunctions.push(func);
  }

  /**
   * Removes a function from the fixed timestep update loop
   * @param func - Function to remove
   */
  removeFixed(func: (fixedDeltaTime: number) => void): void {
    const index = this.fixedFunctions.indexOf(func);
    if (index > -1) {
      this.fixedFunctions.splice(index, 1);
    }
  }

  /**
   * Starts the time engine update loop
   */
  start(): void {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.lastTime = performance.now();
    this.updateLoop();
  }

  /**
   * Stops the time engine update loop
   */
  stop(): void {
    this.isRunning = false;

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Gets the current running state of the engine
   * @returns True if the engine is currently running
   */
  getIsRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Gets the number of registered functions
   * @returns Number of functions in the update loop
   */
  getFunctionCount(): number {
    return this.functions.length;
  }

  /**
   * Gets the number of registered fixed timestep functions
   * @returns Number of fixed functions in the update loop
   */
  getFixedFunctionCount(): number {
    return this.fixedFunctions.length;
  }

  /**
   * Gets the current fixed timestep in milliseconds
   * @returns Fixed timestep duration in milliseconds
   */
  getFixedTimeStep(): number {
    return this.fixedTimeStep;
  }

  /**
   * Clears all registered functions (both variable and fixed timestep)
   */
  clear(): void {
    this.functions = [];
    this.fixedFunctions = [];
    this.fixedAccumulator = 0;
  }

  /**
   * Internal update loop that calculates delta time and calls registered functions
   */
  private updateLoop = (): void => {
    if (!this.isRunning) {
      return;
    }

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    // Call all variable timestep functions with actual deltaTime
    for (const func of this.functions) {
      try {
        func(deltaTime);
      } catch (error) {
        console.warn("Error in TimeEngine function:", error);
      }
    }

    // Handle fixed timestep functions with accumulator pattern
    this.fixedAccumulator += deltaTime;

    while (this.fixedAccumulator >= this.fixedTimeStep) {
      // Call all fixed timestep functions with fixed deltaTime
      for (const func of this.fixedFunctions) {
        try {
          func(this.fixedTimeStep);
        } catch (error) {
          console.warn("Error in TimeEngine fixed function:", error);
        }
      }

      this.fixedAccumulator -= this.fixedTimeStep;
    }

    // Schedule next frame
    this.animationFrameId = requestAnimationFrame(this.updateLoop);
  };
}
