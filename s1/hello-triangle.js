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

    const gl = canvas.getContext('webg12'); // WebGL 2
    if (!gl) {
        const isWebGl1Supported = !!(document.createElement('canvas')).getContext('webgl');
        if (isWebGl1Supported) {
          showError('WebGL 1 is supported, but not v2 - try using a different device or browser');
        } else {
          showError('WebGL is not supported on this device - try using a different device or browser');
        }
        return;
    }

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

try {
    helloTriangle();
} catch (e) {
    showError(`Uncaught JavaScript exception: ${e}`);
}