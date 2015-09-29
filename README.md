# EventsManager.js

JavaScript class inherit to add an events management

## Follow the project

* [Licence](https://github.com/XavierBoubert/events-manager/blob/master/LICENSE)
* [Changelog](https://github.com/XavierBoubert/events-manager/blob/master/CHANGELOG.md)
* [Milestones](https://github.com/XavierBoubert/events-manager/issues/milestones?state=open)


## Contribute

To contribute to the project, read the [Contribution guidelines](https://github.com/XavierBoubert/events-manager/blob/master/CONTRIBUTING.md).
After that, you can create your own Pull Requests (PR) and submit them here.


## Installation

Copy the [events-manager.js](https://github.com/XavierBoubert/events-manager/blob/master/events-manager.js) file into your project and include it in your HTML page.
You can use it at anytime on your web page.


## Manage your objects events

In your object declaration, call EventsManager to get access of the features:

```javascript
function MyClass() {

  // inherit EventsManager features
  EventsManager.call(this);

}

var myClass = new MyClass();

// Register an event with a name and a function
// the function always gives the args variable object
// you can add a priority (optional) in the third argument like:
// 'low', 'normal' (default), 'high' or and integer value
myClass.on('changeSomething', function(args) {

  // Displays {hello: 'world'}
  console.log(args);

  // To stop the events list propagation
  this.stopPropagation();

  // To retrieve the event name
  console.log(this.name);

  // To retrieve the event namespace
  console.log(this.namespace);

  // Return a value is stacked in the .fire() results
  return 'a value';

}, 'normal');

// If your stack of events needs to wait until your event have
// completed its async execution, use "onAsync"
// This method provide a "callback" function
myClass.onAsync('changeSomething', function(args, callback) {

  // Provide a value to retrieve it in the .fire() results
  callback('a value');

});

// For more safety the method "onSafe" deletes
// automatically the same event if it is already registered
for(var i = 0; i < 10; i++) {
  myClass.onSafe('changeSomething', function(args) {

    // will be fire just once
    console.log(args);
  });

  // The same way for "onAsync"
  myClass.onAsyncSafe('changeSomething', function(args, callback) {

    // will be fire just once
    console.log(args);

    callback();
  });
}

// You can register a special event to be fired on every .fire()
// You have to use a namespace before for safety
// .onAnythingSafe() is also accessible
myClass.onAnything('myNamespace', function() {

});

// Fire an event trigger all of the registered events
// The second (optionnal) argument is the args variable
// The third (optionnal) argument is the callback method
myClass.fire('changeSomething', {
  hello: 'world'
}, function(results) {

  // Every returned values in the events are stacked
  // in the "results" array

});

// To remove an event from the stack, use .off() with the exact
// same function on it
myClass.off('changeSomething', function(args) {

});

// To remove an onAnything() event
myClass.offAnything('myNamespace', function(args) {

});

// To remove all registered events
myClass.removeAll();

// Events can use a namespace to be registered by feature
// They works in the same way as traditionnal event
myClass.on('myNamespace.changeSomething', function(args) {
  // ...
});

// you can remove all events from namespace registered
myClass.offNamespace('myNamespace');

// many events can be used in the same call with a space separation
myClass.on('changeAData myNamespace.changeSomething ANewChange', function(args) {
  // ...
});
```


## Lead contribution team

* [Xavier Boubert](http://xavierboubert.fr) [@xavierboubert](http://twitter.com/XavierBoubert)
