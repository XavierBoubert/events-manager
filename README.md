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

// plug an event with a name and a function
// the function always give the args variable object
// you can add a priority (optional) in the third argument like:
// 'low', 'normal', 'high' or and integer value
myClass.on('changeSomething', function(args) {

  // show {hello: 'world'}
  console.log(args);
}, 'normal');

// fire an event trigger all of the plugged events
// the second argument is the args variable
myClass.fire('changeSomething', {
  hello: 'world'
});

// it's possible to remove an event registered
// the comparision is done on the exact function string
myClass.removeEvent('changeSomething', function(args) {

  // show {hello: 'world'}
  console.log(args);
});

// remove all object events
myClass.removeEvents();

// onSafe delete automatically the same event if
// it is already plugged
for(var i = 0; i < 10; i++) {
  myClass.onSafe('changeSomething', function(args) {

    // will be fire just once
    console.log(args);
  });
}

// events can use a namespace to register by feature
// they works in the same way as traditionnal event
myClass.on('myNamespace.changeSomething', function(args) {
  // ...
});

// you can remove all events from namespace registered
myClass.removeEventsNamespace('myNamespace');

// many events can be used in the same call with comas separation
myClass.on('changeAData, myNamespace.changeSomething, ANewChange', function(args) {
  // ...
});

// it's possible to plugin all of the events with onAnything()
// you have to use a namespace before for security
myClass.onAnything('myNamespace', function() {

}, 'normal');
```


## Lead contribution team

* [Xavier Boubert](http://xavierboubert.fr) [@xavierboubert](http://twitter.com/XavierBoubert)