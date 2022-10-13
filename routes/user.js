import express from 'express';
import asyncHandler from 'express-async-handler';
import { registerValidation, loginValidation } from '../validation.js';
import bcrypt from 'bcryptjs';
// import * as data from '../data.js';
import User from '../models/User.js';
import {
  generateToken,
  isAdmin,
  isAuth,
  isAuthWithCookie,
  setCookie,
} from './../utils.js';
import cookie from 'cookie';

const router = express.Router();

router.get(
  '/seed',
  // isAuth,
  // isAdmin,
  asyncHandler(async (req, res) => {
    const createdUsers = await User.insertMany(data.users);
    res.send({ createdUsers });
  })
);

router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { error } = registerValidation(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    // validate user data
    // const { error } = registerValidation(req.body);
    // if (error)
    //   return res.status(400).json({ message: error.details[0].message });

    // checking if the user is already in the data base :
    const emailExist = await User.findOne({ email: req.body.email });

    if (emailExist) {
      return res.status(400).json({
        message: 'The email already exists',
        persianMessage: 'ایمیل وارد شده در سیستم وجود دارد',
      });
    }
    // if (phoneNumberExist)
    //   return res.status(400).json({ message: 'phone Number already exists !' });

    // HASH PASSWORD :
    const salt = await bcrypt.genSaltSync(10);
    const hashedPassword = await bcrypt.hashSync(req.body.password, salt);

    const today = new Date();
    // const second = String(today.getSeconds()).padStart(2, '0');
    const min = String(today.getMinutes()).padStart(2, '0');
    const hour = String(today.getHours()).padStart(2, '0');
    // const dd = String(today.getDate()).padStart(2, '0');
    // const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    // const yyyy = today.getFullYear();

    const persianDate = new Date().toLocaleDateString('fa-IR');

    const user = new User({
      name: req.body.name,
      email: req.body.email.toLowerCase(),
      password: hashedPassword,
      persianCreatedAt: `${persianDate}`,
      time: `${hour}:${min}`,
    });

    const savedUser = await user.save();
    const token = generateToken(user);
    if (savedUser) {
      res.status(200).json({
        token,
        _id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        isAdmin: savedUser.isAdmin,
      });
    } else {
      res.status(400).send(error);
    }

    // try {
    //   //? set the httpOnly cookie from back-end
    //   setCookie(user, res);
    //   console.log('try');
    //   const savedUser = await user.save();
    //   console.log(savedUser);
    //   res.status(200).json({
    //     _id: savedUser._id,
    //     name: savedUser.name,
    //     email: savedUser.email,
    //     isAdmin: savedUser.isAdmin,
    //   });
    // } catch (error) {
    //   console.log(error);
    //   res.status(400).send(error);
    // }
  })
);

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    // validate user data
    const { error } = loginValidation(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const user = await User.findOne({ email: req.body.email.toLowerCase() });
    if (!user)
      return res
        .status(400)
        .json({
          message: 'Invalid Email/Password',
          persianMessage: 'ایمیل یا رمز عبور اشتباه است',
        });
    const validPass = await bcrypt.compareSync(
      req.body.password,
      user.password
    );
    const token = generateToken(user);
    if (user && validPass) {
      setCookie(user, res);
      res.send({
        token,
        _id: user._id,
        name: user.name,
        // phoneNumber: user.phoneNumber,
        email: user.email,
        isAdmin: user.isAdmin,
      });
    } else
      res.status(400).json({
        message: 'Invalid Email/Password',
        persianMessage: 'ایمیل یا رمز عبور اشتباه است',
      });

    //? set the httpOnly cookie from back-end
  })
);

router.put(
  '/',
  isAuth,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    const salt = await bcrypt.genSaltSync(10);
    const userPassword = req.body.password
      ? bcrypt.hashSync(req.body.password, salt)
      : user.password;
    const theUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        name: req.body.name,
        email: req.body.email,
        password: userPassword,
        isAdmin: req.body.isAdmin,
      },
      { new: true }
    );

    if (theUser) {
      const token = generateToken(theUser);
      res.status(200).json({
        token,
        _id: theUser._id,
        name: theUser.name,
        email: theUser.email,
        isAdmin: theUser.isAdmin,
      });
    } else
      res.status(404).send({
        message: 'The user was not found',
        persianMessage: 'کاربر مورد نظر یافت نشد',
      });
  })
);

// router.get(
//   '/logout',
//   asyncHandler(async (req, res) => {
//     const cookieOptions = {
//       maxAge: 1,
//       httpOnly: true,
//       signed: true,
//       sameSite: 'Lax',
//       secure: true,
//       path: '/',
//       domain:
//         process.env.NODE_ENV === 'development' ? 'localhost' : '.fronthooks.ir',
//     };
//     // Set cookie
//     res.cookie('userToken', null, cookieOptions); //
//     return res.status(200).json({ roles: null, auth: false });
//   })
// );

// router.get(
//   '/load',
//   isAuthWithCookie,
//   asyncHandler(async (req, res) => {
//     const user = await User.findById(req.user._id).select(
//       'name email phoneNumber'
//     );
//     if (user) {
//       return res.status(200).send(user);
//     }
//     return res.status(400).json({ message: 'user no found' });
//   })
// );

export default router;
