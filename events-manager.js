(function(exports) {
  'use strict';

  if (exports.EventsManager) {
    return;
  }

  var EventInstance = function(name, namespace) {
    var _isStoppedPropagation = false;

    this.name = name;
    this.namespace = namespace;

    this.stopPropagation = function() {
      _isStoppedPropagation = true;
    };

    this.isStoppedPropagation = function() {
      return _isStoppedPropagation;
    };

    this.resetStopPropagation = function() {
      _isStoppedPropagation = false;
    };
  };

  var EventPriority = function() {
    var _priorities = {
      low: -1,
      normal: 0,
      high: 9999999
    };

    this.formatPriority = function(priority) {
      if (typeof priority == 'undefined' || priority === null) {
        priority = 'normal';
      }

      if (typeof priority == 'string') {
        if (!(priority in _priorities)) {
          priority = 'normal';
        }
        priority = _priorities[priority];
      }

      return priority;
    };

    this.sortByPriority = function(list) {
      list.sort(function(a, b) {
        return b.priority - a.priority;
      });
    };

  };

  exports.EventsManager = function() {

    var _this = this,
        _events = [],
        _eventsAnything = [],
        _priority = new EventPriority(),
        _locks = {};

    function _formatEventNames(eventName) {
      var events = [];

      eventName.split(' ').map(function(name) {
        if (name) {
          events.push(name);
        }
      });

      return events;
    }

    function _namespace(eventName) {
      var namespace = null;
      eventName = eventName.split('.');
      if (eventName.length > 1) {
        namespace = eventName[0];
        eventName = eventName[1];
      }
      else {
        eventName = eventName[0];
      }

      return {
        name: eventName,
        namespace: namespace
      };
    }

    function _checkLock(eventName) {
      if (_locks[eventName]) {
        console.warn('EventsManager: Be careful, event "' + eventName + '" is locked for use');
      }
    }

    this.eventsName = function() {
      var names = [],
          name = null;

      for (name in _events) {
        names.push(name);
      }

      return names;
    };

    this.eventsStack = function(eventName) {
      return (_events[eventName] || []).concat(_eventsAnything);
    };

    function _fireLoop(eventName, eventArgs, events, callback, i, results) {
      i = i || 0;
      results = results || [];

      if (i === events.length) {
        if (callback) {
          callback(results);
        }

        return;
      }

      var evt = events[i];

      if (evt) {
        var eventInstance = new EventInstance(eventName, evt.namespace);

        if (evt.async) {
          evt.func.call(eventInstance, eventArgs, function(result) {
            results.push(typeof result == 'undefined' ? null : result);

            _fireLoop(eventName, eventArgs, events, callback,
              eventInstance.isStoppedPropagation() ? events.length : i + 1,
              results
            );
          });

          return;
        }

        var result = evt.func.call(eventInstance, eventArgs);

        results.push(typeof result == 'undefined' ? null : result);

        _fireLoop(eventName, eventArgs, events, callback,
          eventInstance.isStoppedPropagation() ? events.length : i + 1,
          results
        );

        return;
      }

      _fireLoop(eventName, eventArgs, events, callback, i + 1, results);
    }

    this.fire = function(eventName, eventArgs, callback) {
      var values = [];

      if (typeof _events[eventName] != 'undefined') {

        _checkLock(eventName);

        _locks[eventName] = true;

        _fireLoop(eventName, eventArgs, _events[eventName], function(results) {
          if (callback) {
            callback(results);
          }
        });

        delete _locks[eventName];
      }

      if (_eventsAnything.length) {
        _fireLoop(eventName, eventArgs, _eventsAnything, function(results) {
          if (callback) {
            callback(results);
          }
        });
      }

      return values;
    };

    function _on(eventName, eventFunc, priority, async) {
      priority = _priority.formatPriority(priority);

      _checkLock(eventName);

      _formatEventNames(eventName).map(function(name) {
        name = _namespace(name);

        _events[name.name] = _events[name.name] || [];
        _events[name.name].push({
          namespace: name.namespace,
          priority: priority,
          func: eventFunc,
          async: async || false
        });

        _priority.sortByPriority(_events[name.name]);
      });
    }

    this.on = function(eventName, eventFunc, priority) {
      _on(eventName, eventFunc, priority);

      return _this;
    };

    this.onSafe = function(eventName, eventFunc, priority) {
      _this.off(eventName, eventFunc);

      return _this.on(eventName, eventFunc, priority);
    };

    this.onAsync = function(eventName, eventFunc, priority) {
      _on(eventName, eventFunc, priority, true);

      return _this;
    };

    this.onAsyncSafe = function(eventName, eventFunc, priority) {
      _this.off(eventName, eventFunc);

      return _this.onAsync(eventName, eventFunc, priority);
    };

    this.onAnything = function(eventNamespace, eventFunc, priority) {
      priority = _priority.formatPriority(priority);

      _eventsAnything.push({
        namespace: eventNamespace,
        priority: priority,
        func: eventFunc
      });

      return _this;
    };

    this.onAnythingSafe = function(eventNamespace, eventFunc, priority) {
      _this.offAnything(eventNamespace, eventFunc);

      return _this.onAnything(eventNamespace, eventFunc, priority);
    };

    this.off = function(eventName, eventFunc) {
      _checkLock(eventName);

      _formatEventNames(eventName).map(function(name) {
        name = _namespace(name);

        if (typeof _events[name.name] != 'undefined') {
          for (var i = 0, len = _events[name.name].length; i < len; i++) {
            if (name.namespace && _events[name.name][i].namespace != name.namespace) {
              continue;
            }

            if (_events[name.name][i].func.toString() == eventFunc.toString()) {
              _events[name.name].splice(i, 1);
              break;
            }
          }
        }
      });

      return _this;
    };

    function _offAnything(eventNamespace, eventFunc, entireNamespace) {
      for (var i = 0, len = _eventsAnything.length; i < len; i++) {
        if (_eventsAnything[i].namespace != eventNamespace) {
          continue;
        }

        if (entireNamespace || _eventsAnything[i].func.toString() == eventFunc.toString()) {
          _eventsAnything.splice(i, 1);

          break;
        }
      }
    }

    this.offAnything = function(eventNamespace, eventFunc) {
      _offAnything(eventNamespace, eventFunc);

      return _this;
    };

    this.offNamespace = function(namespace) {
      var name;

      for (name in _events) {
        var event = _events[name],
            newEvent = [];

        for (var i = event.length - 1; i >= 0; i--) {
          if (event[i].namespace !== namespace) {
            newEvent.push(event[i]);
          }
        }

        if (newEvent.length !== event.length) {
          _checkLock(name);
          _events[name] = newEvent;
        }
      }

      _offAnything(namespace, null, true);

      return _this;
    };

    this.offAll = function() {
      _events = [];
      _eventsAnything = [];
    };

  };

})(typeof exports == 'undefined' ? this : exports);
