const Express = require("express");
const Themes = require('../../../models/themes');
const PublicThemes = require('../../../models/publicThemes');


/** @type {Express.RequestHandler} */
module.exports = async (req, res, next) => {
  const PublicID = req.params.id;


  const publicTheme = await PublicThemes.findOne({id: PublicID}, {_id: 0}).select('id description screenshot css theme').populate('theme', ' -_id name id').lean();
  if (!publicTheme) {
    return res.status(404).json({message: 'Invalid theme id.'});
  }

  res.json(publicTheme)
};