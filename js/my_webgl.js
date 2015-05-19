

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

        out.linkProgram = function(spec) {
            var error;
            var compiled

            var vshader = gl.createShader(gl.VERTEX_SHADER);

            gl.shaderSource(vshader, spec.vertexShaderSource);

            gl.compileShader(vshader);

            compiled = gl.getShaderParameter(vshader, gl.COMPILE_STATUS);

            if (!compiled) {

              error = gl.getShaderInfoLog(vshader);
              gl.deleteShader(vshader);

              throw new Error("Vertex shader compilation failed: " + error);
            }

            var fshader = gl.createShader(gl.FRAGMENT_SHADER);;

            gl.shaderSource(fshader, spec.fragmentShaderSource);

            gl.compileShader(fshader);

            compiled = gl.getShaderParameter(fshader, gl.COMPILE_STATUS);

            if (!compiled) {

              error = gl.getShaderInfoLog(fshader);
              gl.deleteShader(fshader);

              throw new Error("Fragment shader compilation failed: " + error);
            }

            var program = gl.createProgram();

            gl.attachShader(program, vshader);
            gl.attachShader(program, fshader);

            gl.linkProgram(program);


            var linked = gl.getProgramParameter(program, gl.LINK_STATUS);

            if (!linked) {
                var error = gl.getProgramInfoLog(program);

                gl.deleteProgram(program);

                throw new Error("Program linking failed: " + error);
            }

            var prog = {
                program : program
            };

            prog.use = function() {
                gl.useProgram(program);
            };


            prog.addUniformFloat = function(uniform_name, value) {
                gl.useProgram(program);

                var uniformLocation = gl.getUniformLocation(program, uniform_name);

                if (uniformLocation === null) {
                    throw new Error("Could not get uniform: " + uniform_name);
                }

                if (typeof value === 'number') {

                    gl.uniform1f(uniformLocation, value);

                }else if (Array.isArray(value)){
                    if (value.length === 2) {

                        gl.uniform2f(uniformLocation, value[0], value[1]);

                    }else if (value.length === 3) {

                        gl.uniform3f(uniformLocation, value[0], value[1], value[2]);

                    }else if (value.length === 4) {

                        gl.uniform4f(uniformLocation, value[0], value[1], value[2], value[3]);
                    }else{
                        throw new Error("Cannot add uniform value: " + value);
                    }
                }else{
                    throw new Error("Cannot add uniform value: " + value);
                }

                gl.useProgram(null);
            };

            prog.drawTriangles = function(first, count) {
                gl.useProgram(program);

                gl.drawArrays(gl.TRIANGLES, first, count);

                gl.useProgram(null);
            };

            return prog;
        };

        out.addArrayFloat = function(array) {
            var numComponents = array[0].length;

            var monolithicArray = new Float32Array(numComponents*array.length);
            mIndex = 0;

            for(var i = 0; i < array.length; i++) {
                for(var j = 0; j < numComponents; j++){
                    monolithicArray[mIndex] = array[i][j];
                    mIndex++;
                }
            }

            // provide texture coordinates for the rectangle.
            var attributeBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, attributeBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, monolithicArray, gl.STATIC_DRAW);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);

            var buff ={};

            buff.bindToAttribute = function(program, attribute_name) {
                gl.useProgram(program.program);

                // look up where the texture coordinates need to go.
                var attributeLocation = gl.getAttribLocation(program.program, attribute_name);

                if (attributeLocation === -1) {
                    throw new Error("Could not get attribute: " + attribute_name);
                }

                gl.bindBuffer(gl.ARRAY_BUFFER, attributeBuffer);
                gl.enableVertexAttribArray(attributeLocation);
                gl.vertexAttribPointer(attributeLocation, numComponents, gl.FLOAT, false, 0, 0);
                gl.bindBuffer(gl.ARRAY_BUFFER, null);

                gl.useProgram(null);

                return buff;
            };

            return buff;
        };


        var textures = [];

        out.enableFloatTexture = function(){
            var OES_texture_float = gl.getExtension('OES_texture_float');

            if (!OES_texture_float) {
                throw new Error("No support for OES_texture_float");
            }
        };

        out.addTextureArray = function(width, height, array, useFloat) {

            gl.activeTexture(gl.TEXTURE0 + textures.length);

            var texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

            if (useFloat) {
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.FLOAT, array);
            }else{
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, array);
            }

            var tex = {
                index : textures.length,
                texture : texture,
                width : width,
                height : height,
                array : array
            };

            tex.bindToTextureUnit = function(program, tex_name, tex_size_name) {

                gl.useProgram(program.program);

                var u_textureLocation = gl.getUniformLocation(program.program, tex_name);
                gl.uniform1i(u_textureLocation, tex.index);

                if (tex_size_name) {
                    var textureSizeLocation = gl.getUniformLocation(program.program, tex_size_name);
                    gl.uniform2f(textureSizeLocation, tex.width, tex.height);
                }

                gl.useProgram(null);

                return tex;
            };

            textures.push(tex);


            return tex;

        };

        out.addTextureImage = function(image) {

            var texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

            gl.bindTexture(gl.TEXTURE_2D, null);

            var tex = {
                index : textures.length,
                texture : texture,
                image : image
            };

            tex.bindToTextureUnit = function(program, tu_i, tex_name, tex_size_name) {

                gl.useProgram(program.program);

                gl.activeTexture(gl.TEXTURE0 + tu_i);
                gl.bindTexture(gl.TEXTURE_2D, tex.texture);

                if (tex_name) {
                    var u_textureLocation = gl.getUniformLocation(program.program, tex_name);

                    if (u_textureLocation === null) {
                        throw new Error("Could not get uniform: " + tex_name);
                    }

                    gl.uniform1i(u_textureLocation, tu_i);
                }

                if (tex_size_name) {
                    var textureSizeLocation = gl.getUniformLocation(program.program, tex_size_name);

                    if (textureSizeLocation === null) {
                        throw new Error("Could not get uniform: " + tex_size_name);
                    }

                    gl.uniform2f(textureSizeLocation, tex.width, tex.height);
                }

                gl.useProgram(null);

                return tex;
            };

            textures.push(tex);

            return tex;

        };

        var framebuffers = [];

        out.addFrameBuffer = function(width, height, useFloat) {

            var texture = out.addTextureArray(width, height, null, useFloat);

            //out.gl.bindTexture(gl.TEXTURE_2D, texture);

            var fbo = gl.createFramebuffer();


            gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

            // Attach a texture to it.
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture.texture, 0);

            if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
                    throw new Error("Frame buffer creation failed");
            }

            gl.bindFramebuffer(gl.FRAMEBUFFER, null);

            var fb = {
                index : framebuffers.length,
                frameBuffer: fbo,
                texture : texture,
                width : width,
                height : height
            };

            fb.bind = function(program, resolution_name) {

                gl.useProgram(program.program);

                // make this the framebuffer we are rendering to.
                gl.bindFramebuffer(gl.FRAMEBUFFER, fb.frameBuffer);

                if (resolution_name) {
                    // Tell the shader the resolution of the framebuffer.
                    var resolutionLocation = gl.getUniformLocation(program.program, resolution_name);
                    gl.uniform2f(resolutionLocation, fb.width, fb.height);
                }

                // Tell webgl the viewport setting needed for framebuffer.
                gl.viewport(0, 0, fb.width, fb.height);

                gl.useProgram(null);
            };

            framebuffers.push(fb);

            return fb;
        };

        out.bindCanvas = function (program, resolution_name) {
            gl.useProgram(program.program);

            gl.bindFramebuffer(gl.FRAMEBUFFER, null);

            if (resolution_name) {
                // Tell the shader the resolution of the framebuffer.
                var resolutionLocation = gl.getUniformLocation(program.program, resolution_name);
                gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
            }

            // Tell webgl the viewport setting needed for framebuffer.
            gl.viewport(0, 0, canvas.width, canvas.height);

            gl.useProgram(null);
        };

        return out;
    },

};
