const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ==========================================
// CREATE TOKEN
// ==========================================

const generateToken = (userId) => {
  return jwt.sign(
    {
      id: userId.toString(),
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

// ==========================================
// REGISTER USER
// ==========================================

const registerUser = async (
  req,
  res
) => {
  try {
    let {
      name,
      email,
      password,
    } = req.body;

    if (
      !name ||
      !email ||
      !password
    ) {
      return res
        .status(400)
        .json({
          message:
            "Name, email and password are required",
        });
    }

    name = name.trim();

    email =
      email
        .trim()
        .toLowerCase();

    if (!name) {
      return res
        .status(400)
        .json({
          message:
            "Name cannot be empty",
        });
    }

    const existingUser =
      await User.findOne({
        email,
      });

    if (existingUser) {
      return res
        .status(400)
        .json({
          message:
            "User already exists",
        });
    }

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );

    const user =
      await User.create({
        name,
        email,

        password:
          hashedPassword,
      });

    res.status(201).json({
      message:
        "User registered successfully",

      user: {
        _id:
          user._id,

        id:
          user._id,

        name:
          user.name,

        email:
          user.email,

        bio:
          user.bio || "",

        profilePicture:
          user.profilePicture ||
          "",
      },
    });
  } catch (error) {
    console.error(
      "Registration error:",
      error
    );

    res.status(500).json({
      message:
        "Server error",
    });
  }
};

// ==========================================
// LOGIN USER
// ==========================================

const loginUser = async (
  req,
  res
) => {
  try {
    let {
      email,
      password,
    } = req.body;

    if (
      !email ||
      !password
    ) {
      return res
        .status(400)
        .json({
          message:
            "Email and password are required",
        });
    }

    email =
      email
        .trim()
        .toLowerCase();

    const user =
      await User.findOne({
        email,
      });

    if (!user) {
      return res
        .status(401)
        .json({
          message:
            "Invalid email or password",
        });
    }

    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatch) {
      return res
        .status(401)
        .json({
          message:
            "Invalid email or password",
        });
    }

    const token =
      generateToken(
        user._id
      );

    res.status(200).json({
      message:
        "Login successful",

      token,

      user: {
        _id:
          user._id,

        id:
          user._id,

        name:
          user.name,

        email:
          user.email,

        bio:
          user.bio || "",

        profilePicture:
          user.profilePicture ||
          "",
      },
    });
  } catch (error) {
    console.error(
      "Login error:",
      error
    );

    res.status(500).json({
      message:
        "Server error",
    });
  }
};

// ==========================================
// GET CURRENT USER
// ==========================================

const getMe = async (
  req,
  res
) => {
  try {
    const user =
      await User.findById(
        req.user.id
      )
        .select(
          "-password"
        )
        .lean();

    if (!user) {
      return res
        .status(404)
        .json({
          message:
            "User not found",
        });
    }

    res.status(200).json({
      user: {
        ...user,

        _id:
          user._id,

        id:
          user._id,
      },
    });
  } catch (error) {
    console.error(
      "Get user error:",
      error
    );

    res.status(500).json({
      message:
        "Server error",
    });
  }
};

// ==========================================
// EXPORT
// ==========================================

module.exports = {
  registerUser,
  loginUser,
  getMe,
};