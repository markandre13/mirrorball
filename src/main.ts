var cubeRotation = 0.0

import { mat4 } from 'gl-matrix'

interface Scene {
    vertex: number[]
    indices: number[]
    faceColors: number[][]
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
    if (!gl) {
        alert('Unable to initialize WebGL. Your browser or machine may not support it.')
        return
    }

    const vertextShaderProgram = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    varying lowp vec4 vColor;
    void main(void) {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    vColor = aVertexColor;
    }`

    // Fragment shader program

    const fragmentShaderProgram = `
    varying lowp vec4 vColor;
    void main(void) {
        gl_FragColor = vColor;
    }`
    const shaderProgram = compileShaders(gl, vertextShaderProgram, fragmentShaderProgram)
    if (shaderProgram === null)
        throw Error("initShaderProgram failed")

    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
            vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
        }
    }

    const scene = createScene()
    const buffers = createAllBuffers(gl, scene)

    let t0 = 0
    function render(t1: number) {
        t1 *= 0.001;  // convert to seconds
        const deltaTime = t1 - t0
        t0 = t1

        drawScene(gl, programInfo, buffers, deltaTime, scene)

        requestAnimationFrame(render)
    }
    requestAnimationFrame(render)
}

function createScene(): Scene {
    return {
        vertex: [
            // Front face
            -1.0, -1.0, 1.0,
            1.0, -1.0, 1.0,
            1.0, 1.0, 1.0,
            -1.0, 1.0, 1.0,
    
            // Back face
            -1.0, -1.0, -1.0,
            -1.0, 1.0, -1.0,
            1.0, 1.0, -1.0,
            1.0, -1.0, -1.0,
    
            // Top face
            -1.0, 1.0, -1.0,
            -1.0, 1.0, 1.0,
            1.0, 1.0, 1.0,
            1.0, 1.0, -1.0,
    
            // Bottom face
            -1.0, -1.0, -1.0,
            1.0, -1.0, -1.0,
            1.0, -1.0, 1.0,
            -1.0, -1.0, 1.0,
    
            // Right face
            1.0, -1.0, -1.0,
            1.0, 1.0, -1.0,
            1.0, 1.0, 1.0,
            1.0, -1.0, 1.0,
    
            // Left face
            -1.0, -1.0, -1.0,
            -1.0, -1.0, 1.0,
            -1.0, 1.0, 1.0,
            -1.0, 1.0, -1.0,
        ],
        indices: [
            0, 1, 2, 0, 2, 3,    // front
            4, 5, 6, 4, 6, 7,    // back
            8, 9, 10, 8, 10, 11,   // top
            12, 13, 14, 12, 14, 15,   // bottom
            16, 17, 18, 16, 18, 19,   // right
            20, 21, 22, 20, 22, 23,   // left
        ],
        faceColors: [
            [1.0, 1.0, 1.0, 1.0],    // Front face: white
            [1.0, 0.0, 0.0, 1.0],    // Back face: red
            [0.0, 1.0, 0.0, 1.0],    // Top face: green
            [0.0, 0.0, 1.0, 1.0],    // Bottom face: blue
            [1.0, 1.0, 0.0, 1.0],    // Right face: yellow
            [1.0, 0.0, 1.0, 1.0],    // Left face: purple
        ]
    }
}

function drawScene(gl: WebGL2RenderingContext, programInfo: any, buffers: any, deltaTime: number, scene: Scene) {
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
    mat4.translate(modelViewMatrix, modelViewMatrix, [-0.0, 0.0, -6.0])  
    mat4.rotate(modelViewMatrix, modelViewMatrix, cubeRotation, [0, 0, 1])  
    mat4.rotate(modelViewMatrix, modelViewMatrix, cubeRotation * .7, [0, 1, 0]) 

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
        gl.enableVertexAttribArray(
            programInfo.attribLocations.vertexPosition)
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

    {       
        const vertexCount = scene.indices.length
        const type = gl.UNSIGNED_SHORT
        const offset = 0
        gl.drawElements(gl.TRIANGLES, vertexCount, type, offset)
    }

    cubeRotation += deltaTime
}

function compileShaders(gl: any, vertexSharderSrc: string, fragmentShaderSrc: string) {
    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSharderSrc)
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSrc)

    const program = gl.createProgram()
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(program))
        return null
    }

    return program
}

function compileShader(gl: WebGL2RenderingContext, type: GLenum, source: string) {
    const shader = gl.createShader(type)
    if (shader === null)
        throw Error("failed to create shader")
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(`An error occurred compiling the ${type} shader: ${gl.getShaderInfoLog(shader)}`)
        gl.deleteShader(shader)
        return null
    }
    return shader
}

interface Buffers {
    position: WebGLBuffer
    color: WebGLBuffer
    indices: WebGLBuffer
}

function createAllBuffers(gl: WebGL2RenderingContext, scene: Scene): Buffers {
    var colors: number[] = []
    for (var j = 0; j < scene.faceColors.length; ++j) {
        const c = scene.faceColors[j]
        colors = colors.concat(c, c, c, c)
    }

    return {
        position: createBuffer(gl, gl.ARRAY_BUFFER, gl.STATIC_DRAW, Float32Array, scene.vertex),
        color: createBuffer(gl, gl.ARRAY_BUFFER, gl.STATIC_DRAW, Float32Array, colors),
        indices: createBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, gl.STATIC_DRAW, Uint16Array, scene.indices),
    }
}

function createBuffer(gl: WebGL2RenderingContext, target: GLenum, usage: GLenum, type: any, data: number[]): WebGLBuffer {
    const buffer = gl.createBuffer()
    if (buffer === null)
        throw Error("Failed to create new WebGLBuffer")
    gl.bindBuffer(target, buffer)
    gl.bufferData(target, new type(data), usage)
    return buffer
}
