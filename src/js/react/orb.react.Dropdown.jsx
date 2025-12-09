/** @jsx React.DOM */

/* global module, react, React */
/*jshint eqnull: true*/

'use strict';

const React = require('react');
const ReactDOM = require('react-dom');

module.exports.Dropdown = React.createClass({
  openOrClose: function (e) {
    const valueNode = ReactDOM.findDOMNode(this.refs.valueElement);
    const valuesListNode = ReactDOM.findDOMNode(this.refs.valuesList);
    if (e.target === valueNode && valuesListNode.style.display === 'none') {
      valuesListNode.style.display = 'block';
    } else {
      valuesListNode.style.display = 'none';
    }
  },
  onMouseEnter: function () {
    const valueNode = ReactDOM.findDOMNode(this.refs.valueElement);
    valueNode.className = 'orb-tgl-btn-down';
    valueNode.style.backgroundPosition = 'right center';
  },
  onMouseLeave: function () {
    ReactDOM.findDOMNode(this.refs.valueElement).className = '';
  },
  componentDidMount: function () {
    document.addEventListener('click', this.openOrClose);
  },
  componentWillUnmount: function () {
    document.removeEventListener('click', this.openOrClose);
  },
  selectValue: function (e) {
    const listNode = ReactDOM.findDOMNode(this.refs.valuesList);
    let target = e.target;
    let isli = false;
    while (!isli && target != null) {
      if (target.parentNode == listNode) {
        isli = true;
        break;
      }
      target = target.parentNode;
    }

    if (isli) {
      const value = target.textContent;
      const valueElement = ReactDOM.findDOMNode(this.refs.valueElement);
      if (valueElement.textContent != value) {
        valueElement.textContent = value;
        if (this.props.onValueChanged) {
          this.props.onValueChanged(value);
        }
      }
    }
  },
  render: function () {
    function createSelectValueFunc(value) {
      return function () {
        this.selectValue(value);
      };
    }

    const values = [];
    for (let i = 0; i < this.props.values.length; i++) {
      values.push(
        <li key={'item' + i} dangerouslySetInnerHTML={{ __html: this.props.values[i] }}></li>
      );
    }

    return (
      <div className="orb-select">
        <div
          ref="valueElement"
          dangerouslySetInnerHTML={{ __html: this.props.selectedValue }}
          onMouseEnter={this.onMouseEnter}
          onMouseLeave={this.onMouseLeave}
        ></div>
        <ul ref="valuesList" style={{ display: 'none' }} onClick={this.selectValue}>
          {values}
        </ul>
      </div>
    );
  },
});
