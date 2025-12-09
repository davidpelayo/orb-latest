/**
 * @fileOverview Pivot Grid axe viewmodel
 * @author Najmeddine Nouri <najmno@gmail.com>
 */

/* global module, require */
/*jshint eqnull: true*/

'use strict';

const utils = require('./orb.utils');
const Dimension = require('./orb.dimension');

const AxeType = {
  COLUMNS: 1,
  ROWS: 2,
  DATA: 3,
};

/**
 * Creates a new instance of an axe's dimensions list.
 * @class
 * @memberOf orb
 * @param  {array} pgrid - Parent pivot grid
 * @param  {orb.axe.Type} type - Axe type (rows, columns, data)
 */
module.exports = function (pgrid, type) {
  const self = this;
  let dimid = 0;

  if (pgrid != null && pgrid.config != null) {
    /**
     * Parent pivot grid
     * @type {orb.pgrid}
     */
    this.pgrid = pgrid;

    /**
     * Axe type (rows, columns, data)
     * @type {orb.axe.Type}
     */
    this.type = type;

    /**
     * This axe dimension fields
     * @type {Array}
     */
    this.fields = (function () {
      switch (type) {
        case AxeType.COLUMNS:
          return self.pgrid.config.columnFields;
        case AxeType.ROWS:
          return self.pgrid.config.rowFields;
        case AxeType.DATA:
          return self.pgrid.config.dataFields;
        default:
          return [];
      }
    })();

    /**
     * Number of dimensions in this axe
     * @type {Number}
     */
    this.dimensionsCount = null;

    /**
     * Root dimension
     * @type {orb.dimension}
     */
    this.root = null;

    /**
     * Dimensions dictionary indexed by depth
     * @type {Object} Dictionary of (depth, arrays)
     */
    this.dimensionsByDepth = null;

    this.update = function () {
      self.dimensionsCount = self.fields.length;
      self.root = new Dimension(++dimid, null, null, null, self.dimensionsCount + 1, true);

      self.dimensionsByDepth = {};
      for (let depth = 1; depth <= self.dimensionsCount; depth++) {
        self.dimensionsByDepth[depth] = [];
      }

      // fill data
      fill();

      // initial sort
      for (let findex = 0; findex < self.fields.length; findex++) {
        const ffield = self.fields[findex];
        if (ffield.sort.order === 'asc' || ffield.sort.order === 'desc') {
          self.sort(ffield, true);
        }
      }
    };

    this.sort = function (field, donottoggle) {
      if (field != null) {
        if (donottoggle !== true) {
          if (field.sort.order !== 'asc') {
            field.sort.order = 'asc';
          } else {
            field.sort.order = 'desc';
          }
        }

        const depth = self.dimensionsCount - getfieldindex(field);
        const parents =
          depth === self.dimensionsCount ? [self.root] : self.dimensionsByDepth[depth + 1];
        for (let i = 0; i < parents.length; i++) {
          parents[i].values.sort();
          if (field.sort.order === 'desc') {
            parents[i].values.reverse();
          }
        }
      }
    };
  }

  function getfieldindex(field) {
    for (let i = 0; i < self.fields.length; i++) {
      if (self.fields[i].name === field.name) {
        return i;
      }
    }
    return -1;
  }

  /**
   * Creates all subdimensions using the supplied data
   */
  function fill() {
    if (self.pgrid.filteredDataSource != null && self.dimensionsCount > 0) {
      const datasource = self.pgrid.filteredDataSource;
      if (datasource != null && utils.isArray(datasource) && datasource.length > 0) {
        for (let rowIndex = 0, dataLength = datasource.length; rowIndex < dataLength; rowIndex++) {
          const row = datasource[rowIndex];
          let dim = self.root;
          for (let findex = 0; findex < self.dimensionsCount; findex++) {
            const depth = self.dimensionsCount - findex;
            const subfield = self.fields[findex];
            const subvalue = row[subfield.name];
            const subdimvals = dim.subdimvals;

            if (subdimvals[subvalue] !== undefined) {
              dim = subdimvals[subvalue];
            } else {
              dim.values.push(subvalue);
              dim = new Dimension(
                ++dimid,
                dim,
                subvalue,
                subfield,
                depth,
                false,
                findex == self.dimensionsCount - 1
              );
              subdimvals[subvalue] = dim;
              dim.rowIndexes = [];
              self.dimensionsByDepth[depth].push(dim);
            }

            dim.rowIndexes.push(rowIndex);
          }
        }
      }
    }
  }
};

/**
 * Axe types
 * @readonly
 * @enum {Number}
 */
module.exports.Type = AxeType;
