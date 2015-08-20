precision mediump float;

// our texture
uniform sampler2D u_image_A;
uniform sampler2D u_image_B;
//uniform vec2 u_textureSize;

// the texCoords passed in from the vertex shader.
varying vec2 v_texCoord;

void main() {

   gl_FragColor = texture2D(u_image_A, v_texCoord) - 0.5*texture2D(u_image_B, v_texCoord);
}
