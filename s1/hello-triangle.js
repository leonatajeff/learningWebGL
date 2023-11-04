function showError(errorText) {
    const errorBoxDiv = document.getElementById("error-box");
    const errorTextElement = document.createElement("p");
    errorTextElement.innerText = errorText;
    errorBoxDiv.appendChild(errorTextElement);
    console.log(errorText);
}

showError("this is what an error looks like");

function helloTriangle() {
    /** @type {HTMLCanvasElement|null} */
    const canvas = document.getElementById("demo-canvas");
    if (!canvas) {
        showError("Canvas element not found");
        return;
    }

    const gl = canvas.getContext('webgl2'); // WebGL 2
    if (!gl) {
        const isWebGl1Supported = !!(document.createElement('canvas')).getContext('webgl');
        if (isWebGl1Supsported) {
          showError('WebGL 1 is supported, but not v2 - try using a different device or browser');
        } else {
          showError('WebGL is not supported on this device - try using a different device or browser');
        }
        return;
    }

    const triangleVertices = [
        0.0, 0.5, // top middle

        -0.5, -0.5, // bottom left
        
        0.5, -0.5 // bottom right
    ];

    // JS uses 64 bit floats. WebGL/GPU uses 32 bit floats.

    const triangleVerticesCPUBuffer = new Float32Array(triangleVertices);

    const triangleGPUBuffer = gl.createBuffer(); // create a buffer on the GPU

    gl.bindBuffer(gl.ARRAY_BUFFER, triangleGPUBuffer); // bind the buffer to the ARRAY_BUFFER slot
    // indirection. ARRAY_BUFFER is a slot on the GPU. We can bind a buffer to that slot.
    gl.bufferData(gl.ARRAY_BUFFER, triangleVerticesCPUBuffer, gl.STATIC_DRAW); // copy the data from the CPU to the GPU

    // STATIC_DRAW: we don't intend to update the data on the GPU. Just reference it.
    // GSLS, GLSL ES: OpenGL Shading Language. Like C, but for the GPU.
    // GLSL ES is a subset of GLSL. GLSL ES is used on mobile devices.

    // medium precision : mediump, high probability to account for 2^16 (65536) values
    
    const vertexShaderSourceCode = `#version 300 es
    precision mediump float;

    in vec2 vertexPosition; // input from the vertex buffer

    void main() {
        gl_Position = vec4(vertexPosition, 0.0, 1.0); // vec4(x,y,z,w) x and y is the position of the vertex, z is the depth, w is the perspective
    }`;

    const vertexShader = gl.createShader(gl.VERTEX_SHADER); // create a vertex shader
    gl.shaderSource(vertexShader, vertexShaderSourceCode); // set the source code of the vertex shader
    gl.compileShader(vertexShader); // compile the vertex shader

    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        const compileError = gl.getShaderInfoLog(vertexShader);
        showError(`Vertex shader compilation failed: ${compileError}`);
        return;
    }

    const fragmentShaderSourceCode = `#version 300 es

    precision mediump float;

    out vec4 outputColor;

    void main() {
        outputColor = vec4(0.294, 0.0, 0.51, 1.0); // vec4(r,g,b,a)
    }`;

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER); // create a fragment shader
    gl.shaderSource(fragmentShader, fragmentShaderSourceCode); // set the source code of the fragment shader    
    gl.compileShader(fragmentShader); // compile the fragment shader

    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        const compileError = gl.getShaderInfoLog(fragmentShader);
        showError(`Fragment shader compilation failed: ${compileError}`);
        return;
    }

    const triangleShaderProgram = gl.createProgram(); // create a shader program
    gl.attachShader(triangleShaderProgram, vertexShader); // attach the vertex shader to the shader program
    gl.attachShader(triangleShaderProgram, fragmentShader); // attach the fragment shader to the shader program
    gl.linkProgram(triangleShaderProgram); // link the shader program
    if (!gl.getProgramParameter(triangleShaderProgram, gl.LINK_STATUS)) {
        const linkError = gl.getProgramInfoLog(triangleShaderProgram);
        showError(`Shader program linking failed: ${linkError}`);
        return;
    }

    const vertexPositionAttribLocation = gl.getAttribLocation(triangleShaderProgram, "vertexPosition"); // get the location of the vertexPosition attribute in the shader program
    if (vertexPositionAttribLocation < 0) {
        showError("vertexPosition attribute not found in shader program");
        return;
    }

    // Input assembler - how to read vertices from our GPU triangle buffer
    // Vertex shader - how to place those vertices in clip space 
    // Primitive assembly - how to assemble the vertices into triangles
    // Fragment shader - what color to draw each pixel

    // Output merger - how to merge the shaded pixel fragment with the existing output image
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    gl.clearColor(0.08, 0.08, 0.08, 1.0); // rgb(r,g,b,a) - setting the clear color
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // clearing the canvas (to transparency)

    // Rasterizer - which pixels are part of a triangle
    gl.viewport(0, 0, canvas.width, canvas.height); // setting the viewport

    // set GPU program (vertex + fragment shader pair)
    gl.useProgram(triangleShaderProgram);
    gl.enableVertexAttribArray(vertexPositionAttribLocation); // enable the vertexPosition attribute

    // setup Input Assembler - how to read vertices from our GPU triangle buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleGPUBuffer); // bind the triangle buffer to the ARRAY_BUFFER slot
    gl.vertexAttribPointer(
        vertexPositionAttribLocation, // location of the vertexPosition attribute in the shader program
        2, // number of components per attribute (x,y)
        gl.FLOAT, // type of each component
        false, // normalize
        2 * Float32Array.BYTES_PER_ELEMENT, // stride
        0 // offset
    ),


    // Order of the above does not matter as long as it is before the draw call.
    // Be mindful of ordering for performance reasons at a larger scale.

    // Draw call - draw the triangles
    gl.drawArrays(gl.TRIANGLES, 0, 3); // draw the triangles
}

try {
    helloTriangle();
} catch (e) {
    showError(`Uncaught JavaScript exception: ${e}`);
}