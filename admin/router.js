const { Router } = require("express");
const { adminLogger } = require("../logger");

const adminRouter = Router();

adminRouter.use((req, res, next) => {
  adminLogger.info(
    `request to "${req.path}" with data "${JSON.stringify(req.body)}"`,
  );
  next();
});

adminRouter.post("/login", (req, res) => {
  const body = req.body;

  // TODO: provide authorization
  res.send({
    statusCode: 200,
    message: "Successfully logged in",
    payload: body,
  });
});

module.exports = adminRouter;
