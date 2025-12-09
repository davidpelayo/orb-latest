/** @jsx React.DOM */

/* global module, require, React, window */
/*jshint node: true*/

'use strict';

const React = require('react');
const ReactDOM = require('react-dom');

const react = typeof window === 'undefined' ? require('react') : window.React;
const reactDOM = typeof window === 'undefined' ? require('react-dom') : window.ReactDOM;
const utils = require('../orb.utils');
const axe = require('../orb.axe');
const uiheaders = require('../orb.ui.header');
const filtering = require('../orb.filtering');
const reactUtils = require('./orb.react.utils');

const extraCol = 0;
const comps = module.exports;
