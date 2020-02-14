'use strict';
var colors = require('colors');
var debug = require('debug')('changelog:log');

function log() {
  var args = Array.prototype.slice.call(arguments);
  var type = args.length >= 2 ? args[0] : 'info';
  var colorList = {
    'info' : 'blue',
    'success' : 'green',
    'error' : 'red',
    'debug' : 'cyan',
    'warn' : 'yellow'
  };

  var isValidType = Object.keys(colorList).indexOf(type) > -1;

  if(args.length >= 2){
    args.splice(0, 1);
  }

  var color = colorList[type];
  
  if((this.options && this.options.debug) || isValidType){
    console.log(colors[color].apply(null, args));
  }
}

module.exports = log;