/**
 * @fileOverview Pivot Grid default aggregation functions
 * @author Najmeddine Nouri <najmno@gmail.com>
 */

'use strict';

/* global module */
/* jshint eqnull: true */

const Aggregations = (module.exports = {
  toAggregateFunc(func) {
    if (func) {
      if (typeof func === 'string' && Aggregations[func]) {
        return Aggregations[func];
      } else if (typeof func === 'function') {
        return func;
      } else {
        return Aggregations.sum;
      }
    } else {
      return Aggregations.sum;
    }
  },

  count(datafield, intersection, datasource) {
    return intersection === 'all' ? datasource.length : intersection.length;
  },

  sum(datafield, intersection, datasource) {
    let sum = 0;
    forEachIntersection(datafield, intersection, datasource, val => {
      sum += val;
    });
    return sum;
  },

  min(datafield, intersection, datasource) {
    let min = null;
    forEachIntersection(datafield, intersection, datasource, val => {
      if (min == null || val < min) {
        min = val;
      }
    });
    return min;
  },

  max(datafield, intersection, datasource) {
    let max = null;
    forEachIntersection(datafield, intersection, datasource, val => {
      if (max == null || val > max) {
        max = val;
      }
    });
    return max;
  },

  avg(datafield, intersection, datasource) {
    let avg = 0;
    const len = (intersection === 'all' ? datasource : intersection).length;
    if (len > 0) {
      forEachIntersection(datafield, intersection, datasource, val => {
        avg += val;
      });
      avg /= len;
    }
    return avg;
  },

  prod(datafield, intersection, datasource) {
    let prod;
    const len = (intersection === 'all' ? datasource : intersection).length;
    if (len > 0) {
      prod = 1;
      forEachIntersection(datafield, intersection, datasource, val => {
        prod *= val;
      });
    }
    return prod;
  },

  stdev(datafield, intersection, datasource) {
    return Math.sqrt(calcVariance(datafield, intersection, datasource, false));
  },

  stdevp(datafield, intersection, datasource) {
    return Math.sqrt(calcVariance(datafield, intersection, datasource, true));
  },

  var(datafield, intersection, datasource) {
    return calcVariance(datafield, intersection, datasource, false);
  },

  varp(datafield, intersection, datasource) {
    return calcVariance(datafield, intersection, datasource, true);
  },
});

function calcVariance(datafield, intersection, datasource, population) {
  let variance = 0;
  let avg = 0;
  const len = (intersection === 'all' ? datasource : intersection).length;
  if (len > 0) {
    if (population || len > 1) {
      forEachIntersection(datafield, intersection, datasource, val => {
        avg += val;
      });
      avg /= len;
      forEachIntersection(datafield, intersection, datasource, val => {
        variance += (val - avg) * (val - avg);
      });
      variance = variance / (population ? len : len - 1);
    } else {
      variance = NaN;
    }
  }
  return variance;
}

function forEachIntersection(datafield, intersection, datasource, callback) {
  const all = intersection === 'all';
  intersection = all ? datasource : intersection;
  if (intersection.length > 0) {
    for (let i = 0; i < intersection.length; i++) {
      callback((all ? intersection[i] : datasource[intersection[i]])[datafield]);
    }
  }
}
