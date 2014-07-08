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
    var srcNum = req.body.src;
    var dstNum = req.body.dst;
    var base_answerUrl = "http://dialer.ngrok.com/xml-response";

    var p = plivo.RestAPI(config.plivo);
    var params = {};
    // app's plivo number
    params.from = "14156121287";
    // phone number of the app user
    params.to = srcNum;
    // dst phone number of the target person
    // should pass this so that get handler can receive
    params.answer_url = base_answerUrl + "?dst=" + dstNum;
    p.make_call(params, function(status, response) {
      res.send(status, response);
    });
  });

  app.post('/xml-response', function(req, res) {
    var dstNum = req.body.dst;
    // should get the number to call
    var r = new plivo.Response();
    var dialElement = r.addDial();
    // get the target number
    dialElement.addNumber(dstNum);
    r.addSpeak('Awesome', {
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