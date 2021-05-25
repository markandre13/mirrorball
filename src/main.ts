var cubeRotation = 0.0

import { vec3, mat4 } from 'gl-matrix'

interface Scene {
    vertex: number[]
    indices: number[]
    normals: number[]
    faceColors: number[][]
}

interface Buffers {
    position: WebGLBuffer
    normal: WebGLBuffer
    color: WebGLBuffer
    indices: WebGLBuffer
}

interface ProgramInfo {
    program: WebGLProgram
    attribLocations: {
        vertexPosition: number
        vertexNormal: number
        vertexColor: number
    }
    uniformLocations: {
        projectionMatrix: WebGLUniformLocation
        modelViewMatrix: WebGLUniformLocation
        normalMatrix: WebGLUniformLocation
    }
}

export function main() {
    const glframe = document.createElement("div")
    glframe.style.position = "absolute"
    glframe.style.left = "0"
    glframe.style.right = "0"
    glframe.style.top = "0"
    glframe.style.bottom = "0"
    glframe.style.overflow = "hidden"

    const canvas = document.createElement("canvas")
    canvas.style.width = "100vw"
    canvas.style.height = "100vh"
    canvas.style.display = "block"

    glframe.appendChild(canvas)
    document.body.appendChild(glframe)

    const gl = (canvas.getContext('webgl2') || canvas.getContext('experimental-webgl')) as WebGL2RenderingContext
    if (gl === null) {
        alert('Unable to initialize WebGL. Your browser or machine may not support it.')
        return
    }

    const scene = createScene()
    const buffers = createAllBuffers(gl, scene)
    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertextShaderProgram)
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderProgram)
    const programInfo = linkProgram(gl, vertexShader, fragmentShader)

    let t0 = 0
    function render(t1: number) {
        t1 *= 0.00025
        const deltaTime = t1 - t0
        t0 = t1

        drawScene(gl, programInfo, buffers, scene)
        cubeRotation += deltaTime

        requestAnimationFrame(render)
    }
    requestAnimationFrame(render)
}

function createScene(): Scene {
    const scene: Scene = {
        vertex: [],
        normals: [],
        indices: [],
        faceColors: []
    }

    const radius = 1
    const circumference0 = radius * 2 * Math.PI
    const tileSize = 1/64
    const tileSpacing = tileSize / 15
    const tileCount0 = Math.floor(circumference0 / (2 * (tileSize + tileSpacing)))
    const origin = vec3.fromValues(0,0,0)

    const step0 = 2 * Math.PI / tileCount0
    for (let i = -Math.PI / 2; i < Math.PI / 2; i += step0) {

        let q = vec3.fromValues(0, radius, 0)
        vec3.rotateX(q, q, origin, i)
        const circumference1 = q[1] * 2 * Math.PI
        const tileCount1 = Math.floor(circumference1 / (2 * (tileSize + tileSpacing)))

        if (i > 0 && tileCount1 <= 0) {
            console.log(`abort at i=${i}, tileCount1=${tileCount1}`)
            break
        }
        if (tileCount1 < 0)
            continue

        const step1 = 2 * Math.PI / tileCount1
        for (let j = 0; j < 2 * Math.PI - step1/2; j += step1) {

            const idx = scene.vertex.length / 3
            scene.indices.push(idx, idx+1, idx+2, idx, idx+2, idx+3)

            let v = [
                vec3.fromValues(0, 1, 0),
                vec3.fromValues(-tileSize, radius, -tileSize),
                vec3.fromValues(tileSize, radius, -tileSize),
                vec3.fromValues(tileSize, radius, tileSize),
                vec3.fromValues(-tileSize, radius, tileSize),
            ]

            const maxRandomDegree = 10
            const rx = ( Math.random() - 0.5 ) * 2 * Math.PI / 360 * maxRandomDegree
            const rz = ( Math.random() - 0.5 ) * 2 * Math.PI / 360 * maxRandomDegree

            // rotate normal vector around origin
            vec3.rotateX(v[0], v[0], origin, rx)
            vec3.rotateZ(v[0], v[0], origin, rz)

            // rotate tile around it's center
            const cv = vec3.fromValues(0, radius, 0)
            for(let a=1; a<v.length; ++a) {
                vec3.rotateX(v[a], v[a], cv, rx)
                vec3.rotateZ(v[a], v[a], cv, rz)
            }

            for(let a=0; a<v.length; ++a) {
                vec3.rotateX(v[a], v[a], origin, i)
                vec3.rotateZ(v[a], v[a], origin, j)
            }
            for(let a=0; a<4; ++a)
                scene.normals.push(...v[0])         
            for(let a=1; a<v.length; ++a)
                scene.vertex.push(...v[a])

            scene.faceColors.push([Math.random(), Math.random(), Math.random(), 1.0])
        }
    }
    return scene
}

function createAllBuffers(gl: WebGL2RenderingContext, scene: Scene): Buffers {
    var colors: number[] = []
    for (var j = 0; j < scene.faceColors.length; ++j) {
        const c = scene.faceColors[j]
        for(let i=0; i<4; ++i)
            colors.push(...c)
    }

    return {
        position: createBuffer(gl, gl.ARRAY_BUFFER, gl.STATIC_DRAW, Float32Array, scene.vertex),
        normal: createBuffer(gl, gl.ARRAY_BUFFER, gl.STATIC_DRAW, Float32Array, scene.normals),
        color: createBuffer(gl, gl.ARRAY_BUFFER, gl.STATIC_DRAW, Float32Array, colors),
        indices: createBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, gl.STATIC_DRAW, Uint16Array, scene.indices),
    }
}

function createBuffer<T>(gl: WebGL2RenderingContext, target: GLenum, usage: GLenum, type: any, data: number[]): WebGLBuffer {
    const buffer = gl.createBuffer()
    if (buffer === null)
        throw Error("Unable to create WebGLBuffer")
    gl.bindBuffer(target, buffer)
    gl.bufferData(target, new type(data), usage)
    return buffer
}

function compileShader(gl: WebGL2RenderingContext, type: GLenum, source: string): WebGLShader {
    const shader = gl.createShader(type)
    if (shader === null)
        throw Error("Unable to create WebGLShader")
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader)
        throw Error(`An error occurred compiling the ${type} WebGLShader: ${gl.getShaderInfoLog(shader)}`)
    }
    return shader
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
}`

const fragmentShaderProgram = `
varying lowp vec4 vColor;
varying highp vec3 vLighting;
void main(void) {
    gl_FragColor = vec4(vec3(1,1,1) * vLighting, 1.0);
    // gl_FragColor = vec4(vColor.xyz * vLighting, 1.0);
}`

function linkProgram(gl: WebGL2RenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader): ProgramInfo {
    const program = gl.createProgram()
    if (program === null) {
        throw Error(`Unable to create WebGLProgram`)
    }
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw Error(`Unable to initialize WebGLProgram: ${gl.getProgramInfoLog(program)}`)
    }

    return {
        program: program,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(program, 'aVertexPosition'),
            vertexNormal: gl.getAttribLocation(program, 'aVertexNormal'),
            vertexColor: gl.getAttribLocation(program, 'aVertexColor'),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(program, 'uProjectionMatrix')!,
            modelViewMatrix: gl.getUniformLocation(program, 'uModelViewMatrix')!,
            normalMatrix: gl.getUniformLocation(program, 'uNormalMatrix')!
        }
    }
}

function drawScene(gl: WebGL2RenderingContext, programInfo: ProgramInfo, buffers: Buffers, scene: Scene) {
    const canvas = gl.canvas as HTMLCanvasElement
    if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
        canvas.width = canvas.clientWidth
        canvas.height = canvas.clientHeight
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.clearDepth(1.0)
    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    const fieldOfView = 45 * Math.PI / 180   // in radians
    const aspect = canvas.clientWidth / canvas.clientHeight
    const zNear = 0.1
    const zFar = 100.0
    const projectionMatrix = mat4.create()
    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar)

    const modelViewMatrix = mat4.create()
    mat4.translate(modelViewMatrix, modelViewMatrix, [-0.0, 0.0, -3.0])
    mat4.rotate(modelViewMatrix, modelViewMatrix, Math.PI/2, [1, 0, 0]) 
    mat4.rotate(modelViewMatrix, modelViewMatrix, cubeRotation, [0, 0, 1])  

    const normalMatrix = mat4.create();
    mat4.invert(normalMatrix, modelViewMatrix);
    mat4.transpose(normalMatrix, normalMatrix);

    {
        const numComponents = 3
        const type = gl.FLOAT
        const normalize = false
        const stride = 0
        const offset = 0
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position)
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexPosition,
            numComponents,
            type,
            normalize,
            stride,
            offset)
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition)
    }

    {
        const numComponents = 3
        const type = gl.FLOAT
        const normalize = false
        const stride = 0
        const offset = 0
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal)
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexNormal,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            programInfo.attribLocations.vertexNormal)
    }

    {
        const numComponents = 4
        const type = gl.FLOAT
        const normalize = false
        const stride = 0
        const offset = 0
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color)
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexColor,
            numComponents,
            type,
            normalize,
            stride,
            offset)
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor)
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices)

    gl.useProgram(programInfo.program)

    gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix)
    gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix)
    gl.uniformMatrix4fv(programInfo.uniformLocations.normalMatrix, false, normalMatrix)

    {       
        const vertexCount = scene.indices.length
        const type = gl.UNSIGNED_SHORT
        const offset = 0
        gl.drawElements(gl.TRIANGLES, vertexCount, type, offset)
    }
}