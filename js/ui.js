/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * 
 * @param {type} input
 {
 div_id : string,
 data : Array2D object,
 title :,
 colormap : ColorMap object
 colorbaraxis_num_ticks :,
 colorbar_title:,
 xaxis_range:,
 xaxis_num_ticks :[integer],
 xaxis_title:,
 yaxis_range:, 
 yaxis_num_ticks :[integer],
 yaxis_title
 }
 * @returns {unresolved}
 */
var newPlot2D = function (input) {

    var container = document.getElementById(input.div_id);

    if (typeof input.data !== 'undefined' && typeof input.colormap !== 'undefined')
    {

        var canvas = document.createElement("canvas");
        canvas.id = container.id + "-area";
        canvas.className = "area";
        container.appendChild(canvas);

        var output = newPlot2DArea({
            canvas_id: canvas.id,
            data: input.data,
            colormap: input.colormap

        });
    }

    if (typeof input.title !== 'undefined')
    {

        var canvas = document.createElement("canvas");
        canvas.id = container.id + "-maintitle";
        canvas.className = "maintitle";
        container.appendChild(canvas);

        newTitle({
            canvas_id: canvas.id,
            text: input.title
        });
    }

    if (typeof input.colorbaraxis_num_ticks !== 'undefined')
    {

        var canvas = document.createElement("canvas");
        canvas.id = container.id + "-colorbar";
        canvas.className = "colorbar";
        container.appendChild(canvas);

        newColorBar({
            canvas_id: canvas.id,
            colormap: input.colormap
        });

        var canvas = document.createElement("canvas");
        canvas.id = container.id + "-colorbar-axis";
        canvas.className = "axis colorbar-axis";
        container.appendChild(canvas);

        newLinearAxis({
            canvas_id: canvas.id,
            num_ticks: input.colorbaraxis_num_ticks,
            range: input.colormap,
            orientation: 'vertical',
            justify: 'left'
        });

        if (typeof input.colorbar_title !== 'undefined')
        {

            var canvas = document.createElement("canvas");
            canvas.id = container.id + "-colorbar-title";
            canvas.className = "title colorbar-title";
            container.appendChild(canvas);

            newTitle({
                canvas_id: canvas.id,
                text: input.colorbar_title,
                rotate: "cw"
            });

        }
    }

    if (typeof input.yaxis_num_ticks !== 'undefined' && typeof input.yaxis_range !== 'undefined')
    {

        var canvas = document.createElement("canvas");
        canvas.id = container.id + "-yaxis";
        canvas.className = "axis yaxis";
        container.appendChild(canvas);

        newLinearAxis({
            canvas_id: canvas.id,
            num_ticks: input.yaxis_num_ticks,
            range: input.yaxis_range,
            orientation: 'vertical',
            justify: 'right'
        });


    }

    if (typeof input.yaxis_title !== 'undefined')
    {

        var canvas = document.createElement("canvas");
        canvas.id = container.id + "-yaxis-title";
        canvas.className = "title yaxis-title";
        container.appendChild(canvas);

        newTitle({
            canvas_id: canvas.id,
            text: input.yaxis_title,
            rotate: "ccw"
        });
    }

    if (typeof input.xaxis_num_ticks !== 'undefined' && typeof input.xaxis_range !== 'undefined')
    {

        var canvas = document.createElement("canvas");
        canvas.id = container.id + "-xaxis";
        canvas.className = "axis xaxis";
        container.appendChild(canvas);

        newLinearAxis({
            canvas_id: canvas.id,
            num_ticks: input.xaxis_num_ticks,
            range: input.xaxis_range,
            orientation: 'horizontal',
            justify: 'top'
        });


    }

    if (typeof input.xaxis_title !== 'undefined')
    {

        var canvas = document.createElement("canvas");
        canvas.id = container.id + "-xaxis-title";
        canvas.className = "title xaxis-title";
        container.appendChild(canvas);

        newTitle({
            canvas_id: canvas.id,
            text: input.xaxis_title
        });
    }

    return output;
};

/**
 * 
 * @param {type} input 
 {
 x:,
 y:,
 width:,
 height:,
 data : Array2D object,
 colormap : ColorMap object
 }
 * @returns {undefined}
 */
function Plot2DArea(input) {
    "use strict";

    var output;

    if (typeof this !== "undefined") {
        // if new was called, use the object that was created
        output = this;
    } else {
        // if new was not called, start with base object.
        output = {};
    }


    if (typeof input.data === 'undefined') {
        throw "must have a data object to bind to.";
    }

    var canvas = document.createElement("canvas");
    var ctx;
    var imgData;



    if (canvas.getContext !== null) {
        canvas.width = input.data.num_i;
        canvas.height = input.data.num_j;

        ctx = canvas.getContext('2d');

        imgData = ctx.createImageData(canvas.width, canvas.height);

    } else {
        throw "could not get context of canvas";
    }

    /**
     * Updates the plot using current contents of the input.data field
     * 
     * @returns {undefined}
     */
    output.redraw = function (viewport, t)
    {
        var k = 0;
        var arr = input.data.arr;


        for (var j = 0; j < input.data.num_j; j++)
        {

            for (var i = 0; i < input.data.num_i; i++)
            {

                imgData.data[k * 4] = input.colormap.r(arr[k]);
                imgData.data[k * 4 + 1] = input.colormap.g(arr[k]);
                imgData.data[k * 4 + 2] = input.colormap.b(arr[k]);
                imgData.data[k * 4 + 3] = 255;


                k++;
            }
        }

        ctx.putImageData(imgData, 0, 0);

        viewport.ctx.drawImage(canvas, input.x, input.y, input.width, input.height);

    };

    return output;
}
;

/**
 * 
 * @param {type} input
 {
 x:,
 y:,
 width:,
 height:,
 colormap : ColorMap object
 }
 * @returns {unresolved}
 */
var ColorBar = function (input) {
    "use strict";

    var output;

    if (typeof this !== "undefined") {
        // if new was called, use the object that was created
        output = this;
    } else {
        // if new was not called, start with base object.
        output = {};
    }
    
    var canvas = document.createElement("canvas");
    var ctx;
    var imgData;



    if (canvas.getContext !== null) {
        canvas.width = input.width;
        canvas.height = input.height;

        ctx = canvas.getContext('2d');

        imgData = ctx.createImageData(canvas.width, canvas.height);

    } else {
        throw "could not get context of canvas";
    }

    output.redraw = function (viewport, t){
        var k = 0;
        var x = 0;

        for (var j = 0; j < input.height; j++)
        {

            for (var i = 0; i < input.width; i++)
            {

                x = input.colormap.min + (input.colormap.max - input.colormap.min) * (input.height - 1 - j) / (input.height - 1);

                imgData.data[k * 4] = input.colormap.r(x);
                imgData.data[k * 4 + 1] = input.colormap.g(x);
                imgData.data[k * 4 + 2] = input.colormap.b(x);
                imgData.data[k * 4 + 3] = 255;


                k++;
            }
        }

        ctx.putImageData(imgData, 0, 0);

        viewport.ctx.drawImage(canvas, input.x, input.y, input.width, input.height);
    };

    return output;
};

/**
 * 
 * @param {type} input
 {
 canvas_id :,[string]
 num_ticks :[integer],
 range : {
 min : [number],
 max : [number]
 },
 orientation : ['vertical', 'horizontal'],
 justify : ['left', 'bottom']
 }
 * @returns {unresolved}
 */
var newLinearAxis = function (input)
{
    var axis = document.getElementById(input.canvas_id);

    axis.width = $(axis).css("width").match(/(\d+)px/)[1];
    axis.height = $(axis).css("height").match(/(\d+)px/)[1];

    if (axis.getContext !== null) {
        var ctx = axis.getContext('2d');

        var tick_width = 5;
        var padding = 2;
        var scale = newNumberScale(input.range);

        if (input.orientation === 'vertical')
        {

            var textStart;
            var lineStart, lineEnd;

            if (input.justify === 'left')
            {

                textStart = (tick_width + padding);
                lineStart = 0;
                lineEnd = tick_width;
            } else {
                ctx.textAlign = "right";

                textStart = axis.width - tick_width - padding;
                lineStart = axis.width - tick_width;
                lineEnd = axis.width;
            }

            ctx.lineWidth = 2;
            var tick_increment = axis.height / input.num_ticks;

            ctx.font = $(axis).css("font");

            ctx.beginPath();
            ctx.moveTo(lineStart, 1);
            ctx.lineTo(lineEnd, 1);
            ctx.stroke();

            ctx.textBaseline = 'top';

            ctx.fillText("" + scale.digit(input.range.max), textStart, 0);

            ctx.beginPath();
            ctx.moveTo(lineStart, axis.height - 1);
            ctx.lineTo(lineEnd, axis.height - 1);
            ctx.stroke();

            ctx.textBaseline = 'bottom';
            ctx.fillText("" + scale.digit(input.range.min), textStart, axis.height);

            ctx.textBaseline = 'middle';

            for (var k = 1; k < input.num_ticks - 1; k++)
            {
                x = input.range.min + (input.range.max - input.range.min) * (input.num_ticks - 1 - k) / (input.num_ticks - 1);
                var j = Math.floor(axis.height * k / (input.num_ticks - 1));

                ctx.beginPath();
                ctx.moveTo(lineStart, j);
                ctx.lineTo(lineEnd, j);
                ctx.stroke();

                ctx.fillText("" + scale.digit(x), textStart, j);
            }

        } else
        if (input.orientation === 'horizontal')
        {

            var textStart;
            var lineStart, lineEnd;

            if (input.justify === 'bottom')
            {
                ctx.textBaseline = 'bottom';

                textStart = axis.height - (tick_width + padding);
                lineStart = axis.height - tick_width;
                lineEnd = axis.height;
            } else {
                ctx.textBaseline = 'top';

                textStart = tick_width + padding;
                lineStart = 0;
                lineEnd = tick_width;
            }


            ctx.lineWidth = 2;
            var tick_increment = axis.height / input.num_ticks;

            ctx.font = $(axis).css("font");

            ctx.beginPath();
            ctx.moveTo(1, lineStart);
            ctx.lineTo(1, lineEnd);
            ctx.stroke();

            ctx.textAlign = "left";

            ctx.fillText("" + scale.digit(input.range.min), 0, textStart);

            ctx.beginPath();
            ctx.moveTo(axis.width - 1, lineStart);
            ctx.lineTo(axis.width - 1, lineEnd);
            ctx.stroke();

            ctx.textAlign = 'right';
            ctx.fillText("" + scale.digit(input.range.max), axis.width, textStart);

            ctx.textAlign = 'center';

            for (var k = 1; k < input.num_ticks - 1; k++)
            {
                x = input.range.min + (input.range.max - input.range.min) * (k) / (input.num_ticks - 1);
                var i = Math.floor(axis.width * k / (input.num_ticks - 1));

                ctx.beginPath();
                ctx.moveTo(i, lineStart);
                ctx.lineTo(i, lineEnd);
                ctx.stroke();

                ctx.fillText("" + scale.digit(x), i, textStart);
            }
        }
    }

    var output = {};

    return output;
};

/**
 * 
 * @param {type} input
 {
 canvas_id :[string],
 text: [string],
 rotate : ['cw', 'ccw'],
 
 }
 * @returns {unresolved}
 */
var newTitle = function (input)
{
    var title = document.getElementById(input.canvas_id);

    title.width = $(title).css("width").match(/(\d+)px/)[1];
    title.height = $(title).css("height").match(/(\d+)px/)[1];

    if (title.getContext !== null) {
        var ctx = title.getContext('2d');

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = $(title).css("font");

        ctx.save();

        ctx.translate(title.width / 2, title.height / 2);

        if (input.rotate === "cw")
        {

            ctx.rotate(Math.PI / 2);
        }

        if (input.rotate === "ccw")
        {

            ctx.rotate(-Math.PI / 2);
        }

        ctx.fillText(input.text, 0, 0);

        ctx.restore();
    }

    var output = {};

    return output;
};

/**
 * 
 * @param {type} input
 {
 max:,
 min:,
 }
 * @returns {newRange.output}
 */
var newRange = function (input)
{
    var slope;
    var intercept;

    var output = {};
    
    var recalc = function(){
        slope = 1 / (input.max - input.min);
        intercept = -slope * input.min;
    };
    
    recalc();

    Object.defineProperty(output, 'max', {
        
        get: function () {
            return input.max;
        },
        
        set: function (value) {
            input.max = value;
            recalc();
        }
    });

    Object.defineProperty(output, 'min', {
        get: function () {
            return input.min;
        },
        
        set: function (value) {
            input.min = value;
            recalc();
        }
    });
    


    output.norm = function (x)
    {
        return Math.max(0, Math.min(1, slope * x + intercept));
    };

    return output;
};


/**
 * @param min
 * @param max
 * @param {type} n
 * @param {type} params structure
 * {
 *     // piecewise function for each color x \in [0,1], y \in [0,1]
 *     r : [[x1, x2, y(x1), y(x2)],...], 
 *     g : [[x1, x2, y(x1), y(x2)],...],
 *     b : [[x1, x2, y(x1), y(x2)],...]
 * }
 * @returns {ColorMap}
 */
function newColorMap(min, max, n, params)
{
    var output = newRange({max: max, min: min});

    var mapr = new Uint8ClampedArray(n);
    var mapg = new Uint8ClampedArray(n);
    var mapb = new Uint8ClampedArray(n);

    var x = 0;
    var s = 0;
    var y = 0;

    // build the color map based on the color function parameters
    for (var i = 0; i < n; i++)
    {
        // inputs are always x \in [0, 1.0]
        x = i / (n - 1);

        // red component

        for (var j = 0; j < params.r.length; j++)
        {
            if (x >= params.r[j][0] && x <= params.r[j][1])
            {
                s = (x - params.r[j][0]) / (params.r[j][1] - params.r[j][0]);
                y = (1 - s) * params.r[j][2] + s * params.r[j][3];

                mapr[i] = Math.floor(255 * y);
            }
        }


        // green component

        for (var j = 0; j < params.g.length; j++)
        {
            if (x >= params.g[j][0] && x <= params.g[j][1])
            {
                s = (x - params.g[j][0]) / (params.g[j][1] - params.g[j][0]);
                y = (1 - s) * params.g[j][2] + s * params.g[j][3];

                mapg[i] = Math.floor(255 * y);
            }
        }

        // blue component
        for (var j = 0; j < params.b.length; j++)
        {
            if (x >= params.b[j][0] && x <= params.b[j][1])
            {
                s = (x - params.b[j][0]) / (params.b[j][1] - params.b[j][0]);
                y = (1 - s) * params.b[j][2] + s * params.b[j][3];

                mapb[i] = Math.floor(255 * y);
            }
        }
    }

    output.n = n;

    output.r = function (x)
    {

        var index = Math.floor((n - 1) * output.norm(x));

        return mapr[index];
    };

    output.g = function (x)
    {
        var index = Math.floor((n - 1) * output.norm(x));

        return mapg[index];
    };

    output.b = function (x)
    {
        var index = Math.floor((n - 1) * output.norm(x));

        return mapb[index];
    };

    return output;
}
;
/**
 * 
 * @param {type} input
 * {
 colormap:,
 numContours:,
 contourHalfWidth:,
 numContours:,
 
 * @returns {undefined}
 */
var newContourMap = function (input)
{
    var nearest;

    var shape = function (x)
    {
        nearest = Math.round(x * input.numContours) / input.numContours;

        if (x < nearest + input.contourHalfWidth && x > nearest - input.contourHalfWidth)
        {
            return 1;
        } else {
            return 0;
        }
    };

    var output = {};

    output.r = function (x)
    {
        return input.colormap.r(x) * shape(input.colormap.norm(x));
    };

    output.g = function (x)
    {
        return input.colormap.g(x) * shape(input.colormap.norm(x));
    };

    output.b = function (x)
    {
        return input.colormap.b(x) * shape(input.colormap.norm(x));
    };

    return output;
};


var colormap_presets = {
    jet: {
        r: [[0.4, 0.6, 0, 1], [0.6, 0.9, 1, 1], [0.9, 1, 1, 0.5]],
        g: [[0.1, 0.4, 0, 1], [0.4, 0.6, 1, 1], [0.6, 0.9, 1, 0]],
        b: [[0, 0.1, 0.5, 1], [0.1, 0.4, 1, 1], [0.4, 0.6, 1, 0]]
    },
    hot: {
        r: [[0, 0.35, 0, 1], [0.35, 1, 1, 1]],
        g: [[0.35, 0.65, 0, 1], [0.65, 1, 1, 1]],
        b: [[0.65, 1, 0, 1]]
    },
    rainbow: {
        r: [[0, 0.2, 1, 1], [0.2, 0.4, 1, 0], [0.8, 1, 0, 1]],
        g: [[0, 0.2, 0, 1], [0.2, 0.6, 1, 1], [0.6, 0.8, 1, 0]],
        b: [[0.4, 0.6, 0, 1], [0.6, 1, 1, 1]]
    },
    gray: {
        r: [[0, 1, 0, 1]],
        g: [[0, 1, 0, 1]],
        b: [[0, 1, 0, 1]]
    },
    bone: {
        r: [[0, 1, 0, 1]],
        g: [[0, 1, 0, 1]],
        b: [[0, 0.5, 0, 0.65], [0.5, 1, 0.65, 1]]
    },
    violet: {
        r: [[0, 0.5, 0, 1], [0.5, 1, 1, 1]],
        g: [[0.5, 1, 0, 1]],
        b: [[0, 0.5, 0, 1], [0.5, 1, 1, 1]]
    },
    yellow: {
        r: [[0, 0.5, 0, 1], [0.5, 1, 1, 1]],
        g: [[0, 0.5, 0, 1], [0.5, 1, 1, 1]],
        b: [[0.5, 1, 0, 1]]
    },
    cyan: {
        r: [[0.5, 1, 0, 1]],
        g: [[0, 0.5, 0, 1], [0.5, 1, 1, 1]],
        b: [[0, 0.5, 0, 1], [0.5, 1, 1, 1]]
    },
    red_violet: {
        r: [[0, 0.33, 0, 1], [0.33, 1, 1, 1]],
        g: [[0.66, 1, 0, 1]],
        b: [[0.33, 0.66, 0, 1], [0.66, 1, 1, 1]]
    },
    green_cyan: {
        r: [[0.66, 1, 0, 1]],
        g: [[0, 0.33, 0, 1], [0.33, 1, 1, 1]],
        b: [[0.33, 0.66, 0, 1], [0.66, 1, 1, 1]]
    },
    green: {
        r: [[0.5, 1, 0, 1]],
        g: [[0, 0.5, 0, 1], [0.5, 1, 1, 1]],
        b: [[0.5, 1, 0, 1]]
    },
    red: {
        r: [[0, 0.5, 0, 1], [0.5, 1, 1, 1]],
        g: [[0.5, 1, 0, 1]],
        b: [[0.5, 1, 0, 1]]
    },
    blue: {
        r: [[0.5, 1, 0, 1]],
        g: [[0.5, 1, 0, 1]],
        b: [[0, 0.5, 0, 1], [0.5, 1, 1, 1]]
    },
    blue_cyan: {
        r: [[0.66, 1, 0, 1]],
        g: [[0.33, 0.66, 0, 1], [0.66, 1, 1, 1]],
        b: [[0, 0.33, 0, 1], [0.33, 1, 1, 1]]
    },
    mud: {
        r: [[0, 1, 0, 1]],
        g: [[0.33, 1, 0, 1]],
        b: [[0.66, 1, 0, 1]]
    },
    grass: {
        r: [[0.33, 1, 0, 1]],
        g: [[0, 1, 0, 1]],
        b: [[0.66, 1, 0, 1]]
    },
    purplehaze: {
        r: [[0.33, 1, 0, 1]],
        g: [[0.66, 1, 0, 1]],
        b: [[0, 1, 0, 1]]
    },
    atmosphere: {
        r: [[0.66, 1, 0, 1]],
        g: [[0.33, 1, 0, 1]],
        b: [[0, 1, 0, 1]]
    },
    pond: {
        r: [[0.66, 1, 0, 1]],
        g: [[0, 1, 0, 1]],
        b: [[0.33, 1, 0, 1]]
    },
    berry: {
        r: [[0, 1, 0, 1]],
        g: [[0.66, 1, 0, 1]],
        b: [[0.33, 1, 0, 1]]
    },
    doppler: {
        r: [[0, 0.5, 1, 1], [0.5, 0.75, 1, 0]],
        g: [[0, 0.5, 0, 1], [0.5, 1, 1, 0]],
        b: [[0.25, 0.5, 0, 1], [0.5, 1, 1, 1]]
    },
    autumn: {
        r: [[0, 1, 1, 1]],
        g: [[0, 1, 0, 1]],
        b: []
    },
    spring: {
        r: [[0, 1, 1, 1]],
        g: [[0, 1, 0, 1]],
        b: [[0, 1, 1, 0]]
    },
    winter: {
        r: [[0, 1, 0, 0.3]],
        g: [[0, 1, 0, 1]],
        b: [[0, 1, 1, 0.3]]
    },
    anime: {
        r: [[0, 0.33, 0.7, 0.9], [0.33, 0.66, 0.9, 0], [0.95, 1, 0, 1]],
        g: [[0, 0.33, 0.1, 0.7], [0.33, 0.66, 0.7, 0], [0.66, 1, 0, 1]],
        b: [[0, 0.33, 0.15, 0.3], [0.33, 0.66, 0.3, 0.7], [0.66, 1, 0.7, 1]]
    }
};



var newNumberScale = function (range)
{
    var avg = (range.max + range.min) / 2;
    var exp = Math.floor(Math.log(avg) / Math.log(10));
    var base = Math.pow(10, exp);



    var output = {};

    Object.defineProperty(output, 'exp', {get: function () {
            return exp;
        }});

    Object.defineProperty(output, 'base', {get: function () {
            return base;
        }});

    output.digit = function (number) {
        return number;
    };

    return output;

};

function CanvasFigure(input) {

    "use strict";

    var output;

    if (typeof this !== "undefined") {
        // if new was called, use the object that was created
        output = this;
    } else {
        // if new was not called, start with base object.
        output = {};
    }

    output.input = input;
    


    output.canvas = document.getElementById(input.id);
    output.ctx = output.canvas.getContext('2d');
    output.element = $("#" + input.id);

    output.beginFrame;
    output.endFrame;

    output.layers = [];

    /**
     * 
     * @param {type} layer
     {
     redraw: function(viewport, t)
     }
     * @returns {undefined}
     */
    output.addLayer = function (layer) {
        if (typeof layer.redraw === 'undefined')
        {
            throw "layer.redraw(figure, t) must be defined";
        }

        output.layers.push(layer);
    };


    /**
     * Redraws the canvas drawing each layer in the order that they were added
     * @param 
     * @param {type} t time since the beginning of the animation.
     * @returns {undefined}
     */
    output.redraw = function (t) {
        

        output.ctx.setTransform(1, 0, 0, 1, 0, 0);
        output.ctx.clearRect(0, 0, output.canvas.width, output.canvas.height);

        if (typeof output.beginFrame !== 'undefined') {
            output.beginFrame(output, t);
        }

        var l = output.layers.length;

        for (var i = 0; i < l; i++)
        {
            output.ctx.setTransform(1, 0, 0, 1, 0, 0);
            output.layers[i].redraw(output, t);
        }

        if (typeof output.endFrame !== 'undefined') {
            output.endFrame(output, t);
        }

    };

    var selectables = [];
    var selected = [];

    /**
     * 
     * @param {type} selectable
     {
     in: function(x,y) returns [true,false]
     selected: function(),
     unselected: function()
     }
     * @returns {undefined}
     */
    output.addSelectable = function (selectable) {

        if (typeof selectable.selected === 'undefined' || typeof selectable.unselected === 'undefined')
        {
            throw "selected() and unselected() must be defined.";
        }

        selectables.push(selectable);
        selected.push(false);
    };

    output.getSelections = function () {
        var selections = [];

        var l = selectables.length;

        for (var i = 0; i < l; i++)
        {
            if (selected[i]) {
                selections.push(selectables[i]);
            }
        }

        return selections;
    };


    var mouse = {
        over: false,
        down: false,
        downx: 0,
        downy: 0,
        upx: 0,
        upy: 0,
        curx: 0,
        cury: 0
    };


    output.element.mousedown(function (e) {
        mouse.down = true;
        mouse.downx = output.canvas.width*(e.pageX - output.element.offset().left)/output.element.width();
        mouse.downy = output.canvas.height*(e.pageY - output.element.offset().top)/output.element.height();


        var l = selectables.length;
        var selectable;

        for (var i = 0; i < l; i++)
        {
            selectable = selectables[i];

            if (selected[i])
            {

                if (selectable.in(mouse.downx, mouse.downy))
                {
                    selected[i] = false;
                    selectable.unselected();
                } else if (!e.ctrlKey) {
                    selected[i] = false;
                    selectable.unselected();
                }

            } else {
                if (selectable.in(mouse.downx, mouse.downy)) {

                    selected[i] = true;
                    selectable.selected(output);

                }
            }

        }
    });

    output.element.mouseup(function (e) {
        if (mouse.down === true)
        {
            mouse.down = false;
            mouse.upx = e.pageX - output.element.offset().left;
            mouse.upy = e.pageY - output.element.offset().top;
        }

        //console.log("@up");
    });

    output.element.mouseout(function (e) {
        mouse.over = false;
        mouse.down = false;

        //console.log("@out");
    });

    output.element.mouseover(function (e) {
        mouse.over = true;

        //console.log("@over");
    });

    output.element.mousemove(function (e) {
        mouse.curx = e.pageX - output.element.offset().left;
        mouse.cury = e.pageY - output.element.offset().top;

    });



    return output;
}
;

function Animation() {
    "use strict";

    var output;

    if (typeof this !== "undefined") {
        // if new was called, use the object that was created
        output = this;
    } else {
        // if new was not called, start with base object.
        output = {};
    }

    output.beginFrame;
    output.endFrame;

    var figures = [];

    output.addFigure = function (figure) {

        if (typeof figure.redraw === 'undefined')
        {
            throw "layer.redraw(t) must be defined";
        }

        figures.push(figure);
    };

    /**
     * Redraws the canvas drawing each layer in the order that they were added
     * @param 
     * @param {type} t time since the beginning of the animation.
     * @returns {undefined}
     */
    output.redraw = function (t) {

        if (typeof output.beginFrame !== 'undefined') {
            output.beginFrame(t);
        }


        for (var i=0, l = figures.length; i < l; i++) {
            figures[i].redraw(t);
        }

        if (typeof output.endFrame !== 'undefined') {
            output.endFrame(t);
        }

    };

    var animate = false;
    output.fpsCallback;


    /**
     * Begins an animation loop of drawing the canvas
     * @param {type} duration number of milliseconds to run animation
     * @returns {undefined}
     */
    output.startAnimation = function (duration) {

        animate = true;

        if (typeof duration === 'undefined') {
            duration = 0;
        }

        window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                window.webkitRequestAnimationFrame || window.oRequestAnimationFrame;

        var start = null;
        var fpsstart, fpstime;
        var framecount = 0;
        var t, dt, last_t=0;

        function step(timestamp) {

            if (animate === true)
            {


                if (start === null) {
                    start = timestamp;
                    fpsstart = timestamp;
                    last_t = timestamp;
                }

                t = timestamp - start;
                dt = last_t - timestamp;
                last_t = timestamp;

                if (duration === 0 || t < duration)
                {

                    output.redraw(t);
                    
                    

                    fpstime = timestamp - fpsstart;
                    framecount++;

                    if (fpstime >= 1000) {
                        if (typeof output.fpsCallback !== 'undefined')
                        {
                            output.fpsCallback(Math.round(1000 * framecount / fpstime));
                        }

                        fpsstart = timestamp;
                        framecount = 0;
                    }
                    
                    requestAnimationFrame(step);
                } else {
                    if (typeof output.fpsCallback !== 'undefined')
                    {
                        output.fpsCallback(0);
                    }
                }


            } else {
                if (typeof output.fpsCallback !== 'undefined')
                {
                    output.fpsCallback(0);
                }
            }
        }

        requestAnimationFrame(step);
    };

    output.stopAnimation = function () {
        animate = false;

    };



    Object.defineProperty(output, 'animate', {
        configurable: true,
        set: function (value) {
            if (value === true && animate === false) {

                output.startAnimation();

            } else if (value === false) {

                output.stopAnimation();
            }
        },
        get: function () {
            return animate;
        }
    });
    
    return output;
}
;

/**
 * 
 * @param {type} input
 {
 viewport: CanvasViewport
 x1: min x
 x2: max x
 y1: min y
 y2: max y
 }
 * @returns {SquareClickArea}
 */
function SquareClickArea(input) {
    "use strict";

    var output;

    if (typeof this !== "undefined") {
        // if new was called, use the object that was created
        output = this;
    } else {
        // if new was not called, start with base object.
        output = {};
    }

    var selected = false;

    output.in = function (x, y) {
        if (x > input.x1 && x < input.x2) {

            if (y > input.y1 && y < input.y2)
            {
                return true;
            }
        }

        return false;
    };



    output.selected = function () {
        selected = true;
    };

    output.unselected = function () {
        selected = false;
    };

    output.redraw = function (viewport) {
        var ctx = viewport.ctx;

        ctx.beginPath();
        ctx.moveTo(input.x1, input.y1);
        ctx.lineTo(input.x2, input.y1);
        ctx.lineTo(input.x2, input.y2);
        ctx.lineTo(input.x1, input.y2);
        ctx.closePath();
        ctx.stroke();

        if (selected) {

            ctx.fillStyle = "rgba(0, 0, 200, 0.5)";
            ctx.fillRect(input.x1, input.y1, input.x2 - input.x1, input.y2 - input.y1);
        } else {

        }
    };

    input.viewport.addLayer(output);
    input.viewport.addSelectable(output);

    return output;
}
;

var objToURL = function (obj) {
    window.URL = window.webkitURL || window.URL;

    var objstr = JSON.stringify(obj);

    var jsonblob = new Blob([objstr], {type: 'application/json'});

    var output = {};

    output.url = window.URL.createObjectURL(jsonblob);

    output.revoke = function () {
        window.URL.revokeObjectURL(output.url);
    };

    return output;
};


/**
 * 
 * @param {type} input
 {
    x:
    y:
    width:
    height:
    image:
    controller:
    blocks:
    i:,
    j:,
 }
 * @returns {SquareClickArea}
 */
function BlockClickArea(input) {
    "use strict";

    var output;

    if (typeof this !== "undefined") {
        // if new was called, use the object that was created
        output = this;
    } else {
        // if new was not called, start with base object.
        output = {};
    }
    
    var image = input.image;

    var selected = false;

    output.in = function (x, y) {
        if (x > input.x && x < input.x + input.width) {

            if (y > input.y && y < input.y + input.width)
            {
                return true;
            }
        }

        return false;
    };



    output.selected = function (figure) {
        selected = true;
        
        image = input.controller.image;
        input.blocks.set(input.i, input.j, input.controller.block_type);
        
        figure.redraw(0);
    };

    output.unselected = function () {
        selected = false;
    };

    output.redraw = function (figure) {
        var ctx = figure.ctx;
        
        ctx.drawImage(image, input.x, input.y, input.width, input.height);

        ctx.beginPath();
        ctx.moveTo(input.x, input.y);
        ctx.lineTo(input.x + input.width, input.y);
        ctx.lineTo(input.x + input.width, input.y + input.height);
        ctx.lineTo(input.x, input.y + input.height);
        ctx.closePath();
        
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'black';
        ctx.stroke();

    };

    //input.viewport.addLayer(output);
    //input.viewport.addSelectable(output);

    return output;
}
;