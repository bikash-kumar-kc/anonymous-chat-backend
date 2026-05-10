import jwt from "jsonwebtoken";

export const adminAuthMiddleware = (req, res, next) => {
  const jwtToken = req.cookies?.jwtToken;

  if (!jwtToken || !jwtToken.trim()) {
    return res.status(401).json({
      error: "Unauthorized access",
    });
  }

  try {
    const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(404).json({
        error: "Invalid Jwt Token",
      });
    }
    req.admin = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired Token" });
  }
};
