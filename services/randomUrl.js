// DUMMY (FOR TESTING) ENDPOINT, may be removed

var express = require("express");
const { appLogger } = require("../logger");
var router = express.Router();
// const Joi = require('joi');

// const bodySchema = Joi.object({
//     walletName: Joi.string().min(5).max(100).required(),
// })

router.get("/", async (req, res) => {
  const { body } = req;
  appLogger.info("Body START : ", body);

  try {
    res.json({
      balance: "TEST RESPONSE",
    });
  } catch (err) {
    appLogger.info(err);
    return res.status(400).json({ error: err.toString() });
  }
});

module.exports = router;
