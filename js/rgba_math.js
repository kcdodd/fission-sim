var RGBA_MATH = {
    rgba_to_float : function(rgba) {
        return rgba[0]/255.0 + rgba[1]/65280.0 + rgba[2]/16711680.0 + rgba[3]/4278190080.0;
    },

    // x \in [0.0, 1.0]
    float_to_rgba : function (x) {
        var rgba = new Uint8ClampedArray(4);

        x *= 255.0;

        for(var i = 0; i < 4; i++) {
            //console.log(x);
            rgba[i] = Math.floor(x);
            x = (x - rgba[i])*256.0;
        }

        return rgba;

    },

    add : function (a, b) {
        var result = new Uint8Array(4);

        var tmp = 0;

        tmp = a[3] + b[3];
        result[3] = tmp;

        tmp = a[2] + b[2] + (tmp >>> 8);
        result[2] = tmp;

        tmp = a[1] + b[1] + (tmp >>> 8);
        result[1] = tmp;

        tmp = a[0] + b[0] + (tmp >>> 8);
        result[0] = tmp;

        return result;
    },

    subtract : function(a,b) {

    },

    multiply : function(a, b) {
        var mask = 0x000000FF;

        var result = new Uint8Array(4);

        // 16 cross terms in multiplying two rgba numbers, but drop lowest 2 orders
        var term0 = a[0]*b[0];
        var term1 = a[0]*b[1] + a[1]*b[0];
        var term2 = a[1]*b[1] + a[0]*b[2] + a[2]*b[0];
        var term3 = a[0]*b[3] + a[3]*b[0] + a[1]*b[2] + a[2]*b[1];
        var term4 = a[1]*b[3] + a[3]*b[1] + a[2]*b[2];

        var red = term0 + (term1 >>> 8);
        result[0] = red/255;
        red = red - 255*result[0];

        var green = (red << 8) + (mask & term1) + (term2 >>> 8);
        result[1] = green/255;
        green = green - 255*result[1];

        var blue = (green << 8) + (mask & term2) + (term3 >>> 8);
        result[2] = blue/255;
        blue = blue - 255*result[2];

        var alpha = (blue << 8) + (mask & term3) + (term4 >>> 8);

        result[3] = alpha/255;

        return result;
    }
};

var x = RGBA_MATH.rgba_to_float(RGBA_MATH.float_to_rgba(0.12111238885));

var a = RGBA_MATH.float_to_rgba(x);


var c =  RGBA_MATH.add(a,a);


var z = RGBA_MATH.rgba_to_float(c);

console.log(a);
console.log(c);

console.log("float " + 2*x);
console.log("rgba  " + z);
