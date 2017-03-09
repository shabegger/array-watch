'use strict';

class ArrayMatching {
  constructor(sample) {
    this.sample = sample;
  }

  asymmetricMatch(other, customTesters) {
    const className = Object.prototype.toString.call(this.sample);
    if (className !== '[object Array]') {
      throw new Error('You must provide an array to arrayMatching, not \'' + this.sample + '\'.');
    }

    if (this.sample.length !== other.length) return false;

    const thisArray = this.sample.slice().sort(),
          otherArray = other.slice().sort();

    for (var i = 0; i < thisArray.length; i++) {
      if (!jasmine.matchersUtil.equals(thisArray[i], otherArray[i], customTesters)) {
        return false;
      }
    }

    return true;
  }

  jasmineToString() {
    return '<jasmineHelper.arrayMatching(' + jasmine.pp(this.sample) +')>';
  }
}

module.exports = {
  arrayMatching: array => new ArrayMatching(array)
};
