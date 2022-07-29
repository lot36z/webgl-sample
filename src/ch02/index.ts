import { getCanvas, getGLContext, getShader, shaderType } from "@/util";

export function main() {
  const canvas = getCanvas('canvas');
  if (canvas === null) {
    return;
  }
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const gl = getGLContext(canvas);
  if (gl === null) {
    return;
  }
  gl.clearColor(0, 0, 0, 1);

  const program = initProgram(gl);
  if (program === null) {
    return;
  }
  const aVertexPosition = gl.getAttribLocation(program, 'aVertexPosition');

  /**
   * 正方形のための頂点座標。
   * 
   * V0                   V3
   * (-0.5, 0.5, 0)       (0.5, 0.5, 0)
   * x--------------------x
   * |                    |
   * |                    |
   * |                    |
   * |                    |
   * x--------------------x
   * (-0.5, -0.5, 0)      (0.5, -0.5, 0)
   * V1                   V2
   */
  const vertices = [
    -0.5, 0.5, 0,  //V0
    -0.5, -0.5, 0, //V1
    0.5, -0.5, 0,  //V2
    0.5, 0.5, 0,   //V3
  ];

  /**
   * 頂点座標の結合関係。
   * 3点を結んで3角形を作成するのを繰り返し、
   * 3角形で図形を構築する。
   * 半時計回りに定義。
   */
   const indices = [
    0, 1, 2,
    0, 2, 3,
  ];

  const buffers = initBuffers(gl, vertices, indices);
  if (buffers === null) {
    return;
  }


  draw(gl, buffers.vertex, buffers.index, indices.length, aVertexPosition);

}

function initProgram(gl: WebGL2RenderingContext): WebGLProgram | null {
  const vertexShader = getShader(gl, `\
#version 300 es
precision mediump float;

// Supplied vertex position attribute
in vec3 aVertexPosition;

void main(void) {
  // Set the position in clipspace coordinates
  gl_Position = vec4(aVertexPosition, 1.0);
}
  `.trim(), shaderType.vertex);
  const fragmentShader = getShader(gl, `\
#version 300 es
precision mediump float;

// Color that is the result of this shader
out vec4 fragColor;

void main(void) {
  // Set the result as red
  fragColor = vec4(1.0, 0.0, 0.0, 1.0);
}
  `.trim(), shaderType.fragment);

  if (vertexShader === null || fragmentShader === null) {
    return null;
  }

  // Create a program
  const program = gl.createProgram();
  if (program === null) {
    return null;
  }
  // Attach the shaders to this program
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Could not initialize shaders');
    return null;
  }

  // Use this program instance
  gl.useProgram(program);
  return program;
}

function initBuffers(gl: WebGL2RenderingContext, vertices: number[], indices: number[]): { vertex: WebGLBuffer, index: WebGLBuffer } | null {

  // バッファを作成。
  const vertexBuffer = gl.createBuffer();
  if (vertexBuffer === null) {
    return null;
  }
  // バッファを削除。
  // gl.deleteBuffer(buffer);

  // バッファを種類を指定してバインド。
  // 第1引数の target は下記の種類を指定可能。
  // - ARRAY_BUFFER (頂点用)
  // - ELEMENT_ARRAY_BUFFER (インデックス用)
  // 第2引数の buffer は作成済みのバッファを指定。
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  // バッファにデータを設定する。
  // 第1引数の target は下記の種類を指定可能。
  // - ARRAY_BUFFER (頂点用)
  // - ELEMENT_ARRAY_BUFFER (インデックス用)
  // 第2引数の data はバッファに格納したいデータ。
  // 第3引数の usage はWebGLへのパフォーマンスヒント。下記の種類を指定可能。
  // - STATIC_DRAW (バッファのデータは変更されない。=一度設定し、何度も利用される。)
  // - DYNAMIC_DRAW (バッファのデータは頻繁に変更される。=何度も設定し、何度も利用される。)
  // - STREAM_DRAW (バッファのデータはレンダリングサイクルごとに変更される。=一度設定し、一度利用される。)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);


  const indexBuffer = gl.createBuffer();
  if (indexBuffer === null) {
    return null;
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);


  // バッファをクリア。
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  return { vertex: vertexBuffer, index: indexBuffer };
}

function draw(gl: WebGL2RenderingContext, vertexBuffer: WebGLBuffer, indexBuffer: WebGLBuffer, indexSize: number, aVertexPosition: number) {
  // Clear the scene
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Use the buffers we've constructed
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.vertexAttribPointer(aVertexPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aVertexPosition);

  // Bind IBO
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  // Draw to the scene using triangle primitives
  gl.drawElements(gl.TRIANGLES, indexSize, gl.UNSIGNED_SHORT, 0);

  // Clean
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
}