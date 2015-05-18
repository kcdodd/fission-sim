precision mediump float;

//cellblock information
uniform float u_numCells;
uniform vec2 u_numBlocks;
uniform float u_numFields;

// fields
uniform vec2 u_fieldTexSize;
uniform sampler2D u_fields;

// kernals
uniform vec2 u_kernalTexSize;
uniform sampler2D u_kernals;

// field interactions
uniform vec2 u_interactionTexSize;
uniform sampler2D u_interactions;

// the texCoords passed in from the vertex shader.
varying vec2 v_texCoord;

void main() {

    // compute 1 pixel in texture coordinates.
    vec2 dX = vec2(1.0, 0.0) / u_fieldTexSize;
    vec2 dY = vec2(0.0, 1.0) / u_fieldTexSize;

    vec2 dX2 = 2*dX;
    vec2 dY2 = 2*dY;

    // 5x5 convolution
    gl_FragColor = (
        texture2D(u_fields, v_texCoord - dX2 - dY2) + // -2
        texture2D(u_fields, v_texCoord - dX - dY2) +
        texture2D(u_fields, v_texCoord - dY2) +
        texture2D(u_fields, v_texCoord + dX - dY2) +
        texture2D(u_fields, v_texCoord + dX2 - dY2) +
        texture2D(u_fields, v_texCoord - dX2 - dY) + // -1
        texture2D(u_fields, v_texCoord - dX - dY) +
        texture2D(u_fields, v_texCoord - dY) +
        texture2D(u_fields, v_texCoord + dX - dY) +
        texture2D(u_fields, v_texCoord + dX2 - dY) +
        texture2D(u_fields, v_texCoord - dX2) + // 0
        texture2D(u_fields, v_texCoord - dX) +
        texture2D(u_fields, v_texCoord) +
        texture2D(u_fields, v_texCoord + dX) +
        texture2D(u_fields, v_texCoord + dX2) +
        texture2D(u_fields, v_texCoord - dX2 + dY) + // +1
        texture2D(u_fields, v_texCoord - dX + dY) +
        texture2D(u_fields, v_texCoord + dY) +
        texture2D(u_fields, v_texCoord + dX + dY) +
        texture2D(u_fields, v_texCoord + dX2 + dY) +
        texture2D(u_fields, v_texCoord - dX2 + dY2) + // +2
        texture2D(u_fields, v_texCoord - dX + dY2) +
        texture2D(u_fields, v_texCoord + dY2) +
        texture2D(u_fields, v_texCoord + dX + dY2) +
        texture2D(u_fields, v_texCoord + dX2 + dY2))/25.0;
}
