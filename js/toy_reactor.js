"use strict";

define(['jquery', "reactor_webgl", 'utilities'], function($, reactor_webgl, util) {
    //This function is called when scripts/helper/util.js is loaded.
    //If util.js calls define(), then this function is not fired until
    //util's dependencies have loaded, and the util argument will hold
    //the module value for "helper/util".


    return function() {

        $(function(){
            var fuel = reactor_webgl.makeReactorBlock({
                fast_scattering: 0.2,
                thermal_scattering: 0.95,
                moderation: 0.001,
                fast_absorption: 0.0005,
                thermal_absorption: 0.05,
                fast_fission: 1,
                thermal_fission: 1,
                neutrons_per_fission: 4,
                prompt_factor: 0.98,
                delayed_factor: 0.5,
                fission_energy: 0.0001,
                conductivity: 0.5,
                specific_heat: 1,
                cooling_rate: 0
            });


            var moderator = reactor_webgl.makeReactorBlock({
                fast_scattering: 0.1,
                thermal_scattering: 0.9,
                moderation: 0.02,
                fast_absorption: 0,
                thermal_absorption: 0,
                fast_fission: 0,
                thermal_fission: 0,
                neutrons_per_fission: 0,
                prompt_factor: 0,
                delayed_factor: 0,
                fission_energy: 0,
                conductivity: 0.5,
                specific_heat: 1,
                cooling_rate: 0
            });

            var control_absorption = 0.07;

            var absorber_input = {
                fast_scattering: 0.1,
                thermal_scattering: 0.9,
                moderation: 0.01,
                fast_absorption: 0.0005,
                thermal_absorption: control_absorption,
                fast_fission: 0,
                thermal_fission: 0,
                neutrons_per_fission: 0,
                prompt_factor: 0,
                delayed_factor: 0,
                fission_energy: 0,
                conductivity: 0.5,
                specific_heat: 1,
                cooling_rate: 0
            };

            var absorber = reactor_webgl.makeReactorBlock(absorber_input);

            var reflector = reactor_webgl.makeReactorBlock({
                fast_scattering: 0.2,
                thermal_scattering: 0.97,
                moderation: 0.001,
                fast_absorption: 0,
                thermal_absorption: 0,
                fast_fission: 0,
                thermal_fission: 0,
                neutrons_per_fission: 0,
                prompt_factor: 0,
                delayed_factor: 0,
                fission_energy: 0,
                conductivity: 0.5,
                specific_heat: 1,
                cooling_rate: 0
            });

            var coolant = reactor_webgl.makeReactorBlock({
                fast_scattering: 0.1,
                thermal_scattering: 0.9,
                moderation: 0.01,
                fast_absorption: 0,
                thermal_absorption: 0,
                fast_fission: 0,
                thermal_fission: 0,
                neutrons_per_fission: 0,
                prompt_factor: 0,
                delayed_factor: 0,
                fission_energy: 0,
                conductivity: 0.5,
                specific_heat: 1,
                cooling_rate: 0.005
            });

            var fastColormap = util.makeColorMap({min: 0, max: 1, n: 256, params: util.colormap_presets.violet});
            var thermalColormap = util.makeColorMap({min: 0, max: 1, n: 256, params: util.colormap_presets.blue_cyan});
            var fissionColormap = util.makeColorMap({min: 0, max: 0.01, n: 256, params: util.colormap_presets.green});
            var tempColormap = util.makeColorMap({min: 0.03, max: 0.1, n: 256, params: util.colormap_presets.hot}); //300K to 1000K initially


            var reactor = reactor_webgl.makeReactor({
                num_blocks_i : 10,
                num_blocks_j : 10,
                num_cells : 50,
                colormaps : [
                    fastColormap,
                    thermalColormap,
                    fissionColormap,
                    null,
                    tempColormap,
                ]
            });

            for (var i = 0; i < 10; i++)
            {
                for (var j = 0; j < 10; j++)
                {
                    reactor.setReactorBlock(i, j, moderator);
                }
            }

            reactor.setReactorBlock(2, 2, fuel);

            var start = 0;
            var duration = 20*1000;
            var increase = true;

            var step = function(timestamp) {

                if (start === 0) {
                    start = timestamp;
                }

                if (timestamp - start > duration) {
                    return;
                }

                if (increase && timestamp - start > 5000) {
                    fissionColormap.max = 0.02;

                    reactor.updateColorscale();

                    increase = false;
                }

                reactor.step();

                reactor.renderToCanvas(0);
                var fast_canvas = document.getElementById("fast");
                var fast_ctx = fast_canvas.getContext('2d');
                fast_ctx.clearRect(0, 0, fast_canvas.width, fast_canvas.height);
                fast_ctx.drawImage(reactor.canvas, 50, 50, 500, 500, 0, 0, 500, 500);

                reactor.renderToCanvas(2);
                var slow_canvas = document.getElementById("slow");
                var slow_ctx = slow_canvas.getContext('2d');
                slow_ctx.clearRect(0, 0, slow_canvas.width, slow_canvas.height);
                slow_ctx.drawImage(reactor.canvas, 50, 50, 500, 500, 0, 0, 500, 500);

                requestAnimationFrame(step);
            };

            requestAnimationFrame(step);
        });
    };
});
