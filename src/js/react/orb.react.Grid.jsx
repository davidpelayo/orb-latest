/** @jsx React.DOM */

/* global module, require, React */

'use strict';

const React = require('react');
const ReactDOM = require('react-dom');

module.exports.Grid = React.createClass({
  render: function () {
    const data = this.props.data;
    const headers = this.props.headers;
    const tableClasses = this.props.theme.getGridClasses();

    const rows = [];

    if (headers && headers.length > 0) {
      const headerRow = [];
      for (let h = 0; h < headers.length; h++) {
        headerRow.push(<th key={'h' + h}>{headers[h]}</th>);
      }
      rows.push(<tr key={'h'}>{headerRow}</tr>);
    }

    if (data && data.length > 0) {
      for (let i = 0; i < data.length; i++) {
        const row = [];
        if (utils.isArray(data[i])) {
          for (let j = 0; j < data[i].length; j++) {
            row.push(<td key={i + '' + j}>{data[i][j]}</td>);
          }
        } else {
          for (const prop in data[i]) {
            if (data[i].hasOwnProperty(prop)) {
              row.push(<td key={i + '' + prop}>{data[i][prop]}</td>);
            }
          }
        }
        rows.push(<tr key={i}>{row}</tr>);
      }
    }

    return (
      <table className={tableClasses.table}>
        <tbody>{rows}</tbody>
      </table>
    );
  },
});
