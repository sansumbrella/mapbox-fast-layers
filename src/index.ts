import mapboxgl from "mapbox-gl";

/**
 * Renders points that are separate from the Map layout, allowing them
 * to update in real-time for smooth animation.
 *
 * TODO: consider using regl or another GL abstraction library
 */
export class PointLayer {
  geometryBuffer: WebGLBuffer;
  coordinates: Float32Array;
  program: WebGLProgram;
  shaderSource: [string, string];
  dirty: boolean = false;

  constructor(
    coordinates: number[] | Float32Array,
    vs: string = PointLayer.defaultVertexShader(),
    fs: string = PointLayer.defaultFragmentShader()
  ) {
    this.setCoordinates(coordinates);
    this.setShaderSource(vs, fs);
  }

  static defaultVertexShader() {
    return `uniform mat4 u_matrix;
    attribute vec3 a_position;
    attribute vec3 a_color;
    varying vec3 v_color;
    void main() {
        gl_Position = u_matrix * vector(a_position, 1.0);
        v_color = a_color;

    }
      `;
  }
  static defaultFragmentShader() {
    return `
    varying vec3 v_color;
    void main() {
        gl_FragColor = v_color;
    }`;
  }

  onAdd(map: mapboxgl.Map, gl: WebGLRenderingContext) {
    this.geometryBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, this.geometryBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.coordinates, gl.DYNAMIC_DRAW);

    const vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, this.shaderSource[0]);
    gl.compileShader(vs);
    const fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, this.shaderSource[1]);
    gl.compileShader(fs);

    this.program = gl.createProgram();
    gl.attachShader(this.program, vs);
    gl.attachShader(this.program, fs);
    gl.linkProgram(this.program);
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
    gl.useProgram(this.program);
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

  setShaderSource(vs: string, fs: string) {
    this.shaderSource = [vs, fs];
  }
}
