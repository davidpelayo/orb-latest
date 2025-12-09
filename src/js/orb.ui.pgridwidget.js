/**
 * @fileOverview Pivot Grid axe viewmodel
 * @author Najmeddine Nouri <najmno@gmail.com>
 */

'use strict';

/* global module, require, React, window */
/*jshint eqnull: true*/
const ReactDOM = require('react-dom');
const axe = require('./orb.axe');
const pgrid = require('./orb.pgrid');
const uiheaders = require('./orb.ui.header');
const uirows = require('./orb.ui.rows');
const uicols = require('./orb.ui.cols');
//var React = require('react');
const OrbReactComps = require('./react/orb.react.compiled');
/**
 * Creates a new instance of pivot grid control
 * @class
 * @memberOf orb.ui
 * @param  {object} pgrid - pivot grid instance
 */
module.exports = function (config) {
  const self = this;
  let renderElement;
  let pivotComponent;
  const dialog = OrbReactComps.Dialog.create();

  /**
   * Parent pivot grid
   * @type {orb.pgrid}
   */
  this.pgrid = new pgrid(config);

  /**
   * Control rows headers
   * @type {orb.ui.rows}
   */
  this.rows = null;
  /**
   * Control columns headers
   * @type {orb.ui.cols}
   */
  this.columns = null;

  /**
   * Control data rows
   * @type {orb.ui.CellBase}
   */
  this.dataRows = [];

  this.layout = {
    rowHeaders: {
      /**
       * Total number of horizontal row headers.
       * @type {Number}
       */
      width: null,
      /**
       * Total number of vertical row headers.
       * @type {Number}
       */
      height: null,
    },
    columnHeaders: {
      /**
       * Total number of horizontal column headers.
       * @type {Number}
       */
      width: null,
      /**
       * Total number of vertical column headers.
       * @type {Number}
       */
      height: null,
    },
    pivotTable: {
      /**
       * Total number of horizontal cells of the whole pivot grid control.
       * @type {Number}
       */
      width: null,
      /**
       * Total number of vertical cells of the whole pivot grid control.
       * @type {Number}
       */
      height: null,
    },
  };

  this.sort = function (axetype, field) {
    if (axetype === axe.Type.ROWS) {
      self.pgrid.rows.sort(field);
    } else if (axetype === axe.Type.COLUMNS) {
      self.pgrid.columns.sort(field);
    } else {
      return;
    }

    buildUi();
  };

  this.refreshData = function (data) {
    self.pgrid.refreshData(data);
    buildUi();
    pivotComponent.setState({ dirty: !this.state.dirty }); // TODO quick fix to deprecated this.setProps()
  };

  this.applyFilter = function (fieldname, operator, term, staticValue, excludeStatic) {
    self.pgrid.applyFilter(fieldname, operator, term, staticValue, excludeStatic);
    buildUi();
  };

  this.moveField = function (field, oldAxeType, newAxeType, position) {
    if (self.pgrid.moveField(field, oldAxeType, newAxeType, position)) {
      buildUi();
      return true;
    }
    return false;
  };

  this.toggleFieldExpansion = function (axetype, field, newState) {
    if (axetype === axe.Type.ROWS) {
      return self.rows.toggleFieldExpansion(field, newState);
    } else if (axetype === axe.Type.COLUMNS) {
      return self.columns.toggleFieldExpansion(field, newState);
    }
    return false;
  };

  this.toggleSubtotals = function (axetype) {
    if (self.pgrid.config.toggleSubtotals(axetype)) {
      buildUi();
      return true;
    }
    return false;
  };

  this.areSubtotalsVisible = function (axetype) {
    return self.pgrid.config.areSubtotalsVisible(axetype);
  };

  this.toggleGrandtotal = function (axetype) {
    if (self.pgrid.config.toggleGrandtotal(axetype)) {
      buildUi();
      return true;
    }
    return false;
  };

  this.isGrandtotalVisible = function (axetype) {
    return self.pgrid.config.isGrandtotalVisible(axetype);
  };

  this.changeTheme = function (newTheme) {
    pivotComponent.changeTheme(newTheme);
  };

  this.render = function (element) {
    renderElement = element;
    if (renderElement) {
      const pivotTableFactory = React.createFactory(OrbReactComps.PivotTable);
      const pivottable = pivotTableFactory({
        pgridwidget: self,
      });

      pivotComponent = ReactDOM.render(pivottable, element);
    }
  };

  this.drilldown = function (dataCell, pivotId) {
    if (dataCell) {
      const colIndexes = dataCell.columnDimension.getRowIndexes();
      const data = dataCell.rowDimension
        .getRowIndexes()
        .filter(index => {
          return colIndexes.indexOf(index) >= 0;
        })
        .map(index => {
          return self.pgrid.filteredDataSource[index];
        });

      let title;
      if (
        dataCell.rowType === uiheaders.HeaderType.GRAND_TOTAL &&
        dataCell.colType === uiheaders.HeaderType.GRAND_TOTAL
      ) {
        title = 'Grand total';
      } else {
        if (dataCell.rowType === uiheaders.HeaderType.GRAND_TOTAL) {
          title = dataCell.columnDimension.value + '/Grand total ';
        } else if (dataCell.colType === uiheaders.HeaderType.GRAND_TOTAL) {
          title = dataCell.rowDimension.value + '/Grand total ';
        } else {
          title = dataCell.rowDimension.value + '/' + dataCell.columnDimension.value;
        }
      }

      const pivotStyle = window.getComputedStyle(ReactDOM.findDOMNode(pivotComponent), null);

      dialog.show({
        title: title,
        comp: {
          type: OrbReactComps.Grid,
          props: {
            headers: self.pgrid.config.getDataSourceFieldCaptions(),
            data: data,
            theme: self.pgrid.config.theme,
          },
        },
        theme: self.pgrid.config.theme,
        style: {
          fontFamily: pivotStyle.getPropertyValue('font-family'),
          fontSize: pivotStyle.getPropertyValue('font-size'),
        },
      });
    }
  };

  buildUi();

  function buildUi() {
    // build row and column headers
    self.rows = new uirows(self.pgrid.rows);
    self.columns = new uicols(self.pgrid.columns);

    const rowsHeaders = self.rows.headers;
    const columnsLeafHeaders = self.columns.leafsHeaders;

    // set control layout infos
    self.layout = {
      rowHeaders: {
        width:
          (self.pgrid.rows.fields.length || 1) +
          (self.pgrid.config.dataHeadersLocation === 'rows' && self.pgrid.config.dataFieldsCount > 1
            ? 1
            : 0),
        height: rowsHeaders.length,
      },
      columnHeaders: {
        width: self.columns.leafsHeaders.length,
        height:
          (self.pgrid.columns.fields.length || 1) +
          (self.pgrid.config.dataHeadersLocation === 'columns' &&
          self.pgrid.config.dataFieldsCount > 1
            ? 1
            : 0),
      },
    };

    self.layout.pivotTable = {
      width: self.layout.rowHeaders.width + self.layout.columnHeaders.width,
      height: self.layout.rowHeaders.height + self.layout.columnHeaders.height,
    };

    const dataRows = [];
    let arr;

    function createVisibleFunc(rowvisible, colvisible) {
      return function () {
        return rowvisible() && colvisible();
      };
    }
    if (rowsHeaders.length > 0) {
      for (let ri = 0; ri < rowsHeaders.length; ri++) {
        const rowHeadersRow = rowsHeaders[ri];
        const rowLeafHeader = rowHeadersRow[rowHeadersRow.length - 1];

        arr = [];
        for (let colHeaderIndex = 0; colHeaderIndex < columnsLeafHeaders.length; colHeaderIndex++) {
          const columnLeafHeader = columnsLeafHeaders[colHeaderIndex];
          const isvisible = createVisibleFunc(rowLeafHeader.visible, columnLeafHeader.visible);
          arr[colHeaderIndex] = new uiheaders.dataCell(
            self.pgrid,
            isvisible,
            rowLeafHeader,
            columnLeafHeader
          );
        }
        dataRows.push(arr);
      }
    }
    self.dataRows = dataRows;
  }
};
