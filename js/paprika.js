// stuff to get tags detected, skip till next comment ;)
navigator.getUserMedia  = navigator.getUserMedia
                       || navigator.webkitGetUserMedia
                       || navigator.mozGetUserMedia
                       || navigator.msGetUserMedia;

if (!!navigator.getUserMedia) console.log("Camera OK");
else alert("No camera :(");

var video = document.getElementById('inputVideo');
var videoCanvas = document.getElementById('videoCanvas');
var localMediaStream = null;

navigator.getUserMedia(
    {video: true},
    function(stream) {
        window.URL = window.URL || window.webkitURL;
        video.src = window.URL.createObjectURL(stream);
        localMediaStream = stream;
        video.play();
    },
    function(e) { console.log('Error!', e); });

var init = function() {
    loop();
}

// list of functions to call back when tags have been detected in a new frame
var updateCallbacks = [];

// mapping from objects (aggregates of tags) to specific callbacks
var objectCallbacks = {};

// detection loop, calling the functions in updateCallbacks and objectCallbacks
var loop = function() {
    if (localMediaStream) {
        var videoIsReady = false;
        while (!videoIsReady) {
            try {
                videoCanvas.getContext('2d').drawImage(inputVideo, 0, 0, video.width, video.height);
                videoIsReady = true;
            } catch (e) {
                if (e.name.indexOf("NS_ERROR_NOT_AVAILABLE") == -1) throw e;
            }
        }
        var objects = Chilitags.estimate(videoCanvas, false);
        for (var i=0; i<updateCallbacks.length; i++) {
            updateCallbacks[i].call(this, objects);
        }
        for (var objectName in objects) {
            if (objectName in objectCallbacks) {
                var callbacks = objectCallbacks[objectName];
                for (var i=0; i < callbacks.length; i++) {
                    callbacks[i].call(this, objects[objectName]);
                }
            }
        }
    }
    requestAnimationFrame(loop);
}

// start the detection
//the timeOut is a work around Firefox's bug 879717
video.addEventListener('play', function() {setTimeout(init, 2500);}, false);

// registers a function to call when a new frame has been process by Chilitags
var onTagUpdate = function(callback) {
    updateCallbacks.push(callback);
};

// registers a `callback`function to call when `objectName` has entered the view
var onAppear = function(callback, objectName) {
    
    // defines if object was present in previous frame
    var wasPresent = false;
    
    // the logic computing whether or not calling `callback`
    var trigger = function(objects) {
        // compute current visibility
        var isPresent = (objectName in objects);
        // detect if entered
        if(!wasPresent && isPresent) callback( {objectName:objectName} );
        // save current visibility
        wasPresent = isPresent;
    };
    trigger.reset = function() { wasPresent = false; }
    
    // we add this trigger to the list of callbacks
    updateCallbacks.push(trigger);
    
    return trigger;
}

// registers a `callback`function to call when `objectName` has exited the view
var onDisappear = function(callback, objectName) {
    
    // defines if object was present in previous frame
    var wasPresent = false;
    
    // the logic computing whether or not calling `callback`
    var trigger = function(objects) {
        // compute current visibility
        var isPresent = (objectName in objects);
        // detect if exited
        if(!isPresent && wasPresent) callback( {objectName:objectName} );
        // save current visibility
        wasPresent = isPresent;
    };
    trigger.reset = function() { wasPresent = false; }
    
    // we add this trigger to the list of callbacks
    updateCallbacks.push(trigger);
    
    return trigger;
}

// registers a `callback` function to call when `objectName` has been rotated
// by at least `minDelta` radians
var onRotate = function(callback, objectName, minDelta) {

    // stores the initial orientation to compare against
    var previousOrientation = undefined;

    // the logic computing whether or not calling `callback` when an object's
    // transformation matrix has been updated
    var trigger = function(transformation) {
        // format the transformationMatrix into a THREE.Matrix4
        var transformationMatrix = new THREE.Matrix4();
        transformationMatrix.set.apply(transformationMatrix, transformation);

        // compute the euler angles of the transformation, with Z as axis of
        // the first rotation, so that we can ignore rotation on X and Y.
        var angles = new THREE.Euler();
        angles.setFromRotationMatrix(transformationMatrix).reorder('ZXY');
        var orientation = angles.z;

        // initialisation of previousOrientation
        if (previousOrientation === undefined) {
            previousOrientation = orientation;
            
            callback({
                objectName:objectName,
                transformation:transformation,
                orientation:orientation,
                delta:0});
        }

        // computing the rotation since `previousOrientation`,
        // and normalizing in ]-Math.PI, Math.PI]
        var delta = orientation-previousOrientation;
        if (delta > Math.PI) delta = 2*Math.PI-delta;
        if (delta <= -Math.PI) delta = 2*Math.PI-delta;

        // if the rotation is beyond the minDelta threshold, call the callback
        // and reset the reference orientation (previousOrientation)
        if (Math.abs(delta) > minDelta) {
            callback({
                objectName:objectName,
                transformation:transformation,
                orientation:orientation,
                delta:delta});
            previousOrientation = orientation;
        }
    };
    trigger.reset = function() { previousOrientation = undefined; }

    // we add this trigger to the list of callbacks related to `objectName`
    if (objectName in objectCallbacks) objectCallbacks[objectName].push(trigger);
    else objectCallbacks[objectName] = [trigger];
    
    return trigger;
};

// registers a `callback` function to call when `objectName` is within +/-
// `epsilon` radians from `goalOrientation`, and when the orientation of
// `objectName` changes again by at least `epsilon` radians. Note that this
// sets a different threshold to avoid problematic border cases.
// The default value for epsilon is 0.025 * Math.PI (9 degrees.)
var onOrient = function(callback, objectName, goalOrientation, epsilon) {
    epsilon = typeof epsilon !== 'undefined' ? epsilon : 0.025 * Math.PI;

    // keeps track of whether the orientation of the object is already within
    // the target orientation range
    var isIn = false;
    // keeps track of the orientation at which the object was detected to be
    // close enough from the goal orientation
    var triggeringOrientation;

    // same as onRotate...
    var trigger = function(transformation) {
        var transformationMatrix = new THREE.Matrix4();
        transformationMatrix.set.apply(transformationMatrix, transformation);
        var euler = new THREE.Euler().setFromRotationMatrix(transformationMatrix);
        euler.reorder('ZXY');

        // ... but this time we compare the current orientation with the target
        // one if the object is not yet oriented as expected, or with the
        // orientation it had when it was deemed close enough form the target
        var orientation = euler.z;
        var delta = Math.abs(
            (isIn?triggeringOrientation:goalOrientation)-orientation);
        
        while (delta < 0) delta += 2*Math.PI;
        while (delta >= 2*Math.PI) delta -= 2*Math.PI;
        if (delta > Math.PI) delta = 2*Math.PI-delta;

        // if the object is oriented as expected but wasn't before, or vice
        // versa, we switch the state storing whether the goal is reached, and
        // we call the callback
        if (   !isIn && delta < epsilon
            ||  isIn && delta > epsilon) {
            isIn = !isIn;
            if (isIn) {
                triggeringOrientation = orientation;
                callback({
                    objectName:objectName,
                    transformation:transformation,
                    orientation:orientation,
                    goalOrientation:goalOrientation,
                    hasEntered:isIn});
            }
        }
    };
    trigger.reset = function() { isIn = false; }

    // we add this trigger to the list of callbacks related to `objectName`
    if (objectName in objectCallbacks) objectCallbacks[objectName].push(trigger);
    else objectCallbacks[objectName] = [trigger];
    
    return trigger;
};
