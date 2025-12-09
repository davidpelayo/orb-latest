/**
 * @fileOverview Pivot Grid viewmodel
 * @author Najmeddine Nouri <najmno@gmail.com>
 */

'use strict';

/* global module, require */
/*jshint eqnull: true*/

const axe = require('./orb.axe');
const configuration = require('./orb.config').config;
const filtering = require('./orb.filtering');
const query = require('./orb.query');
const utils = require('./orb.utils');

/**
 * Creates a new instance of pgrid
 * @class
 * @memberOf orb
 * @param  {object} config - configuration object
 */
module.exports = function (config) {
  const defaultfield = {
    name: '#undefined#',
  };

  const self = this;
  let _iCache;

  this.config = new configuration(config);
  this.filters = self.config.getPreFilters();
  this.filteredDataSource = self.config.dataSource;

  this.rows = new axe(self, axe.Type.ROWS);
  this.columns = new axe(self, axe.Type.COLUMNS);
  this.dataMatrix = {};

  function refresh(refreshFilters) {
    if (refreshFilters !== false) {
      refreshFilteredDataSource();
    }
    self.rows.update();
    self.columns.update();
    computeValues();
  }

  function refreshFilteredDataSource() {
    const filterFields = utils.ownProperties(self.filters);
    if (filterFields.length > 0) {
      self.filteredDataSource = [];

      for (let i = 0; i < self.config.dataSource.length; i++) {
        const row = self.config.dataSource[i];
        let exclude = false;
        for (let fi = 0; fi < filterFields.length; fi++) {
          const fieldname = filterFields[fi];
          const fieldFilter = self.filters[fieldname];

          if (fieldFilter && !fieldFilter.test(row[fieldname])) {
            exclude = true;
            break;
          }
        }
        if (!exclude) {
          self.filteredDataSource.push(row);
        }
      }
    } else {
      self.filteredDataSource = self.config.dataSource;
    }
  }

  this.moveField = function (fieldname, oldaxetype, newaxetype, position) {
    if (self.config.moveField(fieldname, oldaxetype, newaxetype, position)) {
      refresh(false);
      return true;
    }
    return false;
  };

  this.applyFilter = function (fieldname, operator, term, staticValue, excludeStatic) {
    self.filters[fieldname] = new filtering.expressionFilter(
      operator,
      term,
      staticValue,
      excludeStatic
    );
    refresh();
  };

  this.refreshData = function (data) {
    self.config.dataSource = data;
    refresh();
  };

  this.getFieldValues = function (field, filterFunc) {
    const values1 = [];
    let values = [];
    let containsBlank = false;
    for (let i = 0; i < self.config.dataSource.length; i++) {
      const row = self.config.dataSource[i];
      const val = row[field];
      if (filterFunc !== undefined) {
        if (filterFunc === true || (typeof filterFunc === 'function' && filterFunc(val))) {
          values1.push(val);
        }
      } else {
        if (val) {
          values1.push(val);
        } else {
          containsBlank = true;
        }
      }
    }
    if (values1.length > 1) {
      if (utils.isNumber(values1[0]) || utils.isDate(values1[0])) {
        values1.sort((a, b) => {
          return a ? (b ? a - b : 1) : b ? -1 : 0;
        });
      } else {
        values1.sort();
      }

      for (let vi = 0; vi < values1.length; vi++) {
        if (vi === 0 || values1[vi] !== values[values.length - 1]) {
          values.push(values1[vi]);
        }
      }
    } else {
      values = values1;
    }
    values.containsBlank = containsBlank;
    return values;
  };

  this.getFieldFilter = function (field) {
    return self.filters[field];
  };

  this.isFieldFiltered = function (field) {
    const filter = self.getFieldFilter(field);
    return filter != null && !filter.isAlwaysTrue();
  };

  this.getData = function (field, rowdim, coldim, aggregateFunc) {
    let value;
    if (rowdim && coldim) {
      const datafieldName = field || (self.config.dataFields[0] || defaultfield).name;
      const datafield = self.config.getDataField(datafieldName);

      if (!datafield || (aggregateFunc && datafield.aggregateFunc != aggregateFunc)) {
        value = self.calcAggregation(
          rowdim.isRoot ? null : rowdim.getRowIndexes().slice(0),
          coldim.isRoot ? null : coldim.getRowIndexes().slice(0),
          [datafieldName],
          aggregateFunc
        )[datafieldName];
      } else {
        if (self.dataMatrix[rowdim.id] && self.dataMatrix[rowdim.id][coldim.id]) {
          value = self.dataMatrix[rowdim.id][coldim.id][datafieldName];
        } else {
          value = null;
        }
      }
    }

    return value === undefined ? null : value;
  };

  this.calcAggregation = function (rowIndexes, colIndexes, fieldNames, aggregateFunc) {
    return computeValue(rowIndexes, colIndexes, rowIndexes, fieldNames, aggregateFunc);
  };

  this.query = query(self);

  refresh();

  function computeValue(rowIndexes, colIndexes, origRowIndexes, fieldNames, aggregateFunc) {
    const res = {};

    if (self.config.dataFieldsCount > 0) {
      let intersection;

      if (rowIndexes == null) {
        intersection = colIndexes;
      } else if (colIndexes == null) {
        intersection = rowIndexes;
      } else {
        intersection = [];
        for (let ri = 0; ri < rowIndexes.length; ri++) {
          const rowindex = rowIndexes[ri];
          if (rowindex >= 0) {
            const colrowindex = colIndexes.indexOf(rowindex);
            if (colrowindex >= 0) {
              rowIndexes[ri] = 0 - (rowindex + 2);
              intersection.push(rowindex);
            }
          }
        }
      }

      const emptyIntersection = intersection && intersection.length === 0;
      const datasource = self.filteredDataSource;
      let datafield;
      const datafields = [];

      if (fieldNames) {
        for (let fieldnameIndex = 0; fieldnameIndex < fieldNames.length; fieldnameIndex++) {
          datafield = self.config.getDataField(fieldNames[fieldnameIndex]);
          if (!aggregateFunc) {
            if (!datafield) {
              datafield = self.config.getField(fieldNames[fieldnameIndex]);
              if (datafield) {
                aggregateFunc = datafield.dataSettings
                  ? datafield.dataSettings.aggregateFunc()
                  : datafield.aggregateFunc();
              }
            } else {
              aggregateFunc = datafield.aggregateFunc();
            }
          }

          if (datafield && aggregateFunc) {
            datafields.push({ field: datafield, aggregateFunc: aggregateFunc });
          }
        }
      } else {
        for (
          let datafieldIndex = 0;
          datafieldIndex < self.config.dataFieldsCount;
          datafieldIndex++
        ) {
          datafield = self.config.dataFields[datafieldIndex] || defaultfield;
          if (aggregateFunc || datafield.aggregateFunc) {
            datafields.push({
              field: datafield,
              aggregateFunc: aggregateFunc || datafield.aggregateFunc(),
            });
          }
        }
      }

      for (let dfi = 0; dfi < datafields.length; dfi++) {
        datafield = datafields[dfi];
        // no data
        if (emptyIntersection) {
          res[datafield.field.name] = null;
        } else {
          res[datafield.field.name] = datafield.aggregateFunc(
            datafield.field.name,
            intersection || 'all',
            self.filteredDataSource,
            origRowIndexes || rowIndexes,
            colIndexes
          );
        }
      }
    }

    return res;
  }

  function computeRowValues(rowDim) {
    if (rowDim) {
      const data = {};
      const rid = 'r' + rowDim.id;

      // set cached row indexes for current row dimension
      if (_iCache[rid] === undefined) {
        _iCache[rid] = rowDim.isRoot ? null : _iCache[rowDim.parent.id] || rowDim.getRowIndexes();
      }

      // calc grand-total cell
      data[self.columns.root.id] = computeValue(rowDim.isRoot ? null : _iCache[rid].slice(0), null);

      if (self.columns.dimensionsCount > 0) {
        let p = 0;
        const parents = [self.columns.root];

        while (p < parents.length) {
          const parent = parents[p];
          const rowindexes = rowDim.isRoot
            ? null
            : parent.isRoot
              ? _iCache[rid].slice(0)
              : _iCache['c' + parent.id].slice(0);

          for (let i = 0; i < parent.values.length; i++) {
            const subdim = parent.subdimvals[parent.values[i]];
            const cid = 'c' + subdim.id;

            // set cached row indexes for this column leaf dimension
            if (_iCache[cid] === undefined) {
              _iCache[cid] = _iCache[cid] || subdim.getRowIndexes().slice(0);
            }

            data[subdim.id] = computeValue(
              rowindexes,
              _iCache[cid],
              rowDim.isRoot ? null : rowDim.getRowIndexes()
            );

            if (!subdim.isLeaf) {
              parents.push(subdim);
              if (rowindexes) {
                _iCache[cid] = [];
                for (let ur = 0; ur < rowindexes.length; ur++) {
                  const vr = rowindexes[ur];
                  if (vr != -1 && vr < 0) {
                    _iCache[cid].push(0 - (vr + 2));
                    rowindexes[ur] = -1;
                  }
                }
              }
            }
          }
          _iCache['c' + parent.id] = undefined;
          p++;
        }
      }

      return data;
    }
  }

  function computeValues() {
    self.dataMatrix = {};
    _iCache = {};

    // calc grand total row
    self.dataMatrix[self.rows.root.id] = computeRowValues(self.rows.root);

    if (self.rows.dimensionsCount > 0) {
      const parents = [self.rows.root];
      let p = 0;
      let parent;
      while (p < parents.length) {
        parent = parents[p];
        // calc children rows
        for (let i = 0; i < parent.values.length; i++) {
          const subdim = parent.subdimvals[parent.values[i]];
          // calc child row
          self.dataMatrix[subdim.id] = computeRowValues(subdim);
          // if row is not a leaf, add it to parents array to process its children
          if (!subdim.isLeaf) {
            parents.push(subdim);
          }
        }
        // next parent
        p++;
      }
    }
  }
};
