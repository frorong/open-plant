export interface ViewState {
  offsetX: number;
  offsetY: number;
  zoom: number;
}

export class OrthoCamera {
  private viewportWidth = 1;
  private viewportHeight = 1;

  private viewState: ViewState = {
    offsetX: 0,
    offsetY: 0,
    zoom: 1,
  };

  setViewport(width: number, height: number): void {
    this.viewportWidth = Math.max(1, width);
    this.viewportHeight = Math.max(1, height);
  }

  getViewportSize(): { width: number; height: number } {
    return {
      width: this.viewportWidth,
      height: this.viewportHeight,
    };
  }

  setViewState(next: Partial<ViewState>): void {
    if (next.offsetX !== undefined) {
      this.viewState.offsetX = next.offsetX;
    }

    if (next.offsetY !== undefined) {
      this.viewState.offsetY = next.offsetY;
    }

    if (next.zoom !== undefined) {
      this.viewState.zoom = Math.max(0.0001, next.zoom);
    }
  }

  getViewState(): ViewState {
    return { ...this.viewState };
  }

  getMatrix(): Float32Array {
    const viewWidth = this.viewportWidth / this.viewState.zoom;
    const viewHeight = this.viewportHeight / this.viewState.zoom;

    const sx = 2 / viewWidth;
    const sy = -2 / viewHeight;
    const tx = -1 - this.viewState.offsetX * sx;
    const ty = 1 - this.viewState.offsetY * sy;

    return new Float32Array([
      sx,
      0,
      0,
      0,
      sy,
      0,
      tx,
      ty,
      1,
    ]);
  }
}
