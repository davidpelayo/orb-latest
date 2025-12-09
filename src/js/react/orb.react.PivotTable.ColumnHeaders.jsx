/** @jsx React.DOM */

/* global module, require, React */

'use strict';

const React = require('react');
const ReactDOM = require('react-dom');

module.exports.PivotTableColumnHeaders = React.createClass({
  render: function () {
    const self = this;
    const PivotRow = comps.PivotRow;
    const pgridwidget = this.props.pivotTableComp.pgridwidget;
    const cntrClass = pgridwidget.columns.headers.length === 0 ? '' : ' columns-cntr';

    const layoutInfos = {
      lastLeftMostCellVSpan: 0,
      topMostCells: {},
    };

    const columnHeaders = pgridwidget.columns.headers.map((headerRow, index) => {
      return (
        <PivotRow
          key={index}
          row={headerRow}
          axetype={axe.Type.COLUMNS}
          pivotTableComp={self.props.pivotTableComp}
          layoutInfos={layoutInfos}
        ></PivotRow>
      );
    });

    return (
      <div
        className={'inner-table-container' + cntrClass}
        ref="colHeadersContainer"
        onWheel={this.props.pivotTableComp.onWheel}
      >
        <table className="inner-table">
          <colgroup></colgroup>
          <tbody>{columnHeaders}</tbody>
        </table>
      </div>
    );
  },
});
