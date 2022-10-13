import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import cookieParser from 'cookie-parser';

export const generateToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    },
    process.env.JWT_SECRET || 'somethingsecret',
    {
      expiresIn: '30d',
    }
  );
};

export const isAuth = (req, res, next) => {
  const token = req.headers['x-auth-token'];

  // const token = authorization.slice(7, authorization.length); // Bearer XXXXXX
  // const token = authorization.split(' ')[1];
  // console.log(token);
  if (token) {
    // const token = authorization.slice(7, authorization.length);
    jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
      if (err) {
        res.status(401).send({ message: 'Token is not valid' });
      } else {
        req.user = decode;
        next();
      }
    });
  } else {
    res.status(401).send({ message: 'Token is not provided' });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401).send({ message: 'Invalid Admin Token' });
  }
};

export const isAuthWithCookie = (req, res, next) => {
  const parsedCookies = cookie.parse(req.headers.cookie || '');
  if (!parsedCookies.userToken) {
    return res.status(403).json({ message: 'لطفا ابتدا لاگین کنید' });
  }

  const token = cookieParser.signedCookie(
    parsedCookies.userToken,
    process.env.COOKIE_PARSER_SECRET || 'COOKIE PARSER SECRET'
  );

  try {
    const verified = jwt.verify(
      token,
      process.env.TOKEN_SECRET || 'somethingsecret'
    );
    req.user = verified;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid Token' });
  }
};

export function setCookie(user, res) {
  const cookieOptions = {
    maxAge: 1000 * 60 * 60 * 24 * 7, // would expire after 7 days
    httpOnly: true, // The cookie only accessible by the web server
    signed: true, // Indicates if the cookie should be signed
    sameSite: 'Lax',
    secure: process.env.NODE_ENV === 'development' ? false : true,
    domain: process.env.NODE_ENV === 'development' ? 'localhost' : '.domain.ir',
  };
  // res.setHeader("Set-Cookie", cookie.serialize("userToken", generateToken(user), cookieOptions));
  res.cookie('userToken', generateToken(user), cookieOptions); //
}
