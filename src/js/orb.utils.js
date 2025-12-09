/**
 * @fileOverview Utility functions
 * @author Najmeddine Nouri <najmno@gmail.com>
 */

/* global module, global */
/* jshint eqnull: true */

'use strict';

module.exports = {
  /**
   * Creates a namespace hierarchy if not exists
   * @param  {string} identifier - namespace identifier
   * @param  {object} parent - parent object (defaults to window if available)
   * @return {object}
   */
  ns(identifier, parent) {
    const parts = identifier.split('.');
    let i = 0;
    parent = parent || (typeof window !== 'undefined' ? window : {});
    while (i < parts.length) {
      parent[parts[i]] = parent[parts[i]] || {};
      parent = parent[parts[i]];
      i++;
    }
    return parent;
  },

  /**
   * Returns an array of object own properties
   * @param  {Object} obj
   * @return {Array}
   */
  ownProperties(obj) {
    const arr = [];
    for (const prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        arr.push(prop);
      }
    }
    return arr;
  },

  /**
   * Returns whether or not obj is a javascript array.
   * @param  {object}  obj
   * @return {Boolean}
   */
  isArray(obj) {
    return Array.isArray(obj);
  },

  /**
   * Returns whether or not obj is a number
   * @param  {object}  obj
   * @return {Boolean}
   */
  isNumber(obj) {
    return Object.prototype.toString.apply(obj) === '[object Number]';
  },

  /**
   * Returns whether or not obj is a Date object.
   * @param  {object}  obj
   * @return {Boolean}
   */
  isDate(obj) {
    return Object.prototype.toString.apply(obj) === '[object Date]';
  },

  /**
   * Returns whether or not obj is a string
   * @param  {object}  obj
   * @return {Boolean}
   */
  isString(obj) {
    return Object.prototype.toString.apply(obj) === '[object String]';
  },

  /**
   * Returns whether or not obj is a regular expression object
   * @param  {object}  obj
   * @return {Boolean}
   */
  isRegExp(obj) {
    return Object.prototype.toString.apply(obj) === '[object RegExp]';
  },

  /**
   * Escapes all RegExp special characters.
   * @param {string} re - regular expression string
   * @return {string}
   */
  escapeRegex(re) {
    return re.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  },

  /**
   * Returns the first element in the array that satisfies the given predicate
   * @param  {Array} array     the array to search
   * @param  {function} predicate Function to apply to each element until it returns true
   * @return {Object}           The first object in the array that satisfies the predicate or undefined.
   */
  findInArray(array, predicate) {
    if (this.isArray(array) && predicate) {
      for (let i = 0; i < array.length; i++) {
        const item = array[i];
        if (predicate(item)) {
          return item;
        }
      }
    }
    return undefined;
  },

  /**
   * Returns a JSON string representation of an object
   * @param {object} obj
   * @param {Array} censorKeywords - optional keywords to censor
   * @return {string}
   */
  jsonStringify(obj, censorKeywords) {
    const censor = (key, value) => {
      return censorKeywords && censorKeywords.indexOf(key) > -1 ? undefined : value;
    };
    return JSON.stringify(obj, censor, 2);
  },

  /**
   * Base64 encode (uses native btoa if available)
   * @param {string} str - string to encode
   * @return {string}
   */
  btoa(str) {
    if (typeof global !== 'undefined' && global.btoa) {
      return global.btoa(str);
    }
    if (typeof window !== 'undefined' && window.btoa) {
      return window.btoa(str);
    }
    // Fallback for environments without btoa
    return Buffer.from(str, 'binary').toString('base64');
  },

  /**
   * Base64 decode (uses native atob if available)
   * @param {string} str - string to decode
   * @return {string}
   */
  atob(str) {
    if (typeof global !== 'undefined' && global.atob) {
      return global.atob(str);
    }
    if (typeof window !== 'undefined' && window.atob) {
      return window.atob(str);
    }
    // Fallback for environments without atob
    return Buffer.from(str, 'base64').toString('binary');
  },
};
