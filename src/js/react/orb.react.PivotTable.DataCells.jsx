/** @jsx React.DOM */

/* global module, require, React */

'use strict';

const React = require('react');
const ReactDOM = require('react-dom');

module.exports.PivotTableDataCells = React.createClass({
  render: function () {
    const self = this;
    const PivotRow = comps.PivotRow;

    const pgridwidget = this.props.pivotTableComp.pgridwidget;
    const layoutInfos = {
      lastLeftMostCellVSpan: 0,
      topMostCells: {},
    };

    const dataCells = pgridwidget.dataRows.map((dataRow, index) => {
      return (
        <PivotRow
          key={index}
          row={dataRow}
          axetype={axe.Type.DATA}
          layoutInfos={layoutInfos}
          pivotTableComp={self.props.pivotTableComp}
        ></PivotRow>
      );
    });

    return (
      <table className="inner-table">
        <colgroup></colgroup>
        <tbody>{dataCells}</tbody>
      </table>
    );
  },
});
