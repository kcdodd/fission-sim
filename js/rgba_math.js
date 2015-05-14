var RGBA_MATH = {
    rgba_to_float : function(rgba) {
        return rgba[0]/255.0 + rgba[1]/65280.0 + rgba[2]/16711680.0 + rgba[2]/4278190080.0;
    },

    // x \in [0.0, 1.0]
    float_to_rgba : function (x) {
        var rgba = new Uint8ClampedArray(4);

        x *= 255;

        for(var i = 0; i < 4; i++) {
            //console.log(x);
            rgba[i] = Math.floor(x);
            x = x - rgba[i];
            x *= 256;
        }

        return rgba;

    }
};

var x = Math.PI/4.0;

console.log(x);

var rgba = RGBA_MATH.float_to_rgba(x);

console.log(rgba);

var y = RGBA_MATH.rgba_to_float(rgba);

console.log(y);

console.log(Math.abs(x -y));
