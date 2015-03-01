(function() {
  'use strict';

  var EventInstance = function() {
    var _isStoppedPropagation = false;

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

    this.formatPriority = function FormatPriority(priority) {
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

    this.sortByPriority = function SortByPriority(list) {
      list.sort(function(a, b) {
        return b.priority - a.priority;
      });
    };

  };

  window.EventsManager = function() {

    var _this = this,
        _events = [],
        _eventsAnything = [],
        _priority = new EventPriority(),
        _locks = {};

    function _formatEventNames(eventName) {
      return eventName.split(',').map(function(name) {
        return name.trim();
      });
    }

    function _namespace(eventName) {
      var namespace = null;
      eventName = eventName.split('.');
      if(eventName.length > 1) {
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
      if(_locks[eventName]) {
        console.error('EventsManager: Event "' + eventName + '" is locked for use');
      }
    }

    var eventInstance = new EventInstance();

    this.eventsName = function() {
      var names = [],
          name = null;

      for(name in _events) {
        names.push(name);
      }

      return names;
    };

    this.eventsStack = function(eventName) {
      return (_events[eventName] || []).concat(_eventsAnything);
    };

    this.fire = function(eventName, eventArgs) {
      var values = [];

      if(typeof _events[eventName] != 'undefined') {

        _checkLock(eventName);

        _locks[eventName] = true;

        _priority.sortByPriority(_events[eventName]);

        for(var i = 0, len = _events[eventName].length; i < len; i++) {
          var evt = _events[eventName][i] || false;

          if(evt) {
            values.push(evt.func.call(eventInstance, eventArgs));
            if(eventInstance.isStoppedPropagation()) {
              eventInstance.resetStopPropagation();
              break;
            }
          }
        }

        delete _locks[eventName];
      }

      if(_eventsAnything.length) {
        _priority.sortByPriority(_eventsAnything);

        for(var i = 0, len = _eventsAnything.length; i < len; i++) {
          var evt = _eventsAnything[i];

          values.push(evt.func.call(eventInstance, eventName, eventArgs));
          if(eventInstance.isStoppedPropagation()) {
            eventInstance.resetStopPropagation();
            break;
          }
        }
      }

      return values;
    };

    this.on = function(eventName, eventFunc, priority) {
      priority = _priority.formatPriority(priority);

      _checkLock(eventName);

      _formatEventNames(eventName).map(function(name) {
        name = _namespace(name);

        _events[name.name] = _events[name.name] || [];
        _events[name.name].push({
          namespace: name.namespace,
          priority: priority,
          func: eventFunc
        });
      });

      return _this;
    };

    this.onSafe = function(eventName, eventFunc, priority) {
      _this.removeEvent(eventName, eventFunc);
      return _this.on(eventName, eventFunc, priority);
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

    this.removeEventsNamespace = function(namespace) {
      var name;

      for(name in _events) {
        var event = _events[name],
            newEvent = [];

        for(var i = event.length - 1; i >= 0; i--) {
          if(event[i].namespace !== namespace) {
            newEvent.push(event[i]);
          }
        }

        if(newEvent.length !== event.length) {
          _checkLock(name);
          _events[name] = newEvent;
        }
      }

      var newEventsAnything = [];

      for(var i = _eventsAnything.length - 1; i >= 0; i--) {
        if(_eventsAnything[i].namespace !== namespace) {
          newEventsAnything.push(_eventsAnything[i]);
        }
      }

      if(newEventsAnything.length !== _eventsAnything.length) {
        _eventsAnything = newEventsAnything;
      }

      return _this;
    };

    this.removeEvent = function(eventName, eventFunc) {
      _checkLock(eventName);

      _formatEventNames(eventName).map(function(name) {
        name = _namespace(name);

        if(typeof _events[name.name] != 'undefined') {
          for(var i = 0, len = _events[name.name].length; i < len; i++) {
            if(name.namespace && _events[name.name][i].namespace != name.namespace) {
              continue;
            }

            if(_events[name.name][i].func.toString() == eventFunc.toString()) {
              _events[name.name].splice(i, 1);
              break;
            }
          }
        }

        for(var i = 0, len = _eventsAnything.length; i < len; i++) {
          if(name.namespace && _eventsAnything[i].namespace != name.namespace) {
            continue;
          }

          if(_eventsAnything[i].func.toString() == eventFunc.toString()) {
            _eventsAnything.splice(i, 1);
            break;
          }
        }

      });

      return _this;
    };

    this.removeEvents = function() {
      _events = [];
      _eventsAnything = [];
    };

  };

})();