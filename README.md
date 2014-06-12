#Paprika

###JavaScript framework for paper-based interaction in the browser

Paprika is an experimental framework exploring paper-based interaction as input for browser applications. It uses [Chilitags](https://github.com/chili-epfl/chilitags) fiducial markers in combination with [three.js](http://threejs.org/) to detect and model the manipulation of paper elements like cards.

The main goal of Paprika is to present an accessible abstraction model for paper interactions, allowing developers to easily work with augmented paper without prior knowledge of computer vision and the underlying technology at work.

For example, Paprika allows to bind the psition or orientation of a paper card to a JavaScript function call, or have a function executed when a card is flipped or stacked on top of another.

###Content

The main application code is contained within [`js/paprika.js`](js/paprika.js), which depends on [`js/chilitags.js`](js/chilitags.js) and [`js/three.min.js`](js/three.min.js).

###Paprika Games

The root of this repository contains games demonstrating the use of paper cards and Paprika as input. They're built using [Phaser](http://phaser.io/), an open source game framework for HTML5 games. Here is a quick [video presentation](https://vimeo.com/98052994) of the games.

You can test the games on our [github.io page](http://chili-epfl.github.io/paprika/).

###Paprika Examples

The `examples` directory contains samples illustrating the usage of the different functions implemented in the framework.

You can try them live on our [github.io page](http://chili-epfl.github.io/paprika/).