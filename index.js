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

const emit = (emitter, added, removed) => {
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

  emit(emitter, added, removed);
};

const proxyFn = (array, state, fn, emitter) => new Proxy(fn, {
  apply: function (target, thisArg, argumentsList) {
    state.tracking = true;

    const init = getCounts(array),
          result = Reflect.apply(target, thisArg, argumentsList),
          final = getCounts(array);

    state.tracking = false;
    emitUpdates(init, final, emitter);

    return result;
  }
});

const get = (state, emitter) => function (target, prop, receiver) {
  if (prop === 'on') return on(emitter);
  if (prop === 'removeListener') return removeListener(emitter);

  const result = Reflect.get(target, prop, receiver);

  if (result instanceof Function) {
    return proxyFn(target, state, result, emitter);
  }

  return result;
};

const set = (state, emitter) => function (target, prop, value, receiver) {
  if (!state.tracking) {
    let i = parseInt(prop);

    const index = (i.toString() === prop) ? i : null;

    if (prop === 'length' || (index !== null && index >= target.length)) {
      let init = getCounts(target),
          result = Reflect.set(target, prop, value, receiver),
          final = getCounts(target);

      emitUpdates(init, final, emitter);

      return result;
    } else if (index !== null && index < target.length) {
      const prevValue = Reflect.get(target, prop, receiver);

      if (value !== prevValue) {
        const added = !target.some((val, i) => (val === value)),
              result = Reflect.set(target, prop, value, receiver),
              removed = !target.some((val, i) => (val === prevValue));

        emit(emitter, added ? [ value ] : [], removed ? [ prevValue ] : []);

        return result;
      }
    }
  }

  return Reflect.set(target, prop, value, receiver);
};

module.exports = function watch(array) {
  if (!Array.isArray(array)) {
    throw new Error('array must be an Array instance');
  }

  const state = { tracking: false };
  const emitter = new EventEmitter();

  return new Proxy(array, {
    get: get(state, emitter),
    set: set(state, emitter)
  });
};
