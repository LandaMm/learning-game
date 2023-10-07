const Teachers = require("../services/teacher");

const teachers = new Teachers();

const makeAdmin = (app) => {
  app.post("/makeadmin", async (req, res) => {
    const email = req.body.email;
    const mode = req.body.mode;
    const user = await teachers.findByEmail(email);
    if (!user) {
      return res.status(400).json({
        statusCode: 400,
        message: "Teacher with given email is not found.",
      });
    }

    user.isAdmin = mode === "enabled" ? true : false;

    await user.save();

    res.status(200).json({
      statusCode: 200,
      message: `Success. Teacher now is ${user.isAdmin ? "" : "not "} admin.`,
    });
  });
};

module.exports = makeAdmin;
