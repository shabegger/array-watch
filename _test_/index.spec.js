'use strict';

const watch = require('..'),
      jasmineHelper = require('./jasmineHelper');

describe('The array watch function', () => {

  it('returns an Array proxy', () => {
    expect(watch([])).toEqual(jasmine.any(Array));
  });

  it('errors when a non-Array is passed', () => {
    expect(() => watch({})).toThrow(new Error('array must be an Array instance'));
  });

  it('adds an "on" function to listen for array changes', () => {
    expect(watch([]).on).toEqual(jasmine.any(Function));
  });

  it('adds a "removeListener" function to stop listening to array changes', () => {
    expect(watch([]).removeListener).toEqual(jasmine.any(Function));
  });

  describe('returns a proxy that', () => {

    var addHandler, removeHandler, changeHandler,
        array;

    const setup = arr => {
      array = watch(arr);

      addHandler = jasmine.createSpy('add');
      removeHandler = jasmine.createSpy('remove');
      changeHandler = jasmine.createSpy('change');

      array.on('add', addHandler);
      array.on('remove', removeHandler);
      array.on('change', changeHandler);
    };

    it('does not fire handlers that are removed', () => {
      setup([]);

      array.removeListener('add', addHandler);
      array.removeListener('remove', removeHandler);
      array.removeListener('change', changeHandler);

      array.push('test');
      array.pop();

      expect(addHandler).not.toHaveBeenCalled();
      expect(removeHandler).not.toHaveBeenCalled();
      expect(changeHandler).not.toHaveBeenCalled();
    });

    it('fires add/change events on copyWithin', () => {
      setup([ 'test', 'push', 'pop', 'stuff', 'moar' ]);
      array.copyWithin(2);

      expect(array).toEqual([ 'test', 'push', 'test', 'push', 'pop' ]);

      expect(removeHandler).toHaveBeenCalledWith({
        values: jasmineHelper.arrayMatching([ 'stuff', 'moar' ])
      });

      expect(changeHandler).toHaveBeenCalledWith({
        added: [],
        removed: jasmineHelper.arrayMatching([ 'stuff', 'moar' ])
      });

      expect(addHandler).not.toHaveBeenCalled();
    });

    it('fires add/change events on copyWithin with start', () => {
      setup([ 'test', 'push', 'pop', 'stuff', 'moar' ]);
      array.copyWithin(2, 1);

      expect(array).toEqual([ 'test', 'push', 'push', 'pop', 'stuff' ]);

      expect(removeHandler).toHaveBeenCalledWith({
        values: jasmineHelper.arrayMatching([ 'moar' ])
      });

      expect(changeHandler).toHaveBeenCalledWith({
        added: [],
        removed: jasmineHelper.arrayMatching([ 'moar' ])
      });

      expect(addHandler).not.toHaveBeenCalled();
    });

    it('fires add/change events on copyWithin with start/end', () => {
      setup([ 'test', 'push', 'pop', 'stuff', 'moar' ]);
      array.copyWithin(2, 0, 2);

      expect(array).toEqual([ 'test', 'push', 'test', 'push', 'moar' ]);

      expect(removeHandler).toHaveBeenCalledWith({
        values: jasmineHelper.arrayMatching([ 'pop', 'stuff' ])
      });

      expect(changeHandler).toHaveBeenCalledWith({
        added: [],
        removed: jasmineHelper.arrayMatching([ 'pop', 'stuff' ])
      });

      expect(addHandler).not.toHaveBeenCalled();
    });

    it('fires add/change events on fill', () => {
      setup([ 'test', 'push', 'pop' ]);
      array.fill('stuff');

      expect(array).toEqual([ 'stuff', 'stuff', 'stuff' ]);

      expect(addHandler).toHaveBeenCalledWith({
        values: jasmineHelper.arrayMatching([ 'stuff' ])
      });

      expect(removeHandler).toHaveBeenCalledWith({
        values: jasmineHelper.arrayMatching([ 'test', 'push', 'pop' ])
      });

      expect(changeHandler).toHaveBeenCalledWith({
        added: jasmineHelper.arrayMatching([ 'stuff' ]),
        removed: jasmineHelper.arrayMatching([ 'test', 'push', 'pop' ])
      });
    });

    it('fires add/change events on fill with existing item', () => {
      setup([ 'test', 'push', 'pop' ]);
      array.fill('pop');

      expect(array).toEqual([ 'pop', 'pop', 'pop' ]);

      expect(removeHandler).toHaveBeenCalledWith({
        values: jasmineHelper.arrayMatching([ 'test', 'push' ])
      });

      expect(changeHandler).toHaveBeenCalledWith({
        added: [],
        removed: jasmineHelper.arrayMatching([ 'test', 'push' ])
      });

      expect(addHandler).not.toHaveBeenCalled();
    });

    it('does not fire events on reverse', () => {
      setup([ 'test', 'push', 'pop' ]);
      array.reverse();

      expect(array).toEqual([ 'pop', 'push', 'test' ]);

      expect(addHandler).not.toHaveBeenCalled();
      expect(removeHandler).not.toHaveBeenCalled();
      expect(changeHandler).not.toHaveBeenCalled();
    });

    it('fires remove/change events on pop', () => {
      setup([ 'test', 'pop' ]);
      array.pop();

      expect(array).toEqual([ 'test' ]);

      expect(removeHandler).toHaveBeenCalledWith({
        values: jasmineHelper.arrayMatching([ 'pop' ])
      });

      expect(changeHandler).toHaveBeenCalledWith({
        added: [],
        removed: jasmineHelper.arrayMatching([ 'pop' ])
      });

      expect(addHandler).not.toHaveBeenCalled();
    });

    it('fires add/change events on push', () => {
      setup([]);
      array.push('test');

      expect(array).toEqual([ 'test' ]);

      expect(addHandler).toHaveBeenCalledWith({
        values: jasmineHelper.arrayMatching([ 'test' ])
      });

      expect(changeHandler).toHaveBeenCalledWith({
        added: jasmineHelper.arrayMatching([ 'test' ]),
        removed: []
      });

      expect(removeHandler).not.toHaveBeenCalled();
    });

    it('fires remove/change events on shift', () => {
      setup([ 'test', 'pop' ]);
      array.shift();

      expect(array).toEqual([ 'pop' ]);

      expect(removeHandler).toHaveBeenCalledWith({
        values: jasmineHelper.arrayMatching([ 'test' ])
      });

      expect(changeHandler).toHaveBeenCalledWith({
        added: [],
        removed: jasmineHelper.arrayMatching([ 'test' ])
      });

      expect(addHandler).not.toHaveBeenCalled();
    });

    it('does not fire events on sort', () => {
      setup([ 'test', 'push', 'pop', 'stuff' ]);
      array.sort();

      expect(array).toEqual([ 'pop', 'push', 'stuff', 'test' ]);

      expect(addHandler).not.toHaveBeenCalled();
      expect(removeHandler).not.toHaveBeenCalled();
      expect(changeHandler).not.toHaveBeenCalled();
    });

    it('fires add/change events on splice with only additions', () => {
      setup([ 'test', 'push', 'pop' ]);
      array.splice(2, 0, 'moar', 'good', 'things');

      expect(array).toEqual([ 'test', 'push', 'moar', 'good', 'things', 'pop' ]);

      expect(addHandler).toHaveBeenCalledWith({
        values: jasmineHelper.arrayMatching([ 'moar', 'good', 'things' ])
      });

      expect(changeHandler).toHaveBeenCalledWith({
        added: jasmineHelper.arrayMatching([ 'moar', 'good', 'things' ]),
        removed: []
      });

      expect(removeHandler).not.toHaveBeenCalled();
    });

    it('fires remove/change events on splice with only deletions', () => {
      setup([ 'test', 'push', 'pop', 'stuff', 'moar' ]);
      array.splice(1, 2);

      expect(array).toEqual([ 'test', 'stuff', 'moar' ]);

      expect(removeHandler).toHaveBeenCalledWith({
        values: jasmineHelper.arrayMatching([ 'push', 'pop' ])
      });

      expect(changeHandler).toHaveBeenCalledWith({
        added: [],
        removed: jasmineHelper.arrayMatching([ 'push', 'pop' ])
      });

      expect(addHandler).not.toHaveBeenCalled();
    });

    it('fires add/remove/change events on splice with overlap', () => {
      setup([ 'test', 'push', 'pop', 'stuff', 'moar' ]);
      array.splice(1, 3, 'good', 'push');

      expect(array).toEqual([ 'test', 'good', 'push', 'moar' ]);

      expect(addHandler).toHaveBeenCalledWith({
        values: jasmineHelper.arrayMatching([ 'good' ])
      });

      expect(removeHandler).toHaveBeenCalledWith({
        values: jasmineHelper.arrayMatching([ 'pop', 'stuff' ])
      });

      expect(changeHandler).toHaveBeenCalledWith({
        added: jasmineHelper.arrayMatching([ 'good' ]),
        removed: jasmineHelper.arrayMatching([ 'pop', 'stuff' ])
      });
    });

    it('fires add/remove/change events on splice with no overlap', () => {
      setup([ 'test', 'push', 'pop', 'stuff', 'moar' ]);
      array.splice(2, 1, 'good', 'things');

      expect(array).toEqual([ 'test', 'push', 'good', 'things', 'stuff', 'moar' ]);

      expect(addHandler).toHaveBeenCalledWith({
        values: jasmineHelper.arrayMatching([ 'good', 'things' ])
      });

      expect(removeHandler).toHaveBeenCalledWith({
        values: jasmineHelper.arrayMatching([ 'pop' ])
      });

      expect(changeHandler).toHaveBeenCalledWith({
        added: jasmineHelper.arrayMatching([ 'good', 'things' ]),
        removed: jasmineHelper.arrayMatching([ 'pop' ])
      });
    });

    it('fires add/change events on unshift', () => {
      setup([ 'push' ]);
      array.unshift('test');

      expect(array).toEqual([ 'test', 'push' ]);

      expect(addHandler).toHaveBeenCalledWith({
        values: jasmineHelper.arrayMatching([ 'test' ])
      });

      expect(changeHandler).toHaveBeenCalledWith({
        added: jasmineHelper.arrayMatching([ 'test' ]),
        removed: []
      });

      expect(removeHandler).not.toHaveBeenCalled();
    });

  });

});
