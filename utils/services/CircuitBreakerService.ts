export class CircuitBreakerService {
  private failures: Map<string, number> = new Map();
  private readonly maxFailures = 3;
  private readonly resetTimeMs = 300000; // 5 minutes
  private readonly resetTimers: Map<string, NodeJS.Timeout> = new Map();

  public isOpen(fallbackType: string): boolean {
    return (this.failures.get(fallbackType) || 0) >= this.maxFailures;
  }

  public recordFailure(fallbackType: string): void {
    const currentFailures = this.failures.get(fallbackType) || 0;
    this.failures.set(fallbackType, currentFailures + 1);

    this.clearExistingTimer(fallbackType);
    this.setResetTimer(fallbackType);
  }

  public reset(fallbackType?: string): void {
    if (fallbackType) {
      this.resetSingleFailure(fallbackType);
    } else {
      this.resetAllFailures();
    }
  }

  private clearExistingTimer(fallbackType: string): void {
    const existingTimer = this.resetTimers.get(fallbackType);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }
  }

  private setResetTimer(fallbackType: string): void {
    const resetTimer = setTimeout(() => {
      this.failures.delete(fallbackType);
      this.resetTimers.delete(fallbackType);
    }, this.resetTimeMs);

    this.resetTimers.set(fallbackType, resetTimer);
  }

  private resetSingleFailure(fallbackType: string): void {
    this.failures.delete(fallbackType);
    const timer = this.resetTimers.get(fallbackType);
    if (timer) {
      clearTimeout(timer);
      this.resetTimers.delete(fallbackType);
    }
  }

  private resetAllFailures(): void {
    this.failures.clear();
    this.resetTimers.forEach(timer => clearTimeout(timer));
    this.resetTimers.clear();
  }
}