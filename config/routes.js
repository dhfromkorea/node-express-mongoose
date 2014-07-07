/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var home = require('home');
var plivo = require('plivo');
var config = require('./config');
/**
 * Expose
 */

module.exports = function(app, passport) {
  app.get('/', home.index);

  app.post('/call', function(req, res) {
    console.log('this is working fine');
    var p = plivo.RestAPI(config.plivo);
    var params = {};
    // dynamically pulled from the inventory
    // good for now
    params.from = "14156121287";
    // get the user phone number
    params.to = "14155345337";
    params.answer_url = "http://dialer.ngrok.com/xml-response";
    p.make_call(params, function(status, response) {
      res.send(status, response);
    });
  });

  app.post('/xml-response', function(req, res) {
    var r = new plivo.Response();
    var dialElement = r.addDial();
    // get the target number
    dialElement.addNumber('15102925120');
    r.addSpeak('Hello world!', {
      loop: 2
    });
    var xmlRes = r.toXML();
    res.send(200, xmlRes);
  });

  /**
   * Error handling
   */

  app.use(function(err, req, res, next) {
    // treat as 404
    if (err.message && (~err.message.indexOf('not found') || (~err.message.indexOf('Cast to ObjectId failed')))) {
      return next();
    }
    console.error(err.stack);
    // error page
    res.status(500).render('500', {
      error: err.stack
    });
  });

  // assume 404 since no middleware responded
  app.use(function(req, res, next) {
    res.status(404).render('404', {
      url: req.originalUrl,
      error: 'Not found'
    });
  });
};