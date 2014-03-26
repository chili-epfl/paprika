importScripts('chilitags.js');

onmessage = function (e) {
    var img = e.data.img;
    var w = e.data.w;
    var h = e.data.h;
    
    var inputBuf = Module._malloc(w*h);
    
    
    for(var i=0; i<img.data.length/4; i++){
        setValue(inputBuf+i, 
                 Math.min(0.299 * img.data[4*i] + 
                          0.587 * img.data[4*i+1] + 
                          0.114 * img.data[4*i+2], 
                          255), 
                 "i8");
    }
    
    var output = Module.ccall('estimate', 'string', ['int', 'int', 'int', 'boolean'], [inputBuf, w, h, false]);
    var objects = JSON.parse(output);
    Module._free(inputBuf);
    
    if(objects !== undefined) postMessage({objects:objects});
};