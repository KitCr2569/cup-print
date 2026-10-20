const MAX_HISTORY_ENTRIES = 60;

export type HistoryState = {
  canUndo: boolean;
  canRedo: boolean;
};

/**
 * Snapshot stack for the design canvas. Stores serialized canvas JSON so the
 * editor can restore previous states without keeping live object references.
 */
export class EditorHistory {
  private entries: string[] = [];
  private index = -1;
  private isRestoring = false;

  push(snapshot: string): void {
    if (this.isRestoring) return;
    if (this.entries[this.index] === snapshot) return;
    this.entries = this.entries.slice(0, this.index + 1);
    this.entries.push(snapshot);
    if (this.entries.length > MAX_HISTORY_ENTRIES) this.entries.shift();
    this.index = this.entries.length - 1;
  }

  state(): HistoryState {
    return {
      canUndo: this.index > 0,
      canRedo: this.index < this.entries.length - 1,
    };
  }

  undo(): string | null {
    return this.step(-1);
  }

  redo(): string | null {
    return this.step(1);
  }

  beginRestore(): void {
    this.isRestoring = true;
  }

  endRestore(): void {
    this.isRestoring = false;
  }

  clear(): void {
    this.entries = [];
    this.index = -1;
  }

  private step(delta: number): string | null {
    const next = this.index + delta;
    if (next < 0 || next >= this.entries.length) return null;
    this.index = next;
    return this.entries[next];
  }
}
