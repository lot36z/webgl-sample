
export function getGLContext(canvas: HTMLCanvasElement): WebGL2RenderingContext | null {
  const gl = canvas.getContext("webgl2");
  if (gl === null) {
    console.error('WebGL2 is not available in your browser.');
  }
  return gl;
}

export function getCanvas(id: string): HTMLCanvasElement | null {
  const canvas = document.getElementById(id) as HTMLCanvasElement | null;
  if (canvas === null) {
    console.error('canvas is not available.');
  }
  return canvas;
}

export const shaderType = {
  vertex: 'x-shader/x-vertex',
  fragment: 'x-shader/x-fragment',
} as const;

export type shaderType = typeof shaderType[keyof typeof shaderType];

export function getShader(gl: WebGL2RenderingContext, shaderString: string, type: shaderType): WebGLShader | null {
  let shader = null;
  if (type === shaderType.vertex) {
    shader = gl.createShader(gl.VERTEX_SHADER);
  }
  else if (type === shaderType.fragment) {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  }
  else {
    return null;
  }

  if (shader === null) {
    return null;
  }

  gl.shaderSource(shader, shaderString);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    return null;
  }

  return shader;
}