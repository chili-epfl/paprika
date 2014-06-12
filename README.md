#Paprika

###JavaScript framework for paper-based interaction in the browser

Paprika is an experimental framework exploring paper-based interaction as input for browser applications. It uses [Chilitags](https://github.com/chili-epfl/chilitags) fiducial markers in combination with [three.js](http://threejs.org/) to detect and model the manipulation of paper elements like cards.

The main goal of Paprika is to present an accessible abstraction model for paper interactions, allowing developers to easily work with augmented paper without prior knowledge of computer vision and the underlying technology at work.

For example, Paprika allows to bind the orientation of a paper card to a javascript variable, or set a function to be called back when a carded is tacked on another.

###Content

The main application code is contained within [`js/paprika.js`](https://raw.githubusercontent.com/chili-epfl/paprika/master/js/paprika.js), which depends on [`js/chilitags.js`](https://raw.githubusercontent.com/chili-epfl/paprika/master/js/chilitags.js) and [`js/three.min.js`](https://raw.githubusercontent.com/chili-epfl/paprika/master/js/three.min.js).

###Documentation

The `examples` directory contains samples demonstrating each feature of Paprika.

[Paprika's home page](http://chili-epfl.github.io/paprika/) lists them and lets you try them live.

###Demos

The root of this repository contains games demonstrating the integration of Paprika with [Phaser](http://phaser.io/).

Try the [live demos](http://chili-epfl.github.io/paprika/)!
