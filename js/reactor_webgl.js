"use strict";

/**
 * @typedef {Object} ReactorInput
 *
 * @property {number} [num_blocks_i]
 * @property {number} [num_blocks_j]
 * @property {number} [num_cells]
 */
var makeReactor = function(input){
    var output = {};

    var num_fields = 5;
    var kernel_size = 5;
    var kernel_center = (kernel_size - 1)/2;

    var N = function(num) {
        return num.toFixed(20);
    };

    var render_vert = function() {
        var src_arr = [
            "attribute vec2 a_position;",
            "attribute vec2 a_texCoord;",
            "uniform vec2 u_resolution;",
            "varying vec2 v_texCoord;",

            "void main() {",
               // convert the rectangle from pixels to 0.0 to 1.0
               "vec2 zeroToOne = a_position / u_resolution;",

               // convert from 0->1 to 0->2
               "vec2 zeroToTwo = zeroToOne * 2.0;",

               // convert from 0->2 to -1->+1 (clipspace)
               "vec2 clipSpace = zeroToTwo - 1.0;",

               "gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);",

               "v_texCoord = a_texCoord;",
            "}",
        ];


        return src_arr.join('\n');
    }


    var convolution_frag = function() {

        var src_arr = [
            "precision mediump float;",

            //cellblock information
            "uniform vec2 u_numBlocks;",

            // fields
            "uniform vec2 u_fieldTexSize;",
            "uniform sampler2D u_fields;",

            // kernels
            "uniform vec2 u_kernelTexSize;",
            "uniform sampler2D u_kernels;",

            // field interactions
            "uniform vec2 u_interactionTexSize;",
            "uniform sampler2D u_interactions;",

            // the texCoords passed in from the vertex shader.
            "varying vec2 v_texCoord;",

            "void main() {",

                "vec2 curBlock = floor(1.0001*v_texCoord * u_fieldTexSize / " + N(input.num_cells) + ");",

                // modulus hackery due to rounding errors
                "vec2 curFieldBlock = floor(curBlock - u_numBlocks*floor(1.0001*curBlock/u_numBlocks));",


                "if (curFieldBlock.x == 0.0 || curFieldBlock.x == (u_numBlocks.x-1.0) || curFieldBlock.y == 0.0 || curFieldBlock.y == (u_numBlocks.y-1.0)) {",
                    // boundary does not evolove
                    "gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);",

                "}else{",

                    "vec2 kernelCenter = (curBlock * " + N(kernel_size) + " + vec2(" + N(kernel_center) + ", " + N(kernel_center) + ")) / u_kernelTexSize;",

        ];

        var src_kernel = [];
        var i, j;

        var kernel_dx = 1.0/((input.num_blocks_i + 2) * kernel_size);
        var kernel_dy = 1.0/((input.num_blocks_j + 2) * kernel_size);

        var field_dx = 1.0/((input.num_blocks_i + 2) * input.num_cells);
        var field_dy = 1.0/((input.num_blocks_j + 2) * input.num_cells);

        for(i = -kernel_center; i <= kernel_center; i++) {
            for(j = -kernel_center; j <= kernel_center; j++) {
                src_kernel.push("texture2D(u_kernels, kernelCenter + vec2(" + N(i*kernel_dx) + "," + N(j*kernel_dy) + ")).r * texture2D(u_fields, v_texCoord + vec2(" + N(i*field_dx) + "," + N(j*field_dy) + ")).r");
            }
        }

        var src_interaction = [];

        for(i = 0; i < num_fields; i++) {
            src_interaction.push("texture2D(u_interactions, vec2(" + N(i*kernel_dx) + "," + N(j*kernel_dy) + ")).r * texture2D(u_fields, v_texCoord + vec2(" + N(i*field_dx) + "," + N(j*field_dy) + ")).r");
        }

        src_arr = src_arr.concat([
                    "gl_FragColor = vec4(" + src_kernel.join(" +\n") + ", 0.0, 0.0, 1.0);",
                    "for(float i = 0.0; i < " + N(num_fields) + "; ++i) {",
                        "gl_FragColor += texture2D(u_interactions, vec2(curField, i)/u_numFields) * texture2D(u_fields, v_texCoord);",
                    "}",
                "}",
            "}"
        ]);
        return src_arr.join('\n');
    };


    // create canvas element for webgl to work on
    var canvas = document.createElement("CANVAS");
    canvas.id = "reactor_webgl_canvas";
    canvas.width = num_fields * (input.num_blocks_i + 2) * input.num_cells;
    canvas.height = (input.num_blocks_j + 2) * input.num_cells;
    canvas.style.display = "none";

    document.body.appendChild(canvas);

    var webgl = WebGL.make("reactor_webgl_canvas");


    var program = webgl.linkProgram({
        vertexShaderSource : render_vert(),
        fragmentShaderSource : convolution_frag()
    });

    webgl.enableFloatTexture();

    program.addUniformFloat("u_resolution", [webgl.canvas.width, webgl.canvas.height]);


    program.addUniformFloat("u_numBlocks", [input.num_blocks_i + 2, input.num_blocks_j + 2]);


    // initiate with random fields
    (function(){
        var length = webgl.canvas.width * webgl.canvas.height * 4;

        var fields = new Float32Array(length);

        for(var i = 0; i < length; i++){

            if (i % 4 === 3) {
                fields[i] = 1.0; // alpha
            }else if (i % 4 === 0) {
                fields[i] = Math.random();// use red channel for data
            }
        }

        webgl.addTextureArray(webgl.canvas.width, webgl.canvas.height, fields, true).bindToTextureUnit(program, "u_fields", "u_fieldTexSize");
    })();

    // working field data (will flip/flop each step)
    var fbA = webgl.addFrameBuffer(webgl.canvas.width, webgl.canvas.height, true);
    var fbB = webgl.addFrameBuffer(webgl.canvas.width, webgl.canvas.height, true);

    var transport_size = (input.num_blocks_i + 2) * (input.num_blocks_j + 2) * kernel_size * kernel_size;

    var transport_kernels = new Float32Array(4 * transport_size * num_fields);

    var transport_kernels_tex = webgl.addTextureArray(
        (input.num_blocks_i + 2) * kernel_size * num_fields,
        (input.num_blocks_j + 2) * kernel_size,
        transport_kernels,
        true
    ).bindToTextureUnit(program, "u_kernels", "u_kernelTexSize");

    var interaction_size = (input.num_blocks_i + 2) * (input.num_blocks_j + 2) * num_fields * num_fields;

    var interaction_kernels = new Float32Array(4 * interaction_size );

    // interactions between fields
    var interaction_kernels_tex = webgl.addTextureArray(
        (input.num_blocks_i + 2) * num_fields,
        (input.num_blocks_j + 2) * num_fields,
        interaction_kernels,
        true
    ).bindToTextureUnit(program, "u_interactions", "u_interactionTexSize");

    // triangle vertices
    webgl.addArrayFloat([
        [0, 0],
        [webgl.canvas.width, 0],
        [0, webgl.canvas.height],
        [0, webgl.canvas.height],
        [webgl.canvas.width, 0],
        [webgl.canvas.width, webgl.canvas.height]
    ]).bindToAttribute(program, "a_position");

    // texture coordinets for vertices
    webgl.addArrayFloat([
        [0.0,  0.0],
        [1.0,  0.0],
        [0.0,  1.0],
        [0.0,  1.0],
        [1.0,  0.0],
        [1.0,  1.0]
    ]).bindToAttribute(program, "a_texCoord");

    var need_update = false;

    var updateReactorBlocks = function() {

        if (need_update === false) {
            return;
        }

        transport_kernels_tex.update();
        interaction_kernels_tex.update();

        need_update = false;
    };

    output.setReactorBlock = function(block_i, block_j, reactorblock){
        need_update = true;

        var i, j, f;

        var kernels_row_size = 4 * (input.num_blocks_i + 2) * kernel_size * num_fields;

        for(f = 0; f < num_fields; f++) {

            var kernel = reactorblock.transport.get(f);
            var interaction = reactorblock.interaction.get(f);

            var kernel_offset = (block_j + 1) * kernels_row_size * kernel_size +
                4 * (block_i + 1) * kernel_size +
                (input.num_blocks_i + 2) * kernel_size * f;

            for(i = 0; i < kernel_size; i++) {

                for(j = 0; j < kernel_size; j++) {

                    transport_kernels[kernel_offset + j * kernels_row_size + 4 * i] = kernel.get(i, j);
                }
            }

            for(i = 0; i < num_fields; i++) {

                for(j = 0; j < num_fields; j++) {


                }
            }
        }
    };

    output.step = function() {
        updateReactorBlocks();

        fbA.bind(program);

        program.drawTriangles(0, 6);

        fbA.texture.bindToTextureUnit(program, "u_fields", "u_fieldTexSize");

        fbB.bind(program);

        program.drawTriangles(0, 6);

        fbB.texture.bindToTextureUnit(program, "u_fields", "u_fieldTexSize");

        webgl.bindCanvas(program);

        program.drawTriangles(0, 6);
    };


    return output;
};
