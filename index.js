'use strict';

const EventEmitter = require('events');

const on = emitter => function on(eventName, listener) {
  if (eventName !== 'add' && eventName !== 'remove' && eventName !== 'change') return;
  emitter.on(eventName, listener);
};

const removeListener = emitter => function removeListener(eventName, listener) {
  emitter.removeListener(eventName, listener);
};

const getCounts = array => {
  const counts = new Map();

  for (const value of array) {
    counts.set(value, (counts.get(value) || 0) + 1);
  }

  return counts;
};

const emitUpdates = (init, final, emitter) => {
  const added = [],
        removed = [];

  for (const [ key, value ] of final) {
    if (value && !init.get(key)) {
      added.push(key);
    }
  }

  for (const [ key, value ] of init) {
    if (value && !final.get(key)) {
      removed.push(key);
    }
  }

  if (added.length) {
    emitter.emit('add', { values: added });
  }

  if (removed.length) {
    emitter.emit('remove', { values: removed });
  }

  if (added.length || removed.length) {
    emitter.emit('change', { added, removed });
  }
};

const proxyFn = (array, fn, emitter) => new Proxy(fn, {
  apply: function (target, thisArg, argumentsList) {
    const init = getCounts(array),
          result = Reflect.apply(target, thisArg, argumentsList),
          final = getCounts(array);

    emitUpdates(init, final, emitter);

    return result;
  }
});

const get = emitter => function (target, prop, receiver) {
  if (prop === 'on') return on(emitter);
  if (prop === 'removeListener') return removeListener(emitter);

  const result = Reflect.get(target, prop, receiver);

  if (result instanceof Function) {
    return proxyFn(target, result, emitter);
  }

  return result;
};

module.exports = function watch(array) {
  if (!Array.isArray(array)) {
    throw new Error('array must be an Array instance');
  }

  const emitter = new EventEmitter();
  return new Proxy(array, {
    get: get(emitter)
  });
};
