"use strict";

/**
 * @typedef {Object} Float2DInput
 * @property {number} [num_i] number of rows
 * @property {number} [num_j] number of columns
 */
 /**
  * @typedef {Object} Array2D
  */
/**
 * Constructor for an 2D array object
 *
 * @param {Float2DInput} input
 * @returns {Array2D}
 */
function Float2D(input)
{
    "use strict";

    var output;

    if (typeof this !== "undefined") {
        // if new was called, use the object that was created
        output = this;
    } else {
        // if new was not called, start with base object.
        output = {};
    }

    Object.defineProperty(output, 'num_i', {
        configurable: true,
        get: function() {
            return input.num_i;
        }
    });

    Object.defineProperty(output, 'num_j', {
        configurable: true,
        get: function() {
            return input.num_j;
        }
    });

    var num_total = input.num_i * input.num_j;

    output.arr = new Float32Array(num_total);

    /**
     *
     * @param {type} i
     * @param {type} j
     * @returns {Array}
     */
    output.get = function(i, j)
    {
        return this.arr[i + input.num_i * j];


    };

    /**
     *
     * @param {type} i
     * @param {type} j
     * @param {type} value
     * @returns {undefined}
     */
    output.set = function(i, j, value)
    {
        this.arr[i + input.num_i * j] = value;
    };



    /**
     * Copies the contents of another array into this one.
     *
     * @param {type} other
     * @returns {undefined}
     */
    output.copy = function(other, min_i, min_j, max_i, max_j)
    {
        if (other.num_i !== input.num_i || other.num_j !== input.num_j)
        {
            throw "input must be same size as this array.";
        }

        var nolimits = 0;

        if (typeof (min_i) === 'undefined')
        {
            min_i = 0;
            nolimits++;
        }

        if (typeof (min_j) === 'undefined')
        {
            min_j = 0;
            nolimits++;
        }

        if (typeof (max_i) === 'undefined')
        {
            max_i = this.num_i;
            nolimits++;
        }

        if (typeof (max_j) === 'undefined')
        {
            max_j = this.num_j;
            nolimits++;
        }

        if (nolimits === 4)
        {
            for (var k = 0; k < num_total; ++k)
            {
                this.arr[k] = other.arr[k];
            }

        } else {

            for (var j = min_j; j < max_j; j++)
            {
                for (var i = min_i; i < max_i; i++)
                {
                    this.arr[i + this.num_i * j] = other.arr[i + this.num_i * j];

                }
            }
        }


    };

    /**
     * A general functional that can take scalars and other arrays, and computes
     * the elememts of this array.
     *
     * The first argument must be a text string which specifies the function expression
     * in reverse polish notation. It recognizes the binary operators +,-,*,/,and ^
     * E.G. "as*a+" multiplies a scalar and an array, and adds it to another array
     *
     * The rest of the arguments are the inputs to the function in the same order
     * they appear in the RPN expression. Only arrays and scalars are recognized, and
     * must be specified in the expression since arrays are attemped to be indexed,
     * while scalars are not.
     *
     * All operations between two arrays are assumed to be element wise. This does
     * not perform any kind of matrix multiplication operation
     *
     * @returns {undefined}
     */
    output.calc_rpn = function()
    {

        if (arguments.length < 2)
        {
            // theres not enough arguments to possibly do anything.
            throw "Arguments must include rpn expression as first expression, and then inputs";
        }

        // first argument must be the functional expression.
        var f_exp = arguments[0];

        if (f_exp.length === 0)
        {
            throw "rpn expression must contain something";
        }

        // each argument after that must be an input to the function

        var stack = new Array();
        var tmp1;
        var tmp2;
        var value;

        for (var i = 0; i < input.num_i; i++)
        {
            for (var j = 0; j < input.num_j; j++)
            {
                var arg_i = 1;

                for (var k = 0; k < f_exp.length; k++)
                {
                    if (f_exp[k] === 'a')
                    {
                        stack.push(arguments[arg_i].get(i, j));
                        arg_i++;

                    } else if (f_exp[k] === 's')
                    {
                        stack.push(arguments[arg_i]);
                        arg_i++;

                    } else if (f_exp[k] === '+')
                    {
                        tmp2 = stack.pop();
                        tmp1 = stack.pop();
                        value = tmp1 + tmp2;
                        stack.push(value);

                    } else if (f_exp[k] === '-')
                    {
                        tmp2 = stack.pop();
                        tmp1 = stack.pop();
                        value = tmp1 - tmp2;
                        stack.push(value);
                    } else if (f_exp[k] === '*')
                    {
                        tmp2 = stack.pop();
                        tmp1 = stack.pop();
                        value = tmp1 * tmp2;
                        stack.push(value);
                    } else if (f_exp[k] === '/')
                    {
                        tmp2 = stack.pop();
                        tmp1 = stack.pop();
                        value = tmp1 / tmp2;
                        stack.push(value);
                    } else if (f_exp[k] === '^')
                    {
                        tmp2 = stack.pop();
                        tmp1 = stack.pop();
                        value = Math.pow(tmp1, tmp2);
                        stack.push(value);
                    } else {

                        throw "no value or operation defined.";
                    }
                }

                this.set(i, j, stack.pop());

                if (stack.length > 0)
                {
                    throw "improper expression.";
                }
            }
        }

        return this;

    };

    /**
     * Multiplies every element in the array by a number
     *
     * @param {type} s
     * @param {type} min_i
     * @param {type} min_j
     * @param {type} max_i
     * @param {type} max_j
     * @returns {Float2D}
     */
    output.scale = function(s, min_i, min_j, max_i, max_j)
    {


        var nolimits = 0;

        if (typeof (min_i) === 'undefined')
        {
            min_i = 0;
            nolimits++;
        }

        if (typeof (min_j) === 'undefined')
        {
            min_j = 0;
            nolimits++;
        }

        if (typeof (max_i) === 'undefined')
        {
            max_i = this.num_i;
            nolimits++;
        }

        if (typeof (max_j) === 'undefined')
        {
            max_j = this.num_j;
            nolimits++;
        }

        if (nolimits === 4)
        {
            for (var i = 0; i < num_total; i++)
            {
                this.arr[i] *= s;

            }

        } else {

            for (var j = min_j; j < max_j; j++)
            {
                for (var i = min_i; i < max_i; i++)
                {
                    this.arr[i + this.num_i * j] *= s;

                }
            }
        }

        return this;
    };

    /**
     * Computes a linear combination of two other arrays, and stores the result in
     * this array
     *
     * @param {type} s1
     * @param {type} a1
     * @param {type} s2
     * @param {type} a2
     * @returns {Array2D.prototype}
     */
    output.linear_combo2 = function(s1, a1, s2, a2)
    {
        var arr1 = a1.arr;
        var arr2 = a2.arr;

        for (var i = 0; i < num_total; i++)
        {
            this.arr[i] = s1 * arr1[i] + s2 * arr2[i];
        }

        return this;
    };

    output.linear_add = function(s, a, min_i, min_j, max_i, max_j)
    {

        if (a.num_i !== this.num_i || a.num_j !== this.num_j)
        {
            throw "output must be same size as input.";
        }

        if (typeof (min_i) === 'undefined')
        {
            min_i = 0;
        }

        if (typeof (min_j) === 'undefined')
        {
            min_j = 0;
        }

        if (typeof (max_i) === 'undefined')
        {
            max_i = this.num_i;
        }

        if (typeof (max_j) === 'undefined')
        {
            max_j = this.num_j;
        }

        var arr1 = a.arr;
        var arr2 = this.arr;

        for (var j = min_j; j < max_j; j++)
        {
            for (var i = min_i; i < max_i; i++)
            {
                arr2[i + this.num_i * j] += s * arr1[i + this.num_i * j];

            }
        }

        return this;
    };

    /**
     * Computes the convolution of 3x3 kernel with another array and stores the result
     * in this array
     *
     * @param {type} kernel 3x3 array
     * @param {type} other array to perform convolution on
     * @param {type} min_i optional to specify to perform convolution on subset
     * @param {type} min_j optional to specify to perform convolution on subset
     * @param {type} max_i optional to specify to perform convolution on subset
     * @param {type} max_j optional to specify to perform convolution on subset
     * @returns {Array2D.prototype}
     */
    output.convolve_3x3 = function(kernel, other, min_i, min_j, max_i, max_j)
    {
        if (kernel.num_i !== 3 || kernel.num_j !== 3)
        {
            throw "kernel must be a 3x3 array";
        }

        if (other.num_i !== this.num_i || other.num_j !== this.num_j)
        {
            throw "output must be same size as input.";
        }

        if (typeof (min_i) === 'undefined' || min_i < 1)
        {
            min_i = 1;
        }

        if (typeof (min_j) === 'undefined' || min_j < 1)
        {
            min_j = 1;
        }

        if (typeof (max_i) === 'undefined' || max_i > this.num_i - 1)
        {
            max_i = this.num_i - 1;
        }

        if (typeof (max_j) === 'undefined' || max_j > this.num_j - 1)
        {
            max_j = this.num_j - 1;
        }

        var offset = (min_i - 1) + this.num_i * (min_j - 1);
        var returnoffset = this.num_i - 2 - (max_i - min_i) + 2;

        var i_00 = 0 + offset;
        var i_10 = 1 + offset;
        var i_20 = 2 + offset;
        var i_01 = this.num_i + offset;
        var i_11 = i_01 + 1;
        var i_21 = i_11 + 1;
        var i_02 = 2 * this.num_i + offset;
        var i_12 = i_02 + 1;
        var i_22 = i_12 + 1;

        var k_00 = kernel.arr[0];
        var k_10 = kernel.arr[1];
        var k_20 = kernel.arr[2];
        var k_01 = kernel.arr[3];
        var k_11 = kernel.arr[4];
        var k_21 = kernel.arr[5];
        var k_02 = kernel.arr[6];
        var k_12 = kernel.arr[7];
        var k_22 = kernel.arr[8];

        for (var j = min_j; j < max_j; j++)
        {
            for (var i = min_i; i < max_i; i++)
            {
                this.arr[i_11] = other.arr[i_00] * k_00
                        + other.arr[i_10] * k_10
                        + other.arr[i_20] * k_20
                        + other.arr[i_01] * k_01
                        + other.arr[i_11] * k_11
                        + other.arr[i_21] * k_21
                        + other.arr[i_02] * k_02
                        + other.arr[i_12] * k_12
                        + other.arr[i_22] * k_22;

                i_00++;
                i_10++;
                i_20++;
                i_01++;
                i_11++;
                i_21++;
                i_02++;
                i_12++;
                i_22++;
            }

            i_00 += returnoffset;
            i_10 += returnoffset;
            i_20 += returnoffset;
            i_01 += returnoffset;
            i_11 += returnoffset;
            i_21 += returnoffset;
            i_02 += returnoffset;
            i_12 += returnoffset;
            i_22 += returnoffset;
        }

        return this;
    };

    output.convolve_5x5 = function(kernel, other, min_i, min_j, max_i, max_j)
    {
        if (kernel.num_i !== 5 || kernel.num_j !== 5)
        {
            throw "kernel must be a 5x5 array";
        }

        if (other.num_i !== this.num_i || other.num_j !== this.num_j)
        {
            throw "output must be same size as input.";
        }

        if (typeof (min_i) === 'undefined' || min_i < 2)
        {
            min_i = 2;
        }

        if (typeof (min_j) === 'undefined' || min_j < 2)
        {
            min_j = 2;
        }

        if (typeof (max_i) === 'undefined' || max_i > this.num_i - 2)
        {
            max_i = this.num_i - 2;
        }

        if (typeof (max_j) === 'undefined' || max_j > this.num_j - 2)
        {
            max_j = this.num_j - 2;
        }

        var offset = (min_i - 2) + this.num_i * (min_j - 2);
        var returnoffset = this.num_i - 4 - (max_i - min_i) + 4;

        var i_00 = 0 + offset;
        var i_10 = i_00 + 1;
        var i_20 = i_10 + 1;
        var i_30 = i_20 + 1;
        var i_40 = i_30 + 1;

        var i_01 = this.num_i + offset;
        var i_11 = i_01 + 1;
        var i_21 = i_11 + 1;
        var i_31 = i_21 + 1;
        var i_41 = i_31 + 1;

        var i_02 = 2 * this.num_i + offset;
        var i_12 = i_02 + 1;
        var i_22 = i_12 + 1;
        var i_32 = i_22 + 1;
        var i_42 = i_32 + 1;

        var i_03 = 3 * this.num_i + offset;
        var i_13 = i_03 + 1;
        var i_23 = i_13 + 1;
        var i_33 = i_23 + 1;
        var i_43 = i_33 + 1;

        var i_04 = 4 * this.num_i + offset;
        var i_14 = i_04 + 1;
        var i_24 = i_14 + 1;
        var i_34 = i_24 + 1;
        var i_44 = i_34 + 1;

        var k_00 = kernel.arr[0];
        var k_10 = kernel.arr[1];
        var k_20 = kernel.arr[2];
        var k_30 = kernel.arr[3];
        var k_40 = kernel.arr[4];

        var k_01 = kernel.arr[5];
        var k_11 = kernel.arr[6];
        var k_21 = kernel.arr[7];
        var k_31 = kernel.arr[8];
        var k_41 = kernel.arr[9];

        var k_02 = kernel.arr[10];
        var k_12 = kernel.arr[11];
        var k_22 = kernel.arr[12];
        var k_32 = kernel.arr[13];
        var k_42 = kernel.arr[14];

        var k_03 = kernel.arr[15];
        var k_13 = kernel.arr[16];
        var k_23 = kernel.arr[17];
        var k_33 = kernel.arr[18];
        var k_43 = kernel.arr[19];

        var k_04 = kernel.arr[20];
        var k_14 = kernel.arr[21];
        var k_24 = kernel.arr[22];
        var k_34 = kernel.arr[23];
        var k_44 = kernel.arr[24];

        for (var j = min_j; j < max_j; j++)
        {
            for (var i = min_i; i < max_i; i++)
            {
                this.arr[i_22] =
                        other.arr[i_00] * k_00
                        + other.arr[i_10] * k_10
                        + other.arr[i_20] * k_20
                        + other.arr[i_30] * k_30
                        + other.arr[i_40] * k_40

                        + other.arr[i_01] * k_01
                        + other.arr[i_11] * k_11
                        + other.arr[i_21] * k_21
                        + other.arr[i_31] * k_31
                        + other.arr[i_41] * k_41

                        + other.arr[i_02] * k_02
                        + other.arr[i_12] * k_12
                        + other.arr[i_22] * k_22
                        + other.arr[i_32] * k_32
                        + other.arr[i_42] * k_42

                        + other.arr[i_03] * k_03
                        + other.arr[i_13] * k_13
                        + other.arr[i_23] * k_23
                        + other.arr[i_33] * k_33
                        + other.arr[i_43] * k_43

                        + other.arr[i_04] * k_04
                        + other.arr[i_14] * k_14
                        + other.arr[i_24] * k_24
                        + other.arr[i_34] * k_34
                        + other.arr[i_44] * k_44;

                i_00++;
                i_10++;
                i_20++;
                i_30++;
                i_40++;

                i_01++;
                i_11++;
                i_21++;
                i_31++;
                i_41++;

                i_02++;
                i_12++;
                i_22++;
                i_32++;
                i_42++;

                i_03++;
                i_13++;
                i_23++;
                i_33++;
                i_43++;

                i_04++;
                i_14++;
                i_24++;
                i_34++;
                i_44++;
            }

            i_00 += returnoffset;
            i_10 += returnoffset;
            i_20 += returnoffset;
            i_30 += returnoffset;
            i_40 += returnoffset;

            i_01 += returnoffset;
            i_11 += returnoffset;
            i_21 += returnoffset;
            i_31 += returnoffset;
            i_41 += returnoffset;

            i_02 += returnoffset;
            i_12 += returnoffset;
            i_22 += returnoffset;
            i_32 += returnoffset;
            i_42 += returnoffset;

            i_03 += returnoffset;
            i_13 += returnoffset;
            i_23 += returnoffset;
            i_33 += returnoffset;
            i_43 += returnoffset;

            i_04 += returnoffset;
            i_14 += returnoffset;
            i_24 += returnoffset;
            i_34 += returnoffset;
            i_44 += returnoffset;
        }

        return this;
    };

    output.sum = function() {
        var sum = 0;

        for (var i = 0; i < num_total; i++)
        {
            sum += this.arr[i];
        }

        return sum;
    };

    output.max = function() {
        var max = -Number.MAX_VALUE;
        ;

        for (var i = 0; i < num_total; i++)
        {
            max = Math.max(max, this.arr[i]);
        }

        return max;
    };

    output.min = function() {
        var min = Number.MAX_VALUE;
        ;

        for (var i = 0; i < num_total; i++)
        {
            min = Math.min(min, this.arr[i]);
        }

        return min;
    };

    return output;
}





function List1D(input)
{
    "use strict";

    var output;

    if (typeof this !== "undefined") {
        // if new was called, use the object that was created
        output = this;
    } else {
        // if new was not called, start with base object.
        output = {};
    }

    output.arr = [];

    if (typeof input.newObject !== 'undefined')
    {

        for (var i = 0; i < input.num; i++)
        {
            output.arr[i] = input.newObject(i);
        }
    } else {
        for (var i = 0; i < input.num; i++)
        {
            output.arr[i] = {};
        }
    }

    output.get = function(i)
    {
        return output.arr[i];
    };

    output.set = function(i, value)
    {
        output.arr[i] = value;
    };

    return output;

}
;



/**
 *
 * @param {type} input
 * {
 *     newObject : function(),
 *     num_i: #,
 *     num_j: #
 * }
 * @returns {List2D}
 */
function List2D(input)
{
    "use strict";

    var output;

    if (typeof this !== "undefined") {
        // if new was called, use the object that was created
        output = this;
    } else {
        // if new was not called, start with base object.
        output = {};
    }

    var total_num = input.num_i * input.num_j;

    output.arr = [];

    if (typeof input.newObject !== 'undefined')
    {

        for (var j = 0; j < input.num_j; j++)
        {
            for (var i = 0; i < input.num_i; i++)
            {
                output.arr[i + j * input.num_i] = input.newObject(i, j);
            }
        }
    } else {
        for (var j = 0; j < input.num_j; j++)
        {
            for (var i = 0; i < input.num_i; i++)
            {
                output.arr[i + j * input.num_i] = {};
            }
        }
    }

    output.get = function(i, j)
    {
        return this.arr[i + j * input.num_i];
    };

    output.set = function(i, j, value)
    {
        this.arr[i + j * input.num_i] = value;

    };

    return output;


}
;


/**
 *
 * @param {type} input structure
 {
 num_blocks_i : #, // number
 num_blocks_j : #,
 cells_per_block : #,
 num_fields : #
 max_kernel_size: #
 }
 * @returns {Cellblock2D}
 */
function Cellblock2D(input)
{
    "use strict";

    var output;

    if (typeof this !== "undefined") {
        // if new was called, use the object that was created
        output = this;
    } else {
        // if new was not called, start with base object.
        output = {};
    }

    var num_boundary = (input.max_kernel_size - 1) / 2;
    var num_cells_i = input.num_blocks_i * input.cells_per_block + input.max_kernel_size - 1;
    var num_cells_j = input.num_blocks_j * input.cells_per_block + input.max_kernel_size - 1;

    output.blocks = List2D({
        // the grid of blocks is a 2d list
        num_i: input.num_blocks_i,
        num_j: input.num_blocks_j
    });

    // a temporary set of fields used for computation
    var hidden_fields = List1D({
        newObject: function() {
            return Float2D({
                num_i: num_cells_i,
                num_j: num_cells_j
            });
        },
        num: input.num_fields
    });

    // the official set of fields
    output.fields = List1D({
        newObject: function() {
            return Float2D({
                num_i: num_cells_i,
                num_j: num_cells_j
            });
        },
        num: input.num_fields
    });

    output.step = function()
    {


        var block;
        var field1;
        var field2;
        var kernel;
        var starti;
        var startj;
        var interaction;

        // do transport
        for (var field_i = 0; field_i < input.num_fields; field_i++)
        {
            field1 = output.fields.get(field_i);
            field2 = hidden_fields.get(field_i);

            // start with zero
            field2.scale(0, num_boundary, num_boundary, num_cells_i-num_boundary, num_cells_j-num_boundary);

            for (var block_j = 0; block_j < input.num_blocks_j; block_j++)
            {
                for (var block_i = 0; block_i < input.num_blocks_i; block_i++)
                {
                    kernel = output.blocks.get(block_i, block_j).transport.get(field_i);

                    starti = block_i * input.cells_per_block + num_boundary;
                    startj = block_j * input.cells_per_block + num_boundary;

                    if (kernel === null) {

                        field2.copy(field1, starti, startj, starti + input.cells_per_block, startj + input.cells_per_block);

                    } else if (kernel.num_i === 1) {

                        field2.linear_add(kernel[0], field1, starti, startj, starti + input.cells_per_block, startj + input.cells_per_block);

                    } else if (kernel.num_i === 3) {

                        field2.convolve_3x3(kernel, field1, starti, startj, starti + input.cells_per_block, startj + input.cells_per_block);

                    } else if (kernel.num_i === 5) {

                        field2.convolve_5x5(kernel, field1, starti, startj, starti + input.cells_per_block, startj + input.cells_per_block);

                    }
                }
            }
        }

        // do interactions
        for (var field_i = 0; field_i < input.num_fields; field_i++)
        {
            field1 = output.fields.get(field_i);

            field1.scale(0, num_boundary, num_boundary, num_cells_i-num_boundary, num_cells_j-num_boundary);


            for (var block_j = 0; block_j < input.num_blocks_j; block_j++)
            {
                for (var block_i = 0; block_i < input.num_blocks_i; block_i++)
                {
                    block = output.blocks.get(block_i, block_j);
                    starti = block_i * input.cells_per_block + num_boundary;
                    startj = block_j * input.cells_per_block + num_boundary;

                    for (var field_j = 0; field_j < input.num_fields; field_j++)
                    {
                        interaction = block.interaction.get(field_i, field_j);

                        if (interaction !== 0) {

                            field2 = hidden_fields.get(field_j);

                            field1.linear_add(interaction, field2, starti, startj, starti + input.cells_per_block, startj + input.cells_per_block);
                        }
                    }

                }
            }


        }


    };

    return output;

}
;

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
function ReactorBlock(input)
{
    "use strict";

    var output;

    if (typeof this !== "undefined") {
        // if new was called, use the object that was created
        output = this;

    } else {
        // if new was not called, start with base object.
        output = {};
    }


    output.transport = List1D({num: 5});

    // 0: fast neutrons
    output.transport.set(0, Float2D({num_i: 5, num_j: 5}));

    // 1: thermal neutrons
    output.transport.set(1, Float2D({num_i: 5, num_j: 5}));
    //output.transport.set(1, null);

    // 2: fissions (no transport)
    output.transport.set(2, null);

    // 3: delayed neutrons (no transport)
    output.transport.set(3, null);

    // 4: temperature
    output.transport.set(4, Float2D({num_i: 5, num_j: 5}));
    //output.transport.set(4, null);


    output.interaction = Float2D({num_i: 5, num_j: 5});




    output.compute = function() {


        compute_transport(input.fast_scattering, output.transport.get(0));


        compute_transport(input.thermal_scattering, output.transport.get(1));


        compute_transport(input.conductivity, output.transport.get(4));


        // fast to fast
        output.interaction.set(0, 0, 1 - (input.fast_absorption + input.moderation) + input.fast_absorption * input.fast_fission * input.prompt_factor * input.neutrons_per_fission);
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
        output.interaction.set(1, 1, 1 - input.thermal_absorption);
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
        output.interaction.set(4, 4, (1 - input.cooling_rate) / input.specific_heat);

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


        kernel.scale(1 / kernel.sum());
    };

    output.compute();

    return output;
};
