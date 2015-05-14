

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

        out.canvas = document.getElementById(canvas_id);

        if (!out.canvas) {
            throw "canvas context undefined.";
        }


        out.gl = out.canvas.getContext("webgl");

        if (!out.gl) {
            throw "webgl context undefined.";
        }

        out.shaders = [];

        out.addShader = function(type, source) {
            // compile shader sources

            var shader;

            if (type === "vertex" || type === "x-shader/x-vertex") {

                shader = out.gl.createShader(out.gl.VERTEX_SHADER);

            }else if (type === "fragment" || type === "x-shader/x-fragment") {

                shader = out.gl.createShader(out.gl.FRAGMENT_SHADER);

            }else{
                throw "Shader type " + type + " undefined.";
            }

            out.gl.shaderSource(shader, source);

            out.gl.compileShader(shader);

            var compiled = out.gl.getShaderParameter(shader, out.gl.COMPILE_STATUS);

            if (!compiled) {

              var error = out.gl.getShaderInfoLog(shader);
              out.gl.deleteShader(shader);

              throw "Shader compilation failed: " + error;
            }

            out.shaders.push(shader);
        };

        out.program = null;

        out.linkProgram = function() {

            if (out.program) {
                out.gl.deleteProgram(out.program);
            }

            out.program = out.gl.createProgram();

            out.shaders.forEach(function(shader) {
                out.gl.attachShader(out.program, shader);
            });

            out.gl.linkProgram(out.program);


            var linked = out.gl.getProgramParameter(out.program, out.gl.LINK_STATUS);

            if (!linked) {
                var error = out.gl.getProgramInfoLog(out.program);

                out.gl.deleteProgram(out.program);

                out.program = null;

                throw "Program linking failed: " + error;
            }

            out.gl.useProgram(out.program);
        };

        return out;
    },

};
