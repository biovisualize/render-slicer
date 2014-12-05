render-slicer
============
render-slicer.js is a small utility for progressive rendering using requestAnimationFrame.

It is based on a [small utility for progressive rendering](http://bl.ocks.org/syntagmatic/raw/3341641/). Since I use it a lot and want to expand it, 
I thought it deserved a proper home on GitHub, so users can modify it and share. My only contribution for now was to add a unit test suite and some minor mods.

Here is an [example of progressive rendering](http://bl.ocks.org/biovisualize/f84111e34edc6d594216) on two line charts, each rendering 10K points. 
I set the rendering rate down so the progressive rendering is more visible.

Documentation
-------------
**renderSlicer() takes a function and returns a version wrapped with progressive rendering**  
var foo = function(){ /* render something */ }  
var fooWrapped = renderSlicer(foo);

**The wrapped function takes an array and starts a loop to repeatedly call the function, passing each data point as argument**  
fooWrapped(data);

**New data can be pushed to the render queue**  
fooWrapped.add(moreData);

**The rate() setter will change the chunk size, or return the rate value when called without argument**  
var fooWrapped = renderSlicer(foo).rate(100);

**It provides getters for the size of the remaining data to be processed. remaining() is decreasing by chunk size 
and count() is increasing every frame**  
fooWrapped.count();  
fooWrapped.remaining();

**It also provides a series of callbacks**  
fooWrapped.onStart(function(){ console.log('queue is started'); });  
fooWrapped.onChunkDone(function(){ console.log('chunk is done'); });  
fooWrapped.onFrameDone(function(){ console.log('frame is done'); });  
fooWrapped.onDone(function(){ console.log('queue is done'); });  