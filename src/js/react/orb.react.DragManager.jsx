/* global module, require, react, reactUtils */
/*jshint eqnull: true*/

'use strict';

const React = require('react');
const ReactDOM = require('react-dom');

const dragManager = (module.exports.DragManager = (function () {
  let _pivotComp = null;

  let _currDragElement = null;
  let _currDropTarget = null;
  let _currDropIndicator = null;

  let _dragNode = null;
  const _dropTargets = [];
  const _dropIndicators = [];

  function doElementsOverlap(elem1Rect, elem2Rect) {
    return !(
      elem1Rect.right < elem2Rect.left ||
      elem1Rect.left > elem2Rect.right ||
      elem1Rect.bottom < elem2Rect.top ||
      elem1Rect.top > elem2Rect.bottom
    );
  }

  function setCurrDropTarget(dropTarget, callback) {
    if (_currDropTarget) {
      signalDragEnd(_currDropTarget, () => {
        _currDropTarget = dropTarget;
        signalDragOver(dropTarget, callback);
      });
    } else {
      _currDropTarget = dropTarget;
      signalDragOver(dropTarget, callback);
    }
  }

  function setCurrDropIndicator(dropIndicator) {
    if (_currDropIndicator) {
      signalDragEnd(_currDropIndicator, () => {
        _currDropIndicator = dropIndicator;
        signalDragOver(dropIndicator);
      });
    } else {
      _currDropIndicator = dropIndicator;
      signalDragOver(dropIndicator);
    }
  }

  function signalDragOver(target, callback) {
    if (target && target.onDragOver) {
      target.onDragOver(callback);
    } else if (callback) {
      callback();
    }
  }

  function signalDragEnd(target, callback) {
    if (target && target.onDragEnd) {
      target.onDragEnd(callback);
    } else if (callback) {
      callback();
    }
  }

  function getDropTarget() {
    return reactUtils.forEach(
      _dropTargets,
      target => {
        if (target.component.state.isover) {
          return target;
        }
      },
      true
    );
  }

  function getDropIndicator() {
    return reactUtils.forEach(
      _dropIndicators,
      indicator => {
        if (indicator.component.state.isover) {
          return indicator;
        }
      },
      true
    );
  }

  let _initialized = false;

  return {
    init: function (pivotComp) {
      _initialized = true;
      _pivotComp = pivotComp;
    },
    setDragElement: function (elem) {
      const prevDragElement = _currDragElement;
      _currDragElement = elem;
      if (_currDragElement != prevDragElement) {
        if (elem == null) {
          if (_currDropTarget) {
            const position = _currDropIndicator != null ? _currDropIndicator.position : null;
            _pivotComp.moveButton(
              prevDragElement,
              _currDropTarget.component.props.axetype,
              position
            );
          }

          _dragNode = null;
          setCurrDropTarget(null);
          setCurrDropIndicator(null);
        } else {
          _dragNode = ReactDOM.findDOMNode(_currDragElement);
        }
      }
    },
    registerTarget: function (target, axetype, dragOverHandler, dargEndHandler) {
      _dropTargets.push({
        component: target,
        axetype: axetype,
        onDragOver: dragOverHandler,
        onDragEnd: dargEndHandler,
      });
    },
    unregisterTarget: function (target) {
      let tindex;
      for (let i = 0; i < _dropTargets.length; i++) {
        if (_dropTargets[i].component == target) {
          tindex = i;
          break;
        }
      }
      if (tindex != null) {
        _dropTargets.splice(tindex, 1);
      }
    },
    registerIndicator: function (indicator, axetype, position, dragOverHandler, dargEndHandler) {
      _dropIndicators.push({
        component: indicator,
        axetype: axetype,
        position: position,
        onDragOver: dragOverHandler,
        onDragEnd: dargEndHandler,
      });
    },
    unregisterIndicator: function (indicator) {
      let iindex;
      for (let i = 0; i < _dropIndicators.length; i++) {
        if (_dropIndicators[i].component == indicator) {
          iindex = i;
          break;
        }
      }
      if (iindex != null) {
        _dropIndicators.splice(iindex, 1);
      }
    },
    elementMoved: function () {
      if (_currDragElement != null) {
        const dragNodeRect = _dragNode.getBoundingClientRect();
        let foundTarget;

        reactUtils.forEach(
          _dropTargets,
          target => {
            if (!foundTarget) {
              const tnodeRect = ReactDOM.findDOMNode(target.component).getBoundingClientRect();
              const isOverlap = doElementsOverlap(dragNodeRect, tnodeRect);
              if (isOverlap) {
                foundTarget = target;
                return;
              }
            }
          },
          true
        );

        if (foundTarget) {
          setCurrDropTarget(foundTarget, () => {
            let foundIndicator = null;

            reactUtils.forEach(_dropIndicators, (indicator, index) => {
              if (!foundIndicator) {
                const elementOwnIndicator =
                  indicator.component.props.axetype === _currDragElement.props.axetype &&
                  indicator.component.props.position === _currDragElement.props.position;

                const targetIndicator =
                  indicator.component.props.axetype === foundTarget.component.props.axetype;
                if (targetIndicator && !elementOwnIndicator) {
                  const tnodeRect = ReactDOM.findDOMNode(
                    indicator.component
                  ).getBoundingClientRect();
                  const isOverlap = doElementsOverlap(dragNodeRect, tnodeRect);
                  if (isOverlap) {
                    foundIndicator = indicator;
                    return;
                  }
                }
              }
            });

            if (!foundIndicator) {
              const axeIndicators = _dropIndicators.filter(indicator => {
                return indicator.component.props.axetype === foundTarget.component.props.axetype;
              });
              if (axeIndicators.length > 0) {
                foundIndicator = axeIndicators[axeIndicators.length - 1];
              }
            }
            setCurrDropIndicator(foundIndicator);
          });
        }
      }
    },
  };
})());
