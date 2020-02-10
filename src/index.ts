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
  positionAttribute: number;
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
void main() {
    gl_Position = u_matrix * vec4(a_position, 1.0);
    gl_PointSize = 5.0;
}`;
  }
  static defaultFragmentShader() {
    return `void main() {
  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
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

    this.positionAttribute = gl.getAttribLocation(this.program, "a_position");
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
    gl.uniformMatrix4fv(gl.getUniformLocation(this.program, "u_matrix"), false, matrix);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.geometryBuffer);
    gl.enableVertexAttribArray(this.positionAttribute);
    gl.vertexAttribPointer(this.positionAttribute, 3, gl.FLOAT, false, 0, 0);

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
