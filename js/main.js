
"use strict";

require.config({
    paths : {
        jquery : 'lib/jquery-1.11.3.min',
        jquery_ui : 'lib/jquery-ui.min'
    }
});

require([
    'reactor_webgl_ui',
    'reactor_ui'
], function(app_webgl, app) {


    app_webgl.init();

});
