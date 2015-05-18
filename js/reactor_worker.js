
self.importScripts("/js/structures.js");

self.addEventListener('message', function(e) {

    var x = Float2D({
        num_i : 5,
        num_j: 6
    });

    throw new Error("hi");

  self.postMessage(x.arr.length);

}, false);
