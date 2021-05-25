(function (exports) {
  'use strict';

  /**
   * Common utilities
   * @module glMatrix
   */
  // Configuration Constants
  var EPSILON = 0.000001;
  var ARRAY_TYPE = typeof Float32Array !== 'undefined' ? Float32Array : Array;
  if (!Math.hypot) Math.hypot = function () {
    var y = 0,
        i = arguments.length;

    while (i--) {
      y += arguments[i] * arguments[i];
    }

    return Math.sqrt(y);
  };

  /**
   * 4x4 Matrix<br>Format: column-major, when typed out it looks like row-major<br>The matrices are being post multiplied.
   * @module mat4
   */

  /**
   * Creates a new identity mat4
   *
   * @returns {mat4} a new 4x4 matrix
   */

  function create$1() {
    var out = new ARRAY_TYPE(16);

    if (ARRAY_TYPE != Float32Array) {
      out[1] = 0;
      out[2] = 0;
      out[3] = 0;
      out[4] = 0;
      out[6] = 0;
      out[7] = 0;
      out[8] = 0;
      out[9] = 0;
      out[11] = 0;
      out[12] = 0;
      out[13] = 0;
      out[14] = 0;
    }

    out[0] = 1;
    out[5] = 1;
    out[10] = 1;
    out[15] = 1;
    return out;
  }
  /**
   * Transpose the values of a mat4
   *
   * @param {mat4} out the receiving matrix
   * @param {ReadonlyMat4} a the source matrix
   * @returns {mat4} out
   */

  function transpose(out, a) {
    // If we are transposing ourselves we can skip a few steps but have to cache some values
    if (out === a) {
      var a01 = a[1],
          a02 = a[2],
          a03 = a[3];
      var a12 = a[6],
          a13 = a[7];
      var a23 = a[11];
      out[1] = a[4];
      out[2] = a[8];
      out[3] = a[12];
      out[4] = a01;
      out[6] = a[9];
      out[7] = a[13];
      out[8] = a02;
      out[9] = a12;
      out[11] = a[14];
      out[12] = a03;
      out[13] = a13;
      out[14] = a23;
    } else {
      out[0] = a[0];
      out[1] = a[4];
      out[2] = a[8];
      out[3] = a[12];
      out[4] = a[1];
      out[5] = a[5];
      out[6] = a[9];
      out[7] = a[13];
      out[8] = a[2];
      out[9] = a[6];
      out[10] = a[10];
      out[11] = a[14];
      out[12] = a[3];
      out[13] = a[7];
      out[14] = a[11];
      out[15] = a[15];
    }

    return out;
  }
  /**
   * Inverts a mat4
   *
   * @param {mat4} out the receiving matrix
   * @param {ReadonlyMat4} a the source matrix
   * @returns {mat4} out
   */

  function invert(out, a) {
    var a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a03 = a[3];
    var a10 = a[4],
        a11 = a[5],
        a12 = a[6],
        a13 = a[7];
    var a20 = a[8],
        a21 = a[9],
        a22 = a[10],
        a23 = a[11];
    var a30 = a[12],
        a31 = a[13],
        a32 = a[14],
        a33 = a[15];
    var b00 = a00 * a11 - a01 * a10;
    var b01 = a00 * a12 - a02 * a10;
    var b02 = a00 * a13 - a03 * a10;
    var b03 = a01 * a12 - a02 * a11;
    var b04 = a01 * a13 - a03 * a11;
    var b05 = a02 * a13 - a03 * a12;
    var b06 = a20 * a31 - a21 * a30;
    var b07 = a20 * a32 - a22 * a30;
    var b08 = a20 * a33 - a23 * a30;
    var b09 = a21 * a32 - a22 * a31;
    var b10 = a21 * a33 - a23 * a31;
    var b11 = a22 * a33 - a23 * a32; // Calculate the determinant

    var det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

    if (!det) {
      return null;
    }

    det = 1.0 / det;
    out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
    out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
    out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
    out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
    out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
    out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
    out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
    out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
    out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
    out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
    return out;
  }
  /**
   * Translate a mat4 by the given vector
   *
   * @param {mat4} out the receiving matrix
   * @param {ReadonlyMat4} a the matrix to translate
   * @param {ReadonlyVec3} v vector to translate by
   * @returns {mat4} out
   */

  function translate(out, a, v) {
    var x = v[0],
        y = v[1],
        z = v[2];
    var a00, a01, a02, a03;
    var a10, a11, a12, a13;
    var a20, a21, a22, a23;

    if (a === out) {
      out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
      out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
      out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
      out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
    } else {
      a00 = a[0];
      a01 = a[1];
      a02 = a[2];
      a03 = a[3];
      a10 = a[4];
      a11 = a[5];
      a12 = a[6];
      a13 = a[7];
      a20 = a[8];
      a21 = a[9];
      a22 = a[10];
      a23 = a[11];
      out[0] = a00;
      out[1] = a01;
      out[2] = a02;
      out[3] = a03;
      out[4] = a10;
      out[5] = a11;
      out[6] = a12;
      out[7] = a13;
      out[8] = a20;
      out[9] = a21;
      out[10] = a22;
      out[11] = a23;
      out[12] = a00 * x + a10 * y + a20 * z + a[12];
      out[13] = a01 * x + a11 * y + a21 * z + a[13];
      out[14] = a02 * x + a12 * y + a22 * z + a[14];
      out[15] = a03 * x + a13 * y + a23 * z + a[15];
    }

    return out;
  }
  /**
   * Rotates a mat4 by the given angle around the given axis
   *
   * @param {mat4} out the receiving matrix
   * @param {ReadonlyMat4} a the matrix to rotate
   * @param {Number} rad the angle to rotate the matrix by
   * @param {ReadonlyVec3} axis the axis to rotate around
   * @returns {mat4} out
   */

  function rotate(out, a, rad, axis) {
    var x = axis[0],
        y = axis[1],
        z = axis[2];
    var len = Math.hypot(x, y, z);
    var s, c, t;
    var a00, a01, a02, a03;
    var a10, a11, a12, a13;
    var a20, a21, a22, a23;
    var b00, b01, b02;
    var b10, b11, b12;
    var b20, b21, b22;

    if (len < EPSILON) {
      return null;
    }

    len = 1 / len;
    x *= len;
    y *= len;
    z *= len;
    s = Math.sin(rad);
    c = Math.cos(rad);
    t = 1 - c;
    a00 = a[0];
    a01 = a[1];
    a02 = a[2];
    a03 = a[3];
    a10 = a[4];
    a11 = a[5];
    a12 = a[6];
    a13 = a[7];
    a20 = a[8];
    a21 = a[9];
    a22 = a[10];
    a23 = a[11]; // Construct the elements of the rotation matrix

    b00 = x * x * t + c;
    b01 = y * x * t + z * s;
    b02 = z * x * t - y * s;
    b10 = x * y * t - z * s;
    b11 = y * y * t + c;
    b12 = z * y * t + x * s;
    b20 = x * z * t + y * s;
    b21 = y * z * t - x * s;
    b22 = z * z * t + c; // Perform rotation-specific matrix multiplication

    out[0] = a00 * b00 + a10 * b01 + a20 * b02;
    out[1] = a01 * b00 + a11 * b01 + a21 * b02;
    out[2] = a02 * b00 + a12 * b01 + a22 * b02;
    out[3] = a03 * b00 + a13 * b01 + a23 * b02;
    out[4] = a00 * b10 + a10 * b11 + a20 * b12;
    out[5] = a01 * b10 + a11 * b11 + a21 * b12;
    out[6] = a02 * b10 + a12 * b11 + a22 * b12;
    out[7] = a03 * b10 + a13 * b11 + a23 * b12;
    out[8] = a00 * b20 + a10 * b21 + a20 * b22;
    out[9] = a01 * b20 + a11 * b21 + a21 * b22;
    out[10] = a02 * b20 + a12 * b21 + a22 * b22;
    out[11] = a03 * b20 + a13 * b21 + a23 * b22;

    if (a !== out) {
      // If the source and destination differ, copy the unchanged last row
      out[12] = a[12];
      out[13] = a[13];
      out[14] = a[14];
      out[15] = a[15];
    }

    return out;
  }
  /**
   * Generates a perspective projection matrix with the given bounds.
   * Passing null/undefined/no value for far will generate infinite projection matrix.
   *
   * @param {mat4} out mat4 frustum matrix will be written into
   * @param {number} fovy Vertical field of view in radians
   * @param {number} aspect Aspect ratio. typically viewport width/height
   * @param {number} near Near bound of the frustum
   * @param {number} far Far bound of the frustum, can be null or Infinity
   * @returns {mat4} out
   */

  function perspective(out, fovy, aspect, near, far) {
    var f = 1.0 / Math.tan(fovy / 2),
        nf;
    out[0] = f / aspect;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = f;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[11] = -1;
    out[12] = 0;
    out[13] = 0;
    out[15] = 0;

    if (far != null && far !== Infinity) {
      nf = 1 / (near - far);
      out[10] = (far + near) * nf;
      out[14] = 2 * far * near * nf;
    } else {
      out[10] = -1;
      out[14] = -2 * near;
    }

    return out;
  }

  /**
   * 3 Dimensional Vector
   * @module vec3
   */

  /**
   * Creates a new, empty vec3
   *
   * @returns {vec3} a new 3D vector
   */

  function create() {
    var out = new ARRAY_TYPE(3);

    if (ARRAY_TYPE != Float32Array) {
      out[0] = 0;
      out[1] = 0;
      out[2] = 0;
    }

    return out;
  }
  /**
   * Creates a new vec3 initialized with the given values
   *
   * @param {Number} x X component
   * @param {Number} y Y component
   * @param {Number} z Z component
   * @returns {vec3} a new 3D vector
   */

  function fromValues(x, y, z) {
    var out = new ARRAY_TYPE(3);
    out[0] = x;
    out[1] = y;
    out[2] = z;
    return out;
  }
  /**
   * Rotate a 3D vector around the x-axis
   * @param {vec3} out The receiving vec3
   * @param {ReadonlyVec3} a The vec3 point to rotate
   * @param {ReadonlyVec3} b The origin of the rotation
   * @param {Number} rad The angle of rotation in radians
   * @returns {vec3} out
   */

  function rotateX(out, a, b, rad) {
    var p = [],
        r = []; //Translate point to the origin

    p[0] = a[0] - b[0];
    p[1] = a[1] - b[1];
    p[2] = a[2] - b[2]; //perform rotation

    r[0] = p[0];
    r[1] = p[1] * Math.cos(rad) - p[2] * Math.sin(rad);
    r[2] = p[1] * Math.sin(rad) + p[2] * Math.cos(rad); //translate to correct position

    out[0] = r[0] + b[0];
    out[1] = r[1] + b[1];
    out[2] = r[2] + b[2];
    return out;
  }
  /**
   * Rotate a 3D vector around the z-axis
   * @param {vec3} out The receiving vec3
   * @param {ReadonlyVec3} a The vec3 point to rotate
   * @param {ReadonlyVec3} b The origin of the rotation
   * @param {Number} rad The angle of rotation in radians
   * @returns {vec3} out
   */

  function rotateZ(out, a, b, rad) {
    var p = [],
        r = []; //Translate point to the origin

    p[0] = a[0] - b[0];
    p[1] = a[1] - b[1];
    p[2] = a[2] - b[2]; //perform rotation

    r[0] = p[0] * Math.cos(rad) - p[1] * Math.sin(rad);
    r[1] = p[0] * Math.sin(rad) + p[1] * Math.cos(rad);
    r[2] = p[2]; //translate to correct position

    out[0] = r[0] + b[0];
    out[1] = r[1] + b[1];
    out[2] = r[2] + b[2];
    return out;
  }
  /**
   * Perform some operation over an array of vec3s.
   *
   * @param {Array} a the array of vectors to iterate over
   * @param {Number} stride Number of elements between the start of each vec3. If 0 assumes tightly packed
   * @param {Number} offset Number of elements to skip at the beginning of the array
   * @param {Number} count Number of vec3s to iterate over. If 0 iterates over entire array
   * @param {Function} fn Function to call for each vector in the array
   * @param {Object} [arg] additional argument to pass to fn
   * @returns {Array} a
   * @function
   */

  (function () {
    var vec = create();
    return function (a, stride, offset, count, fn, arg) {
      var i, l;

      if (!stride) {
        stride = 3;
      }

      if (!offset) {
        offset = 0;
      }

      if (count) {
        l = Math.min(count * stride + offset, a.length);
      } else {
        l = a.length;
      }

      for (i = offset; i < l; i += stride) {
        vec[0] = a[i];
        vec[1] = a[i + 1];
        vec[2] = a[i + 2];
        fn(vec, vec, arg);
        a[i] = vec[0];
        a[i + 1] = vec[1];
        a[i + 2] = vec[2];
      }

      return a;
    };
  })();

  function main() {
      const glframe = document.createElement("div");
      glframe.style.position = "absolute";
      glframe.style.left = "0";
      glframe.style.right = "0";
      glframe.style.top = "0";
      glframe.style.bottom = "24px";
      glframe.style.overflow = "hidden";
      const canvas = document.createElement("canvas");
      glframe.style.position = "absolute";
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      canvas.style.display = "block";
      const text = document.createElement("div");
      text.style.position = "absolute";
      text.style.left = "0";
      text.style.right = "0";
      text.style.height = "24px";
      text.style.bottom = "0";
      glframe.appendChild(canvas);
      document.body.appendChild(glframe);
      document.body.appendChild(text);
      const gl = (canvas.getContext('webgl2') || canvas.getContext('experimental-webgl'));
      if (gl === null) {
          alert('Unable to initialize WebGL. Your browser or machine may not support it.');
          return;
      }
      const scene = createScene();
      let obj = "# Wavefront Object File";
      for (let i = 0; i < scene.vertex.length; i += 3) {
          obj = `${obj}\nv ${scene.vertex[i]} ${scene.vertex[i + 1]} ${scene.vertex[i + 2]}`;
      }
      for (let i = 0; i < scene.indices.length; i += 3) {
          obj = `${obj}\nf ${scene.indices[i] + 1} ${scene.indices[i + 1] + 1} ${scene.indices[i + 2] + 1}`;
      }
      const download = document.createElement("a");
      download.download = "mirrorball.obj";
      download.type = "model/obj";
      download.href = URL.createObjectURL(new Blob([obj]));
      download.appendChild(document.createTextNode("Wavefront Object File"));
      text.appendChild(download);
      const buffers = createAllBuffers(gl, scene);
      const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertextShaderProgram);
      const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderProgram);
      const programInfo = linkProgram(gl, vertexShader, fragmentShader);
      let t0 = 0;
      var rotation = 0.0;
      function render(t1) {
          t1 *= 0.00025;
          const deltaTime = t1 - t0;
          t0 = t1;
          drawScene(gl, programInfo, buffers, scene, rotation);
          rotation += deltaTime;
          requestAnimationFrame(render);
      }
      requestAnimationFrame(render);
  }
  function createScene() {
      const scene = {
          vertex: [],
          normals: [],
          indices: [],
          faceColors: []
      };
      const radius = 1;
      const circumference0 = radius * 2 * Math.PI;
      const tileSize = 1 / 64;
      const tileSpacing = tileSize / 15;
      const tileCount0 = Math.floor(circumference0 / (2 * (tileSize + tileSpacing)));
      const origin = fromValues(0, 0, 0);
      let shiftRing = 0;
      // create rings for mirror tiles from bottom to top
      const step0 = 2 * Math.PI / tileCount0;
      for (let i = -Math.PI / 2; i < Math.PI / 2; i += step0) {
          let q = fromValues(0, radius, 0);
          rotateX(q, q, origin, i);
          const circumference1 = q[1] * 2 * Math.PI;
          const tileCount1 = Math.floor(circumference1 / (2 * (tileSize + tileSpacing)));
          if (i > 0 && tileCount1 <= 0) {
              console.log(`abort at i=${i}, tileCount1=${tileCount1}`);
              break;
          }
          if (tileCount1 <= 0)
              continue;
          // create tiles for ring
          const step1 = 2 * Math.PI / tileCount1;
          shiftRing += step1 / 2.0;
          // console.log(`skew=${shiftRing}, step1=${step1}, titleCount1=${tileCount1}`)
          for (let j = 0; j < 2 * Math.PI - step1 / 2; j += step1) {
              const idx = scene.vertex.length / 3;
              scene.indices.push(idx, idx + 1, idx + 2, idx, idx + 2, idx + 3);
              let v = [
                  fromValues(0, 1, 0),
                  fromValues(-tileSize, radius, -tileSize),
                  fromValues(tileSize, radius, -tileSize),
                  fromValues(tileSize, radius, tileSize),
                  fromValues(-tileSize, radius, tileSize),
              ];
              const maxRandomDegree = 10;
              const rx = (Math.random() - 0.5) * 2 * Math.PI / 360 * maxRandomDegree;
              const rz = (Math.random() - 0.5) * 2 * Math.PI / 360 * maxRandomDegree;
              // rotate normal vector around origin
              rotateX(v[0], v[0], origin, rx);
              rotateZ(v[0], v[0], origin, rz);
              // rotate tile around it's center
              const cv = fromValues(0, radius, 0);
              for (let a = 1; a < v.length; ++a) {
                  rotateX(v[a], v[a], cv, rx);
                  rotateZ(v[a], v[a], cv, rz);
              }
              for (let a = 0; a < v.length; ++a) {
                  rotateX(v[a], v[a], origin, i);
                  rotateZ(v[a], v[a], origin, j + shiftRing);
              }
              for (let a = 0; a < 4; ++a)
                  scene.normals.push(...v[0]);
              for (let a = 1; a < v.length; ++a)
                  scene.vertex.push(...v[a]);
              scene.faceColors.push([Math.random(), Math.random(), Math.random(), 1.0]);
          }
      }
      return scene;
  }
  function createAllBuffers(gl, scene) {
      var colors = [];
      for (var j = 0; j < scene.faceColors.length; ++j) {
          const c = scene.faceColors[j];
          for (let i = 0; i < 4; ++i)
              colors.push(...c);
      }
      return {
          position: createBuffer(gl, gl.ARRAY_BUFFER, gl.STATIC_DRAW, Float32Array, scene.vertex),
          normal: createBuffer(gl, gl.ARRAY_BUFFER, gl.STATIC_DRAW, Float32Array, scene.normals),
          color: createBuffer(gl, gl.ARRAY_BUFFER, gl.STATIC_DRAW, Float32Array, colors),
          indices: createBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, gl.STATIC_DRAW, Uint16Array, scene.indices),
      };
  }
  function createBuffer(gl, target, usage, type, data) {
      const buffer = gl.createBuffer();
      if (buffer === null)
          throw Error("Unable to create WebGLBuffer");
      gl.bindBuffer(target, buffer);
      gl.bufferData(target, new type(data), usage);
      return buffer;
  }
  function compileShader(gl, type, source) {
      const shader = gl.createShader(type);
      if (shader === null)
          throw Error("Unable to create WebGLShader");
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          gl.deleteShader(shader);
          throw Error(`An error occurred compiling the ${type} WebGLShader: ${gl.getShaderInfoLog(shader)}`);
      }
      return shader;
  }
  const vertextShaderProgram = `
attribute vec4 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec4 aVertexColor;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uNormalMatrix;

varying lowp vec4 vColor;
varying highp vec3 vLighting;

void main(void) {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    vColor = aVertexColor;

    highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);
    highp vec3 ambientLight = vec3(0.1, 0.1, 0.1);

    highp vec3 directionalLightColor1 = vec3(1, 0, 0);
    highp vec3 directionalVector1 = normalize(vec3(0.85, 0.8, 0.75));
    highp float directional1 = max(dot(transformedNormal.xyz, directionalVector1), 0.0);

    highp vec3 directionalLightColor2 = vec3(0, 0, 1);
    highp vec3 directionalVector2 = normalize(vec3(-0.85, 0.8, 0.75));
    highp float directional2 = max(dot(transformedNormal.xyz, directionalVector2), 0.0);

    vLighting = ambientLight + (directionalLightColor1 * directional1) + (directionalLightColor2 * directional2) ;
}`;
  const fragmentShaderProgram = `
varying lowp vec4 vColor;
varying highp vec3 vLighting;
void main(void) {
    gl_FragColor = vec4(vec3(1,1,1) * vLighting, 1.0);
    // gl_FragColor = vec4(vColor.xyz * vLighting, 1.0);
}`;
  function linkProgram(gl, vertexShader, fragmentShader) {
      const program = gl.createProgram();
      if (program === null) {
          throw Error(`Unable to create WebGLProgram`);
      }
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
          throw Error(`Unable to initialize WebGLProgram: ${gl.getProgramInfoLog(program)}`);
      }
      return {
          program: program,
          attribLocations: {
              vertexPosition: gl.getAttribLocation(program, 'aVertexPosition'),
              vertexNormal: gl.getAttribLocation(program, 'aVertexNormal'),
              vertexColor: gl.getAttribLocation(program, 'aVertexColor'),
          },
          uniformLocations: {
              projectionMatrix: gl.getUniformLocation(program, 'uProjectionMatrix'),
              modelViewMatrix: gl.getUniformLocation(program, 'uModelViewMatrix'),
              normalMatrix: gl.getUniformLocation(program, 'uNormalMatrix')
          }
      };
  }
  function drawScene(gl, programInfo, buffers, scene, rotation) {
      const canvas = gl.canvas;
      if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
          canvas.width = canvas.clientWidth;
          canvas.height = canvas.clientHeight;
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.clearDepth(1.0);
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      const fieldOfView = 45 * Math.PI / 180; // in radians
      const aspect = canvas.clientWidth / canvas.clientHeight;
      const zNear = 0.1;
      const zFar = 100.0;
      const projectionMatrix = create$1();
      perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);
      const modelViewMatrix = create$1();
      translate(modelViewMatrix, modelViewMatrix, [-0.0, 0.0, -3.0]);
      rotate(modelViewMatrix, modelViewMatrix, Math.PI / 2, [1, 0, 0]);
      rotate(modelViewMatrix, modelViewMatrix, rotation, [0, 0, 1]);
      const normalMatrix = create$1();
      invert(normalMatrix, modelViewMatrix);
      transpose(normalMatrix, normalMatrix);
      {
          const numComponents = 3;
          const type = gl.FLOAT;
          const normalize = false;
          const stride = 0;
          const offset = 0;
          gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
          gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, numComponents, type, normalize, stride, offset);
          gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
      }
      {
          const numComponents = 3;
          const type = gl.FLOAT;
          const normalize = false;
          const stride = 0;
          const offset = 0;
          gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
          gl.vertexAttribPointer(programInfo.attribLocations.vertexNormal, numComponents, type, normalize, stride, offset);
          gl.enableVertexAttribArray(programInfo.attribLocations.vertexNormal);
      }
      {
          const numComponents = 4;
          const type = gl.FLOAT;
          const normalize = false;
          const stride = 0;
          const offset = 0;
          gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
          gl.vertexAttribPointer(programInfo.attribLocations.vertexColor, numComponents, type, normalize, stride, offset);
          gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);
      }
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
      gl.useProgram(programInfo.program);
      gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
      gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);
      gl.uniformMatrix4fv(programInfo.uniformLocations.normalMatrix, false, normalMatrix);
      {
          const vertexCount = scene.indices.length;
          const type = gl.UNSIGNED_SHORT;
          const offset = 0;
          gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
      }
  }

  exports.main = main;

  Object.defineProperty(exports, '__esModule', { value: true });

}(this.main = this.main || {}));
//# sourceMappingURL=main.js.map
