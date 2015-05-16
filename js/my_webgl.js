

/**
 * @namespace
 */
var WebGL = {

    /**
     * @param {string} canvas_id
     * @returns {object}
     */
    make : function(canvas_id) {

        var out = {};

        var canvas = document.getElementById(canvas_id);

        if (!canvas) {
            throw new Error("canvas context undefined.");
        }

        Object.defineProperty(out, 'canvas', {
            configurable: true,
            get: function() {
                return canvas;
            }
        });


        var gl = out.canvas.getContext("webgl");

        if (!gl) {
            throw new Error("webgl context undefined.");
        }

        Object.defineProperty(out, 'gl', {
            configurable: true,
            get: function() {
                return gl;
            }
        });


        var shaders = [];

        out.addShader = function(type, source) {
            // compile shader sources

            var shader;

            if (type === "vertex" || type === "x-shader/x-vertex") {

                shader = gl.createShader(gl.VERTEX_SHADER);

            }else if (type === "fragment" || type === "x-shader/x-fragment") {

                shader = gl.createShader(gl.FRAGMENT_SHADER);

            }else{
                throw new Error("Shader type " + type + " undefined.");
            }

            gl.shaderSource(shader, source);

            gl.compileShader(shader);

            var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

            if (!compiled) {

              var error = gl.getShaderInfoLog(shader);
              gl.deleteShader(shader);

              throw new Error("Shader compilation failed: " + error);
            }

            shaders.push(shader);
        };

        var program = null;

        Object.defineProperty(out, 'program', {
            configurable: true,
            get: function() {
                return program;
            }
        });

        out.linkProgram = function() {

            if (program) {
                gl.deleteProgram(program);
            }

            program = gl.createProgram();

            shaders.forEach(function(shader) {
                gl.attachShader(program, shader);
            });

            gl.linkProgram(program);


            var linked = gl.getProgramParameter(program, gl.LINK_STATUS);

            if (!linked) {
                var error = gl.getProgramInfoLog(program);

                gl.deleteProgram(program);

                program = null;

                throw new Error("Program linking failed: " + error);
            }

            gl.useProgram(program);
        };

        var textures = [];

        out.enableFloatTexture = function(){
            var OES_texture_float = gl.getExtension('OES_texture_float');

            if (!OES_texture_float) {
                throw new Error("No support for OES_texture_float");
            }
        };

        out.addTexture = function(width, height, image, useFloat) {

            var texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

            if (useFloat) {
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.FLOAT, image);
            }else{
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, image);
            }

            textures.push(texture);

            gl.bindTexture(gl.TEXTURE_2D, null);

            return texture;

        };

        var framebuffers = [];

        out.addFrameBuffer = function(width, height, useFloat) {

            var texture = out.addTexture(width, height, null, useFloat);

            //out.gl.bindTexture(gl.TEXTURE_2D, texture);

            var fbo = gl.createFramebuffer();
            var fb = {
                index : framebuffers.size(),
                frameBuffer: fbo,
                texture : texture,
                width : width,
                height : height};

            framebuffers.push(fb);

            gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

            // Attach a texture to it.
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

            if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
                    throw new Error("Frame buffer creation failed");
            }

            gl.bindFramebuffer(gl.FRAMEBUFFER, null);

            return fb;
        };

        out.bindFrameBuffer = function(i) {
            var fb = framebuffers[i];

            // make this the framebuffer we are rendering to.
            gl.bindFramebuffer(gl.FRAMEBUFFER, fb.frameBuffer);

            // Tell the shader the resolution of the framebuffer.
            var resolutionLocation = gl.getUniformLocation(program, "u_resolution");
            gl.uniform2f(resolutionLocation, fb.width, fb.height);

            // Tell webgl the viewport setting needed for framebuffer.
            gl.viewport(0, 0, fb.width, fb.height);
        };

        out.bindCanvas = function () {
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);

            // Tell the shader the resolution of the framebuffer.
            var resolutionLocation = gl.getUniformLocation(program, "u_resolution");
            gl.uniform2f(resolutionLocation, canvas.width, canvas.height);

            // Tell webgl the viewport setting needed for framebuffer.
            gl.viewport(0, 0, canvas.width, canvas.height);
        };

        return out;
    },

};
