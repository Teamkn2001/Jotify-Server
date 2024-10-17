const prisma = require("../configs/prisma");
const createError = require("../utils/createError");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const authController = {};

authController.register = async (req, res, next) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    if (
      !(
        username.trim() &&
        email.trim() &&
        password.trim() &&
        confirmPassword.trim()
      )
    ) {
      createError(400, "must fll all data");
    }

    if (password !== confirmPassword) {
      createError(400, "password and confirmPassword not match");
    }

    const isUserExist = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (isUserExist) {
      createError(400, "email already in use");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const data = {
      username,
      email,
      password: hashedPassword,
    };
    console.log("data", data);

    const updateData = await prisma.user.create({
      data: data,
    });

    res.json({ meg: "login success" });
  } catch (error) {
    next(error);
  }
};

authController.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log(req.body);

    if (!(email.trim(), password.trim())) {
      createError(400, "please email or password");
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    console.log(user);

    if (!user) {
      createError(400, "Invalid login");
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if(!isPasswordMatch){
        createError(401, "Invalid login")
    }

    const payload = {
        id : user.id,
        email : user.email
    }

    const token = await jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: "7d"})

    const { password : pw, ...userData } = user 

    res.json({ token, userData });
  } catch (error) {
    next(error);
  }
};

module.exports = authController;

module.exports;
