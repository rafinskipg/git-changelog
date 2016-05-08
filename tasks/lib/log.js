'use strict';
var colors = require('colors');
var debug = require('debug')('changelog:log');

function getColor(type){
  var colorList = {
    'info' : 'blue',
    'success' : 'green',
    'error' : 'red',
    'debug' : 'cyan',
    'warn' : 'yellow'
  };

  return colorList[type] ;
}

function log() {

  var args = Array.prototype.slice.call(arguments);
  var type = args.length >= 2 ? args[0] : 'info';
  
  if(args.length >= 2){
    args.splice(0, 1);
  }

  var color = getColor(type);

  if( (this.options && this.options.debug) || type === 'info' || type === 'error' || type === 'success'){
    console.log(colors[color].apply(null, args));
  }
}

module.exports = log;