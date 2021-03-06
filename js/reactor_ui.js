"use strict";

define(['jquery', 'structures', 'utilities', 'reactor_webgl', 'jquery_ui'], function ($, struct, util, reactor_webgl) {

    var exports = {};

    exports.init = function() {
        $(function() {

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
                fission_energy: 1,
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

            var cellblock = struct.makeCellblock2D({
                num_blocks_i: 11,
                num_blocks_j: 11,
                cells_per_block: 10,
                num_fields: 5,
                max_kernel_size: 5
            });

            var compFigure = util.makeCanvasFigure({id: "components_figure"});

            var moderatorImage = document.getElementById("moderator_image");
            var fuelImage = document.getElementById("fuel_image");
            var reflectorImage = document.getElementById("reflector_image");
            var absorberImage = document.getElementById("absorber_image");
            var coolantImage = document.getElementById("coolant_image");


            var controller = {
                image: moderatorImage,
                block_type: moderator
            };


            for (var i = 0; i < 11; i++)
            {
                for (var j = 0; j < 11; j++)
                {
                    var init_image;
                    if (i === 4 && j === 4 || i === 5 && j === 5) {
                        init_image = fuelImage;
                        cellblock.blocks.set(i, j, fuel);
                    }else if (i === 4 && j === 5 || i === 5 && j === 4){
                        init_image = coolantImage;
                        cellblock.blocks.set(i, j, coolant);
                    }else{
                        cellblock.blocks.set(i, j, moderator);
                        init_image = moderatorImage;
                    }

                    // must create a closure to remember the i, j at this moment
                    (function (_i, _j) {

                        var areaInput = {
                            x: i * 40,
                            y: j * 40,
                            width: 40,
                            height: 40,
                            image: init_image
                        };

                        areaInput.callback = function(figure) {

                            areaInput.image = controller.image;

                            // this is local i, j
                            cellblock.blocks.set(_i, _j, controller.block_type);

                            figure.redraw(0);
                        };

                        var area = util.makeImageClickArea(areaInput);

                        compFigure.addLayer(area);

                        compFigure.addSelectable(area);

                    })(i, j); // called with current i, j

                }
            }

            compFigure.redraw(0);



            var fastfield = cellblock.fields.get(0);
            var tempfield = cellblock.fields.get(4);

            for (var j = 2; j < fastfield.num_j - 2; j++)
            {
                for (var i = 2; i < fastfield.num_i - 2; i++)
                {
                    fastfield.set(i, j, 100 * Math.random());

                }
            }

            for (var j = 0; j < tempfield.num_j; j++)
            {
                for (var i = 0; i < tempfield.num_i; i++)
                {

                    tempfield.set(i, j, 293);
                }
            }


            var fastFigure = util.makeCanvasFigure({id: "fast_figure"});

            var fastColormap = util.makeColorMap({min: 0, max: 1, n: 200, params: util.colormap_presets.violet});

            fastFigure.addLayer(util.makePlot2DArea({
                data_array: fastfield,
                colormap: fastColormap,
                x: 0,
                y: 0,
                width: 400,
                height: 400
            }));

            fastFigure.addLayer(util.makeColorBar({
                colormap: fastColormap,
                x: 410,
                y: 0,
                width: 50,
                height: 200
            }));



            var thermalFigure = util.makeCanvasFigure({id: "thermal_figure"});

            var thermalColormap = util.makeColorMap({min: 0, max: 1, n: 200, params: util.colormap_presets.blue_cyan});


            thermalFigure.addLayer(util.makePlot2DArea({
                data_array: cellblock.fields.get(1),
                colormap: thermalColormap,
                x: 0,
                y: 0,
                width: 400,
                height: 400
            }));

            thermalFigure.addLayer(util.makeColorBar({
                colormap: thermalColormap,
                x: 410,
                y: 0,
                width: 50,
                height: 200
            }));

            var fissionFigure = util.makeCanvasFigure({id: "fission_figure"});

            var fissionColormap = util.makeColorMap({min: 0, max: 1, n: 200, params: util.colormap_presets.green});

            fissionFigure.addLayer(util.makePlot2DArea({
                data_array: cellblock.fields.get(2),
                colormap: fissionColormap,
                x: 0,
                y: 0,
                width: 400,
                height: 400
            }));

            fissionFigure.addLayer(util.makeColorBar({
                colormap: fissionColormap,
                x: 410,
                y: 0,
                width: 50,
                height: 200
            }));

            var tempFigure = util.makeCanvasFigure({id: "temp_figure"});

            var tempColormap = util.makeColorMap({min: 300, max: 1000, n: 200, params: util.colormap_presets.hot});

            tempFigure.addLayer(util.makePlot2DArea({
                data_array: cellblock.fields.get(4),
                colormap: tempColormap,
                x: 0,
                y: 0,
                width: 400,
                height: 400
            }));

            tempFigure.addLayer(util.makeColorBar({
                colormap: tempColormap,
                x: 410,
                y: 0,
                width: 50,
                height: 200
            }));

            var animation = util.makeAnimation();

            animation.addFigure(fastFigure);

            animation.addFigure(thermalFigure);

            animation.addFigure(fissionFigure);

            animation.addFigure(tempFigure);

            var last_t = 0;
            var sum, last_sum = 0;

            animation.beginFrame = function(t) {

                cellblock.step();

                var max, min;

                max = cellblock.fields.get(0).max();

                if (max > fastColormap.max || max < 0.3 * fastColormap.max) {

                    fastColormap.max = Math.pow(10, 0.5 * Math.ceil(2 * Math.log10(max)));
                    console.log(fastColormap.max);
                }

                max = cellblock.fields.get(1).max();

                if (max > thermalColormap.max || max < 0.3 * thermalColormap.max) {

                    thermalColormap.max = Math.pow(10, 0.5 * Math.ceil(2 * Math.log10(max)));
                }

                max = cellblock.fields.get(2).max();

                if (max > fissionColormap.max || max < 0.3 * fissionColormap.max) {

                    fissionColormap.max = Math.pow(10, 0.5 * Math.ceil(2 * Math.log10(max)));
                }

                sum = cellblock.fields.get(2).sum();

                if (t !== 0) {
                    document.getElementById("power").innerText = sum.toExponential(2);

                    var crit = (sum - last_sum) / sum + 1;

                    document.getElementById("growth_rate").innerText = ((crit - 1) / crit).toExponential(2);

                    var tempK = cellblock.fields.get(4).max();
                    var tempF = 1.8 * (tempK - 273) + 32;

                    $("#core_temp").html(tempK.toFixed(0) + " K (" + tempF.toFixed(0) + "&deg; F)");
                }

                last_t = t;
                last_sum = sum;

            };

            animation.fpsCallback = function(fps) {
                document.getElementById("fpsstatus").innerText = fps;
            };




            var obj = {};


            $("#loadfile").click(function() {
                $("#loaderror").hide("fast");
                $("#loadsuccess").hide("fast");

                var x = document.getElementById("filein");
                var file = x.files[0];

                var reader = new FileReader();

                reader.onload = function(evt) {

                    try {
                        obj = JSON.parse(reader.result);

                        $("#loadsuccess").show("fast");

                        document.getElementById("loadstatussuccess").innerText = x.files[0].name + " loaded into project.";

                    } catch (err) {
                        $("#loaderror").show("fast");

                        document.getElementById("loadstatuserror").innerText = x.files[0].name + " could not be loaded into project.";
                    }



                };

                reader.readAsText(file);



            });

            var objurl;
            var a;
            var save_version = 0;

            $("#createfile").click(function() {

                if (typeof a !== 'undefined')
                {
                    document.getElementById("savestatus").removeChild(a);

                }

                if (typeof objurl !== 'undefined') {
                    objurl.revoke();
                }

                save_version++;

                a = document.createElement('a');
                a.download = "filename.json";
                objurl = objToURL(obj);
                a.href = objurl.url;
                a.textContent = 'Download Save File v' + save_version;


                document.getElementById("savestatus").appendChild(a);

            });



            var closeAllDialogs = function() {
                $("#savedialog").dialog("close");
                $("#loaddialog").dialog("close");
            };

            $("#menu").menu({
                items: "> :not(.ui-widget-header)"
            });

            $("#loaddialog").dialog({
                autoOpen: false,
                position: {my: "left top", at: "right+10 top", of: "#menu"}
            });

            $("#loadbutton").click(function() {
                closeAllDialogs();
                $("#loaderror").hide("fast");
                $("#loadsuccess").hide("fast");

                $("#loaddialog").dialog("open");
            });

            $("#savedialog").dialog({
                autoOpen: false,
                position: {my: "left top", at: "right+10 top", of: "#menu"}
            });

            $("#savebutton").click(function() {
                closeAllDialogs();
                $("#savedialog").dialog("open");


            });

            $("#runicon").toggleClass("ui-icon-play", true);
            $("#runicon").toggleClass("ui-icon-pause", false);
            document.getElementById("runstatus").innerText = "Run";

            $("#runbutton").click(function() {

                if (animation.animate === true) {

                    animation.animate = false;

                    $("#runicon").toggleClass("ui-icon-play", true);
                    $("#runicon").toggleClass("ui-icon-pause", false);
                    document.getElementById("runstatus").innerText = "Run";


                } else {
                    animation.animate = true;

                    $("#runicon").toggleClass("ui-icon-play", false);
                    $("#runicon").toggleClass("ui-icon-pause", true);
                    document.getElementById("runstatus").innerText = "Pause";
                }

            });

            // function to tie button to dialog panel
            function button_to_dialog(button, button_check, dialog, dialog_options) {

                $(dialog).dialog(dialog_options);



                $(dialog).bind('dialogclose', function(evt) {
                    $(button_check).toggleClass("ui-icon-close", false);
                    $(button_check).toggleClass("ui-icon-plus", true);

                });

                $(dialog).bind('dialogopen', function(evt) {
                    $(button_check).toggleClass("ui-icon-plus", false);
                    $(button_check).toggleClass("ui-icon-close", true);
                });

                $(button).click(function() {
                    if (!$(dialog).dialog("isOpen")) {

                        $(dialog).dialog("open");
                    } else {
                        $(dialog).dialog("close");
                    }
                });
            }




            // Plot of fast neutrons

            button_to_dialog("#plot_fast", "#plot_fast_check", "#fastplotdialog", {
                autoOpen: false,
                position: {my: "left top", at: "right+265 top", of: "#menu"},
                width: 500,
                height: 450
            });



            // Plot of thermal neutrons

            button_to_dialog("#plot_thermal", "#plot_thermal_check", "#thermalplotdialog", {
                autoOpen: false,
                position: {my: "left top", at: "right+265 top", of: "#menu"},
                width: 500,
                height: 440
            });

            // Plot of fissions

            button_to_dialog("#plot_fission", "#plot_fission_check", "#fissionplotdialog", {
                autoOpen: false,
                position: {my: "left top", at: "right+265 top", of: "#menu"},
                width: 500,
                height: 440
            });

            // Plot of temperature

            button_to_dialog("#plot_temp", "#plot_temp_check", "#tempplotdialog", {
                autoOpen: false,
                position: {my: "left top", at: "right+265 top", of: "#menu"},
                width: 500,
                height: 440
            });

            // Reactor controls

            button_to_dialog("#reactor_ctrl_button", "#reactor_ctrl_check", "#reactor_ctrl_dialog", {
                autoOpen: false,
                position: {my: "left top", at: "right+5 top", of: "#menu"},
                width: 250,
                height: 440
            });

            // Reactor components

            button_to_dialog("#material_ctrl_button", "#material_ctrl_check", "#components_dialog", {
                autoOpen: false,
                position: {my: "left top", at: "right+5 top", of: "#menu"},
                width: 500,
                height: 500
            });

            $("#view1").click(function() {
                $("#reactor_ctrl_dialog").dialog("open");
                $("#reactor_ctrl_dialog").dialog("widget").position({my: "left top", at: "right+5 top", of: "#menu"});
                $("#reactor_ctrl_dialog").dialog("widget").width(250);
                $("#reactor_ctrl_dialog").dialog("widget").height(510);


                $("#fastplotdialog").dialog("open");
                $("#fastplotdialog").dialog("widget").position({my: "left top", at: "right+265 top", of: "#menu"});
                $("#fastplotdialog").dialog("widget").width(250);
                $("#fastplotdialog").dialog("widget").height(250);

                $("#thermalplotdialog").dialog("open");
                $("#thermalplotdialog").dialog("widget").position({my: "left top", at: "right+525 top", of: "#menu"});
                $("#thermalplotdialog").dialog("widget").width(250);
                $("#thermalplotdialog").dialog("widget").height(250);

                $("#fissionplotdialog").dialog("open");
                $("#fissionplotdialog").dialog("widget").position({my: "left top", at: "right+265 top+260", of: "#menu"});
                $("#fissionplotdialog").dialog("widget").width(250);
                $("#fissionplotdialog").dialog("widget").height(250);

                $("#tempplotdialog").dialog("open");
                $("#tempplotdialog").dialog("widget").position({my: "left top", at: "right+525 top+260", of: "#menu"});
                $("#tempplotdialog").dialog("widget").width(250);
                $("#tempplotdialog").dialog("widget").height(250);
            });

            $("#ctrl_rod1").slider({
                value: 0,
                orientation: "vertical",
                range: "max",
                min: 0,
                max: 100,
                animate: true
            });


            $("#materials").change(function() {

                var text = $("#materials option:selected").text();

                if (text === "Moderator")
                {
                    controller.image = moderatorImage;
                    controller.block_type = moderator;
                }

                if (text === "Fuel")
                {
                    controller.image = fuelImage;
                    controller.block_type = fuel;
                }

                if (text === "Reflector")
                {
                    controller.image = reflectorImage;
                    controller.block_type = reflector;
                }

                if (text === "Absorber")
                {
                    controller.image = absorberImage;
                    controller.block_type = absorber;
                }

                if (text === "Coolant")
                {
                    controller.image = coolantImage;
                    controller.block_type = coolant;
                }

            });

            $("#ctrl_rod1").slider({
                change: function(event, ui) {

                    absorber_input.thermal_absorption = control_absorption*(1-ui.value/100);
                    absorber.compute();

                }
            });

            

            $("#progressbar").hide("drop", { direction: "down" }, "slow");
            $("#containall").show("drop", { direction: "up" }, "slow");


        });
    };

    return exports;
});
