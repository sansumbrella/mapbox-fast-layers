/**
 * Renders points that are separate from the Map layout, allowing them
 * to update in real-time for smooth animation.
 */
export class PointLayer {
  geometryBuffer: WebGLBuffer;
  coordinates: Float32Array;
  dirty: boolean = false;

  constructor(coordinates: number[] | Float32Array) {
    this.setCoordinates(coordinates);
  }

  onAdd(map: mapboxgl.Map, gl: WebGLRenderingContext) {
    this.geometryBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, this.geometryBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.coordinates, gl.DYNAMIC_DRAW);
  }

  onRemove(map: mapboxgl.Map, gl: WebGLRenderingContext) {
    gl.deleteBuffer(this.geometryBuffer);
  }

  prerender(gl: WebGLRenderingContext, matrix: number[]) {
    if (this.dirty) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.geometryBuffer);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.coordinates);

      this.dirty = false;
    }
  }

  render(gl: WebGLRenderingContext, matrix: number[]) {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.geometryBuffer);
    gl.drawArrays(gl.POINTS, 0, this.coordinates.length / 3);
  }

  setCoordinates(coordinates: number[] | Float32Array) {
    if (coordinates.length % 3 !== 0) {
      throw new Error("Each point must contain 3 coordinates (x, y, z).");
    }
    this.dirty = true;
    if (coordinates instanceof Float32Array) {
      this.coordinates = coordinates;
    } else {
      this.coordinates = new Float32Array(coordinates);
    }
  }
}
