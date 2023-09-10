var express = require("express");
var router = express.Router();
// const Joi = require('joi');

// const bodySchema = Joi.object({
//     walletName: Joi.string().min(5).max(100).required(),
// })

router.get("/", async (req, res) => {
  const { body } = req;
  console.log("Body START : ", body);

  try {
    res.json({
      balance: "TEST RESPONSE",
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: err.toString() });
  }
});

module.exports = router;
