const MainSurveyRouter = require("express").Router();

// Middleware
const authenticate = require("../../../middlewares/authenticate");

// Policies
const surveyPolicy = require("./../../../policies/surveyPolicies");


// Details
MainSurveyRouter.route('/')
  .get(authenticate(true), require('./surveyDetails'));

// Update
MainSurveyRouter.route('/')
  .put(authenticate(true), surveyPolicy.put, require('./surveyUpdate'));


// Skip
MainSurveyRouter.route('/skip')
  .delete(authenticate(), require('./surveySkip'));


module.exports = MainSurveyRouter;
