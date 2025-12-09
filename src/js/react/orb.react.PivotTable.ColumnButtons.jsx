/** @jsx React.DOM */

/* global module, require, React */

'use strict';

const React = require('react');
const ReactDOM = require('react-dom');

module.exports.PivotTableColumnButtons = React.createClass({
  render: function () {
    const self = this;
    const PivotButton = comps.PivotButton;
    const DropTarget = comps.DropTarget;

    const config = this.props.pivotTableComp.pgridwidget.pgrid.config;

    const columnButtons = config.columnFields.map((field, index) => {
      return (
        <PivotButton
          key={field.name}
          field={field}
          axetype={axe.Type.COLUMNS}
          position={index}
          pivotTableComp={self.props.pivotTableComp}
        ></PivotButton>
      );
    });

    return <DropTarget buttons={columnButtons} axetype={axe.Type.COLUMNS}></DropTarget>;
  },
});
