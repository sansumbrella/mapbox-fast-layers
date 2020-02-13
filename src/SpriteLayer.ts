import { SpriteSheet } from "./SpriteSheet";

/**
 * Renders oriented sprites in Web Mercator space
 * Map transform on the Web Mercator center, then use GL stuff from there.
 * Does Mapbox provide information about pixel size so we can scale images?
 */
export class SpriteLayer {
  sprites: SpriteSheet;

  constructor(sprites: SpriteSheet) {
    this.sprites = sprites;
  }

  onAdd(map: mapboxgl.Map, gl: WebGLRenderingContext) {
    //
  }

  onRemove(map: mapboxgl.Map, gl: WebGLRenderingContext) {}

  prerender(gl: WebGLRenderingContext, matrix: number[]) {}

  render(gl: WebGLRenderingContext, matrix: number[]) {}
}
