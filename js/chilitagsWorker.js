importScripts('chilitags.js');

onmessage = function (e) {
    switch (e.data.type) {
        case "estimate":
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
            break;

        case "bundle":
            var bundles = e.data.bundles;
            var configFile = '%YAML:1.0\n';
            for (var bundleId in bundles) {
                configFile += bundleId+':\n';
                var bundle = bundles[bundleId];
                for (var tagId in bundle) {
                    configFile += '  - tag: '+tagId+'\n';
                    var tagInfo = bundle[tagId];
                    if ("size" in tagInfo) 
                        configFile += '    size: '+tagInfo["size"]+'\n';
                    if ("translation" in tagInfo) 
                        configFile += '    translation: ['+tagInfo["translation"]+']\n';
                    if ("rotation" in tagInfo) 
                        configFile += '    rotation: ['+tagInfo["rotation"]+']\n';
                    if ("keep" in tagInfo) 
                        configFile += '    keep: '+tagInfo["keep"]+'\n';
                }
            }
            FS.createDataFile("/", "tagConfig.yml", configFile, true, true);
            Module.ccall('readTagConfiguration', 'void', ['string', 'boolean'], ["/tagConfig.yml", false]);
            break;
    }
};
