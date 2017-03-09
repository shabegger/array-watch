# array-watch
Track additions and deletions from an array

## Usage

To track changes to an array, pass it to the `watch` function. The result is a `Proxy` to the array with `on` and `removeListener` functions for listening to changes. When a change is made, the following events will be fired:

* `add` - the `values` array contains values added to the array
* `remove` - the `values` array contains values removed from the array
* `change` - the `added` array contains values added to the array, and the `removed` array contains values removed from the array

```js
const proxy = watch([]);

proxy.on('add', e => {
  console.log('Added values: ' + e.values);
});

proxy.on('remove', e => {
  console.log('Removed values: ' + e.values);
});

proxy.push('push'); // => Added values: push
proxy[1] = 'set'; // => Added values: set
proxy.splice(0, 1, 'splice', 'test') // => Added values: splice,test
                                     // => Removed values: push
```

Changes are tracked regardless of whether they are the result of setting an indexed value, `length` or calling a mutating function. Only changes that occur as the result of operations on the `Proxy` can be tracked. The following will not call the `add` handler:

```js
const original = [],
      proxy = watch(original);

proxy.on('add', e => {
  console.log('Added values: ' + e.values);
});

original.push('push');
```
