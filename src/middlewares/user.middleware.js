const { verifyJWT, signJWT } = require("../utils/jwt.utils");
const { getSession } = require("../utils/session");


const makeUser = (req, res, next) => {
  console.log(req.cookies);
  const { accessToken, refreshToken } = req.cookies;

  if (!accessToken) {
    console.log("No access token found");
    return next();
  }

  try {
    const { payload: user, expired } = verifyJWT(accessToken);

    // For valid accessToken
    if (user) {
      req.user = user;
      console.log("User set from access token:", user);
      return next();
    }

    // For valid but expired accessToken
    const { payload: refresh } = expired && refreshToken ? verifyJWT(refreshToken) : { payload: null };

    if (!refresh) {
      console.log("No refresh token found or invalid");
      return next();
    }

    const session = getSession(refresh.sessionId);

    if (!session) {
      console.log("No valid session found");
      return next();
    }

    const newAccessToken = signJWT(session, '1h');

    res.cookie('accessToken', newAccessToken, {
      maxAge: 30000, // 5 minutes
      httpOnly: true,
    });

    req.user = verifyJWT(newAccessToken).payload;
    console.log("User set from new access token:", req.user);

    return next();
  } catch (error) {
    console.error("Error decoding tokens:", error);
    return next(error);
  }
};

const makeUsers = (req, res, next) => {
  const { accessToken, refreshToken } = req.cookies;
  
  if (!accessToken) {
    console.log("No access token found");
    return next();
  }

  try {
    const { payload: user, expired } = verifyJWT(accessToken);

    // For valid accessToken
    if (user) {
      req.user = user;
      console.log("User set from access token:", user);
      return next();
    }

    // For valid but expired accessToken
    if (expired && refreshToken) {
      const { payload: refresh } = verifyJWT(refreshToken);

      if (refresh) {
        const session = getSession(refresh.sessionId);

        if (session) {
          const newAccessToken = signJWT(session, '1h');

          res.cookie('accessToken', newAccessToken, {
            maxAge: 30000, // 5 minutes
            httpOnly: true,
          });

          req.user = verifyJWT(newAccessToken).payload;
          console.log("User set from new access token:", req.user);

          return next();
        }
      }
    }

    console.log("No valid refresh token found");
    return next();
  } catch (error) {
    console.error("Error decoding tokens:", error);
    return next(error);
  }
};


module.exports = {
  makeUser,
  makeUsers
};
