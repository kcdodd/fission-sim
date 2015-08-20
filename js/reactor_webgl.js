"use strict";

define(['structures', 'utilities'], function (struct, util) {

    var exports = {};

    /**
     * @typedef {Object} ReactorBlockInput
     *
     * @property {number} [fast_scattering]
     * @property {number} [thermal_scattering]
     * @property {number} [moderation]
     * @property {number} [fast_absorption]
     * @property {number} [thermal_absorption]
     * @property {number} [fast_fission]
     * @property {number} [thermal_fission]
     * @property {number} [neutrons_per_fission]
     * @property {number} [prompt_factor]
     * @property {number} [delayed_factor]
     * @property {number} [fission_energy]
     * @property {number} [conductivity]
     * @property {number} [specific_heat]
     * @property {number} [cooling_rate]
     */
    /**
     * @typedef {Object} ReactorBlock
     */
    /**
     *
     * @param {ReactorBlockInput} input structure
     * @returns {ReactorBlock}
     */
    exports.makeReactorBlock = function (input){

        util.validate_object(input, {
            fast_scattering : 'number',
            thermal_scattering : 'number',
            moderation : 'number',
            fast_absorption : 'number',
            fast_fission : 'number',
            thermal_fission : 'number',
            neutrons_per_fission : 'number',
            prompt_factor : 'number',
            delayed_factor : 'number',
            fission_energy : 'number',
            conductivity : 'number',
            specific_heat : 'number',
            cooling_rate : 'number'
        });

        var output = {};


        output.transport = struct.List1D({num: 5});

        // 0: fast neutrons
        output.transport.set(0, struct.Float2D({num_i: 5, num_j: 5}));

        // 1: thermal neutrons
        output.transport.set(1, struct.Float2D({num_i: 5, num_j: 5}));
        //output.transport.set(1, null);

        // 2: fissions (no transport)
        output.transport.set(2, null);

        // 3: delayed neutrons (no transport)
        output.transport.set(3, null);

        // 4: temperature
        output.transport.set(4, struct.Float2D({num_i: 5, num_j: 5}));
        //output.transport.set(4, null);


        output.interaction = struct.Float2D({num_i: 5, num_j: 5});




        output.compute = function() {


            compute_transport(input.fast_scattering, output.transport.get(0));


            compute_transport(input.thermal_scattering, output.transport.get(1));


            compute_transport(input.conductivity, output.transport.get(4));


            // fast to fast
            output.interaction.set(0, 0, -(input.fast_absorption + input.moderation) + input.fast_absorption * input.fast_fission * input.prompt_factor * input.neutrons_per_fission);
            // thermal to fast
            output.interaction.set(0, 1, input.thermal_absorption * input.thermal_fission * input.prompt_factor * input.neutrons_per_fission);
            // fissions to fast (no interaction)
            output.interaction.set(0, 2, 0);
            // delayed to fast
            output.interaction.set(0, 3, input.delayed_factor);
            // temp. to fast (no interaction)
            output.interaction.set(0, 4, 0);


            // fast to thermal
            output.interaction.set(1, 0, input.moderation);
            // thermal to thermal
            output.interaction.set(1, 1, -input.thermal_absorption);
            // fissions to thermal (no interaction)
            output.interaction.set(1, 2, 0);
            // delayed to thermal (no interaction)
            output.interaction.set(1, 3, 0);
            // temp. to thermal (no interaction)
            output.interaction.set(1, 3, 0);


            // fast to fissions
            output.interaction.set(2, 0, input.fast_absorption * input.fast_fission);
            // thermal to fissions
            output.interaction.set(2, 1, input.thermal_absorption * input.thermal_fission);
            // fissions to fissions
            output.interaction.set(2, 2, 0);
            // delayed to fissions (no interaction)
            output.interaction.set(2, 3, 0);
            // temp. to fissions (no interaction)
            output.interaction.set(2, 4, 0);

            // fast to delayed
            output.interaction.set(3, 0, input.fast_absorption * input.fast_fission * (1 - input.prompt_factor) * input.neutrons_per_fission);
            // thermal to delayed
            output.interaction.set(3, 1, input.thermal_absorption * input.thermal_fission * (1 - input.prompt_factor) * input.neutrons_per_fission);
            // fissions to delayed
            output.interaction.set(3, 2, 0);
            // delayed to delayed (no interaction)
            output.interaction.set(3, 3, 0);
            // temp. to delayed (no interaction)
            output.interaction.set(3, 4, 0);

            // fast to temp. (no interaction)
            output.interaction.set(4, 0, 0);
            // thermal to temp. (no interaction)
            output.interaction.set(4, 1, 0);
            // fissions to temp.
            output.interaction.set(4, 2, input.fission_energy / input.specific_heat);
            // delayed to temp. (no interaction)
            output.interaction.set(4, 3, 0);
            // temp. to temp.
            output.interaction.set(4, 4,  -input.cooling_rate / input.specific_heat);

        };

        var compute_transport = function(s, kernel) {

            var f1 = 0.5 * (1 + Math.cos(s * Math.PI));
            var f2 = 0.5 * (1 - Math.cos(s * 2 * Math.PI));
            var f3 = 0.5 * (1 - Math.cos(s * Math.PI));

            for (var i = 0; i < 5; i++)
            {
                for (var j = 0; j < 5; j++)
                {
                    if (i === 0 || i === 4 || j === 0 || j === 4) {

                        kernel.set(i, j, f1);

                    } else if (i !== 2 || j !== 2) {

                        kernel.set(i, j, f2);

                    } else {

                        kernel.set(i, j, f3);
                    }

                }
            }


            kernel.scale(1.0 / kernel.sum());
        };

        output.compute();

        return output;
    };

    /**
     *
     * @typedef {Object} ReactorInput
     *
     * @property {number} [num_blocks_i]
     * @property {number} [num_blocks_j]
     * @property {number} [num_cells]
     * @property {Array} [colormaps]
     */
    exports.makeReactor = function(input){
        util.validate_object(input, {
            num_blocks_i : 'number',
            num_blocks_j : 'number',
            num_cells : 'number',
            colormaps : 'object'
        });

        var newReactor = {};

        var num_fields = 5;
        var kernel_size = 5;
        var kernel_center = (kernel_size - 1)/2;

        // not all fields need convolution, or interaction with every other field.
        // fast, thermal, fissions, delayed, temperature
        var compute_convolve = [true, true, false, false, true];
        var compute_interaction = [
            [true, true, false, true, false], //no fissions, temp. to fast
            [true, true, false, false, false], // no fissions, delayed, temp. to thermal
            [true, true, false, false, false], // no fissions, delayed, temp. to fissions
            [true, true, false, false, false], // no fissions, delayed, temp. to delayed
            [false, false, true, false, true] // no fast, thermal, or delayed to temp.
        ];

        var transport_size = (input.num_blocks_i + 2) * (input.num_blocks_j + 2) * kernel_size * kernel_size;
        var interaction_size = (input.num_blocks_i + 2) * (input.num_blocks_j + 2) * num_fields * num_fields;

        var transport_kernels = [];
        var boundaries = [];
        var colors = [];
        var scales = [];
        var intercepts = [];

        // initialize arrays for each field
        for(var i =0; i < num_fields; i++) {
            transport_kernels[i] = new Float32Array(4 * transport_size);
            boundaries[i] = new Float32Array(4 * (input.num_blocks_i + 2) * (input.num_blocks_j + 2));
            colors[i] = new Float32Array(4 * 256);
        }

        var interactions = new Float32Array(4 * interaction_size );

        // boundary helper function to set boundary values on a field.
        var setBoundary = function(blockfield, value) {
            for(var bi = 0; bi < (input.num_blocks_i + 2) * (input.num_blocks_j + 2); bi++) {
                blockfield[4 * bi] = 1.0;
                blockfield[4 * bi + 2] = 0.0;
            }


            for(var bi = 0; bi < input.num_blocks_i + 2; bi++) {
                blockfield[4 * bi] = 0.0;
                blockfield[4 * bi + 4 * (input.num_blocks_i + 2)*(input.num_blocks_j + 1)] = 0.0;

                blockfield[4 * bi + 2] = value;
                blockfield[4 * bi + 4 * (input.num_blocks_i + 2)*(input.num_blocks_j + 1) + 2] = value;
            }

            for(var bj = 0; bj < input.num_blocks_j + 2; bj++) {
                blockfield[4 * bj * (input.num_blocks_i + 2)] = 0.0;
                blockfield[4 * bj * (input.num_blocks_i + 2) + 4 * (input.num_blocks_i + 1)] = 0.0;

                blockfield[4 * bj * (input.num_blocks_i + 2) + 2] = value;
                blockfield[4 * bj * (input.num_blocks_i + 2) + 4 * (input.num_blocks_i + 1) + 2] = value;
            }
        }

        // set the boundary values
        setBoundary(boundaries[0], 0.0);
        setBoundary(boundaries[1], 0.0);
        setBoundary(boundaries[2], 0.0);
        setBoundary(boundaries[3], 0.0);
        setBoundary(boundaries[4], 0.0293); // temperature is set at 293K, max is 10,000K


        for(var i = 0; i < num_fields; i++) {
            var colorarray = colors[i];

            for(var j = 0; j < 256; j++) {
                var offset = 4*j;

                if (input.colormaps[i]) {
                    colorarray[offset] = input.colormaps[i].mapr[j*(input.colormaps[i].n-  1)/255]/255.0;
                    colorarray[1 + offset] = input.colormaps[i].mapg[j*(input.colormaps[i].n -  1)/255]/255.0;
                    colorarray[2 + offset] = input.colormaps[i].mapb[j*(input.colormaps[i].n -  1)/255]/255.0;
                }else{
                    colorarray[offset] = 0;
                    colorarray[1 + offset] = 0;
                    colorarray[2 + offset] = 0;
                }

                colorarray[3 + offset] = 1.0;
            }

        }


        var N = function(num) {
            return num.toFixed(20);
        };

        var step_vert = function() {
            var src_arr = [
                "attribute vec2 a_position;",
                "attribute vec2 a_texCoord;",
                //"uniform vec2 u_resolution;",
                "varying vec2 v_texCoord;",

                "void main() {",
                "    gl_Position = vec4(a_position, 0, 1);",

                "    v_texCoord = a_texCoord;",
                "}",
            ];

            return src_arr.join('\n');
        } // step_vert()

        var render_vert = function() {
            var src_arr = [
                "attribute vec2 a_position;",
                "attribute vec2 a_texCoord;",
                //"uniform vec2 u_resolution;",
                "varying vec2 v_texCoord;",

                "void main() {",
                "    gl_Position = vec4(a_position, 0, 1);",

                "    v_texCoord = a_texCoord;",
                "}",
            ];

            return src_arr.join('\n');
        } // render_vert()


        var convolution_frag = function(target_field) {
            var i, j;

            var src_texture_fields = [];

            for(i = 0; i < num_fields; i++) {
                src_texture_fields.push("uniform sampler2D u_field_" + i + ";");
            }

            var src_arr = [
                "precision mediump float;",

                //cellblock information
                "uniform vec2 u_numBlocks;",

                // fields
                "uniform vec2 u_fieldTexSize;",

                src_texture_fields.join("\n"),

                // kernels
                "uniform vec2 u_kernelTexSize;",
                "uniform sampler2D u_kernels;",

                // field interactions
                "uniform vec2 u_interactionTexSize;",
                "uniform sampler2D u_interactions;",

                "uniform vec2 u_boundaryTexSize;",
                "uniform sampler2D u_boundary;",

                // the texCoords passed in from the vertex shader.
                "varying vec2 v_texCoord;",

                "void main() {",

                "    vec2 curBlock = floor(1.0001*v_texCoord * u_fieldTexSize / " + N(input.num_cells) + ");",


                "    vec2 kernelCenter = (curBlock * " + N(kernel_size) + " + vec2(" + N(kernel_size/2.0) + ", " + N(kernel_size/2.0) + ")) / u_kernelTexSize;",
                "    vec2 interactionCorner = (curBlock * " + N(num_fields) + ") / u_interactionTexSize;",

            ];

            var src_kernel = [];


            var kernel_dx = 1.0/((input.num_blocks_i + 2) * kernel_size);
            var kernel_dy = 1.0/((input.num_blocks_j + 2) * kernel_size);

            var field_dx = 1.0/((input.num_blocks_i + 2) * input.num_cells);
            var field_dy = 1.0/((input.num_blocks_j + 2) * input.num_cells);

            var interaction_dx = 1.0/((input.num_blocks_i + 2) * num_fields);
            var interaction_dy = 1.0/((input.num_blocks_j + 2) * num_fields);

            if (compute_convolve[target_field]) {

                for(i = -kernel_center; i <= kernel_center; i++) {
                    for(j = -kernel_center; j <= kernel_center; j++) {
                        src_kernel.push("        texture2D(u_kernels, kernelCenter + vec2(" + N(i*kernel_dx) + "," + N(j*kernel_dy) + ")).r * texture2D(u_field_" + target_field + ", v_texCoord + vec2(" + N(i*field_dx) + "," + N(j*field_dy) + ")).r");
                    }
                }
            }

            var src_interaction = [];

            for(i = 0; i < num_fields; i++) {
                if(compute_interaction[target_field][i]) {
                    src_kernel.push("        texture2D(u_interactions, interactionCorner + vec2(" + N((target_field + 0.5) * interaction_dx) + ", " + N((i + 0.5) * interaction_dy) + ")).r * texture2D(u_field_" + i + ", v_texCoord).r");
                }
            }

            src_arr = src_arr.concat([
                "    vec4 bc = texture2D(u_boundary, (curBlock + vec2(0.5,0.5)) / u_boundaryTexSize);",
                "    gl_FragColor = vec4(bc.r * (",
                src_kernel.join(" +\n"),
                "        ) + bc.b, 0.0, 0.0, 1.0);",
                "}"
            ]);

            var src = src_arr.join('\n');

            //console.log(src);

            return src;

        }; // convolution_frag()

        var colorgradient_frag = function() {
            var src_arr = [
                "precision mediump float;",

                // fields
                //"uniform vec2 u_fieldTexSize;",
                "uniform sampler2D u_field;",

                // coloring information
                //"uniform vec2 u_colorsTexSize;",
                "uniform sampler2D u_colors;",
                "uniform float u_scale;",
                "uniform float u_intercept;",

                // the texCoords passed in from the vertex shader.
                "varying vec2 v_texCoord;",

                "void main() {",
                    "gl_FragColor = texture2D(u_colors, vec2(u_scale * texture2D(u_field, v_texCoord).r + u_intercept, 0.5));",
                "}"
            ];


            return src_arr.join('\n');
        }; // colorgradient_frag()

        var copy_frag = function() {
            var src_arr = [
                "precision mediump float;",

                "uniform sampler2D source;",

                // the texCoords passed in from the vertex shader.
                "varying vec2 v_texCoord;",

                "void main() {",
                "    gl_FragColor = texture2D(source, v_texCoord);",
                "}"
            ];


            return src_arr.join('\n');
        }; // copy_frag()

        // create canvas element for webgl to work on
        var canvas = document.createElement("CANVAS");
        canvas.id = "reactor_webgl_canvas";
        canvas.width = (input.num_blocks_i + 2) * input.num_cells;
        canvas.height = (input.num_blocks_j + 2) * input.num_cells;
        canvas.style.display = "none";

        document.body.appendChild(canvas);

        newReactor.canvas = canvas;

        var webgl = util.webGL("reactor_webgl_canvas");

        webgl.enableFloatTexture();

        var vertex_positions = webgl.addVertexData([
            [-1, 1],
            [1, 1],
            [-1, -1],
            [-1, -1],
            [1, 1],
            [1, -1]
        ]);

        var render_vertex_positions = webgl.addVertexData([
            [-1, -1],
            [1, -1],
            [-1, 1],
            [-1, 1],
            [1, -1],
            [1, 1]
        ]);

        // texture coordinets for vertices
        var texture_coordinates = webgl.addVertexData([
            [0.0,  1.0],
            [1.0,  1.0],
            [0.0,  0.0],
            [0.0,  0.0],
            [1.0,  1.0],
            [1.0,  0.0]
        ]);

        var render_texture_coordinates = webgl.addVertexData([
            [0.0,  0.0],
            [1.0,  0.0],
            [0.0,  1.0],
            [0.0,  1.0],
            [1.0,  0.0],
            [1.0,  1.0]
        ]);

        // interactions between fields
        var interaction_tex = webgl.addTextureArray(
            (input.num_blocks_i + 2) * num_fields,
            (input.num_blocks_j + 2) * num_fields,
            interactions,
            true
        );

        var transport_kernels_tex = [];
        var boundary_tex = [];
        var colors_tex = [];

        // working field data (will flip/flop each step)
        var field_buffers_A = [];
        var field_buffers_B = [];

        for(var i = 0; i < num_fields; i++) {
            field_buffers_A.push(webgl.addFrameBuffer(webgl.canvas.width, webgl.canvas.height, true));
            field_buffers_B.push(webgl.addFrameBuffer(webgl.canvas.width, webgl.canvas.height, true));

            transport_kernels_tex[i] = webgl.addTextureArray(
                (input.num_blocks_i + 2) * kernel_size,
                (input.num_blocks_j + 2) * kernel_size,
                transport_kernels[i],
                true
            );

            boundary_tex[i] = webgl.addTextureArray(
                (input.num_blocks_i + 2),
                (input.num_blocks_j + 2),
                boundaries[i],
                true
            );

            colors_tex[i] = webgl.addTextureArray(
                256,
                1,
                colors[i],
                true
            );
        }

        var step_programsA = [];
        var step_programsB = [];
        var render_programs = [];

        for(var i = 0; i < num_fields; i++) {

            var programStep = webgl.linkProgram({
                vertexShaderSource : step_vert(),
                fragmentShaderSource : convolution_frag(i)
            });

            step_programsA.push(programStep);


            transport_kernels_tex[i].bind(programStep, "u_kernels", "u_kernelTexSize");

            interaction_tex.bind(programStep, "u_interactions", "u_interactionTexSize");

            boundary_tex[i].bind(programStep, "u_boundary", "u_boundaryTexSize");

            // triangle vertices
            vertex_positions.bind(programStep, "a_position");

            texture_coordinates.bind(programStep, "a_texCoord");

            programStep.setUniformFloat("u_fieldTexSize", [webgl.canvas.width, webgl.canvas.height]);

            for(var j = 0; j < num_fields; j++) {

                field_buffers_B[j].texture.bind(programStep, "u_field_" + j);
            }


            // This is the program used when rendering fields back to be plotted
            var programRender = webgl.linkProgram({
                vertexShaderSource : render_vert(),
                fragmentShaderSource : colorgradient_frag()
            });

            render_programs.push(programRender);


            colors_tex[i].bind(programRender, "u_colors");

            // triangle vertices
            vertex_positions.bind(programRender, "a_position");

            // texture coordinets for vertices
            render_texture_coordinates.bind(programRender, "a_texCoord");

            field_buffers_B[i].texture.bind(programRender, "u_field");
        }

        for(var i = 0; i < num_fields; i++) {

            var programStep = webgl.linkProgram({
                vertexShaderSource : step_vert(),
                fragmentShaderSource : convolution_frag(i)
            });

            step_programsB.push(programStep);

            transport_kernels_tex[i].bind(programStep, "u_kernels", "u_kernelTexSize");

            interaction_tex.bind(programStep, "u_interactions", "u_interactionTexSize");

            boundary_tex[i].bind(programStep, "u_boundary", "u_boundaryTexSize");

            // triangle vertices
            vertex_positions.bind(programStep, "a_position");

            texture_coordinates.bind(programStep, "a_texCoord");

            programStep.setUniformFloat("u_fieldTexSize", [webgl.canvas.width, webgl.canvas.height]);

            for(var j = 0; j < num_fields; j++) {

                field_buffers_A[j].texture.bind(programStep, "u_field_" + j);
            }
        }

        // initiate with random fields
        (function(){
            var programRender = webgl.linkProgram({
                vertexShaderSource : step_vert(),
                fragmentShaderSource : copy_frag()
            });

            //programRender.addUniformFloat("u_resolution", [webgl.canvas.width, webgl.canvas.height]);

            // triangle vertices
            vertex_positions.bind(programRender, "a_position");

            // texture coordinets for vertices
            texture_coordinates.bind(programRender, "a_texCoord");

            var length = webgl.canvas.width * webgl.canvas.height * 4;

            var fields = new Float32Array(length);

            // initial fast neutrons is completely random
            for(var i = 0; i < length; i++){

                if (i % 4 === 3) {
                    fields[i] = 1.0; // alpha
                }else if (i % 4 === 0) {
                    fields[i] = Math.random();// use red channel for data
                }
            }

            var initial_tex = webgl.addTextureArray(
                webgl.canvas.width,
                webgl.canvas.height,
                fields,
                true
            ).bind(programRender, "source");

            programRender.drawTriangles(0, 6, field_buffers_B[0]);

            // initial temperature is 293K = 0.0293
            for(var i = 0; i < length; i++){

                if (i % 4 === 3) {
                    fields[i] = 1.0; // alpha
                }else if (i % 4 === 0) {
                    fields[i] = 0.0293;// use red channel for data
                }
            }

            initial_tex.update();

            programRender.drawTriangles(0, 6, field_buffers_B[4]);
        })();


        // used to change parameters

        var need_update = false;

        var updateReactorBlocks = function() {

            if (need_update === false) {
                return;
            }

            for(var i = 0; i < num_fields; i++) {
                transport_kernels_tex[i].update();
            }

            interaction_tex.update();


            need_update = false;
        };

        var needUpdateColormaps = true;

        var updateColorscale = function() {
            if (!needUpdateColormaps)
            {
                return;
            }

            for(var i = 0; i < num_fields; i++) {

                if (input.colormaps[i]) {
                    var scale = 1.0/(input.colormaps[i].max - input.colormaps[i].min);
                    render_programs[i].setUniformFloat("u_scale", scale);
                    render_programs[i].setUniformFloat("u_intercept", -scale * input.colormaps[i].min);

                }

            }

            needUpdateColormaps = false;

        };

        newReactor.updateColorscale = function() {
            needUpdateColormaps = true;
        };



        newReactor.setReactorBlock = function(block_i, block_j, reactorblock){
            need_update = true;

            var i, j, f;

            var kernels_row_size = 4 * (input.num_blocks_i + 2) * kernel_size;
            var kernel_offset = (block_j + 1) * kernels_row_size * kernel_size + 4 * (block_i + 1) * kernel_size;

            var interaction_row_size = 4 * (input.num_blocks_i + 2) * num_fields;
            var interaction_offset = (block_j + 1) * interaction_row_size * num_fields + 4 * (block_i + 1) * num_fields;

            for(f = 0; f < num_fields; f++) {

                var kernel = reactorblock.transport.get(f);

                if (typeof kernel !== 'undefined' && kernel !== null) {

                    for(i = 0; i < kernel_size; i++) {

                        for(j = 0; j < kernel_size; j++) {

                            transport_kernels[f][kernel_offset + j * kernels_row_size + 4 * i] = kernel.get(i, j);
                        }

                    }

                }

                for(var source_field = 0; source_field < num_fields; source_field++) {

                    interactions[interaction_offset + source_field * interaction_row_size + 4 * f] = reactorblock.interaction.get(f, source_field);
                }

            }
        };

        // step simulation

        newReactor.step = function() {
            updateReactorBlocks();


            for(var i = 0; i < num_fields; i++) {
                step_programsA[i].drawTriangles(0, 6, field_buffers_A[i]);
            }

            for(var i = 0; i < num_fields; i++) {
                step_programsB[i].drawTriangles(0, 6, field_buffers_B[i]);
            }

        };

        // creates output from colormaps
        newReactor.renderToCanvas = function(field, array) {
            updateColorscale();

            render_programs[field].drawTriangles(0, 6);

            if (array) {
                webgl.getCanvasPixels(array);
            }
        };

        var fb_96x96 = webgl.addFrameBuffer(96, 96, true);
        var maxTemp = util.webgl_max({in: field_buffers_B[4], out: fb_96x96});
        var fb_24x24 = webgl.addFrameBuffer(24, 24, true);
        var maxTemp2 = util.webgl_max({in: fb_96x96, out: fb_24x24});
        var fb_6x6 = webgl.addFrameBuffer(6, 6, true);
        var maxTemp3 = util.webgl_max({in: fb_24x24, out: fb_6x6});

        var outArray_6x6 = new Float32Array(4*6*6);

        newReactor.maxTemp = function() {
            maxTemp.compute();
            maxTemp2.compute();
            maxTemp3.compute();

            fb_6x6.readPixels(outArray_6x6);
            var max = 0;

            for(var i = 0; i < 36; i++) {
                max = Math.max(max, outArray_6x6[4*i]);
            }

            return max;
        };



        var avgFis = util.webgl_avg({in: field_buffers_B[2], out: fb_96x96});
        var avgFis2 = util.webgl_avg({in: fb_96x96, out: fb_24x24});
        var avgFis3 = util.webgl_avg({in: fb_24x24, out: fb_6x6});

        newReactor.avgFissions = function() {
            avgFis.compute();
            avgFis2.compute();
            avgFis3.compute();

            fb_6x6.readPixels(outArray_6x6);
            var avg = 0;

            for(var i = 0; i < 36; i++) {
                avg += outArray_6x6[4*i];
            }

            return avg/36.0;
        };

        return newReactor;
    };

    return exports;

});
