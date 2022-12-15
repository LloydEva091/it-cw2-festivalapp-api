const jwt = require("jsonwebtoken")
const expressAsyncHandler = require("express-async-handler")
const User = require("../models/User")

const protect = expressAsyncHandler(async (req, res, next) => {
  let token
  // console.log(req.headers.authorization)
  if (
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "Bearer"
  ) {
    // Get token from header
    token = req.headers.authorization.split(" ")[1]
    try {
      // console.log(token)
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      // Get user from token
      req.user = await User.findById(decoded.id).select("-password")
      // Check if a user was found
      if (!req.user) {
        res.status(401)
        throw new Error("Not authorized")
      }

      next()
    } catch (error) {
      console.log(error)
      res.status(401)
      throw new Error("Not authorized")
    }
  }

  if (!token) {
    res.status(401)
    throw new Error("Not authorized")
  }
})

module.exports = protect