export type SpriteData = { [key: string]: SpriteCoords };

/**
 * Stores images on the GPU for rendering.
 */
export class SpriteSheet {
  sprites: SpriteData;
  texture: WebGLTexture;
  image: HTMLImageElement;

  constructor(image: HTMLImageElement, sprites: SpriteData) {
    this.image = image;
    this.sprites = sprites;
  }

  initialize(gl: WebGLRenderingContext) {
    this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    // initialize with a blue pixel
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.image.width, this.image.height, this.image);
  }

  /// Make the sprite sheet the active texture
  bind(gl: WebGLRenderingContext) {}

  /// Return sprite info for the named sprite
  get(name: string): Sprite {
    return { ...this.sprites[name], parent: this };
  }
}

/**
 * Location of a Sprite within a SpriteSheet
 */
interface SpriteCoords {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/**
 * Information needed to render a sprite
 */
export interface Sprite extends SpriteCoords {
  parent: SpriteSheet;
}
