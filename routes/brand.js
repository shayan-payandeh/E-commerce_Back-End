import express from 'express';
import Brand from '../models/Brand.js';
import asyncHandler from 'express-async-handler';

const router = express.Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const result = await Brand.find({});
    return res.status(200).send({ result });
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const brand = new Brand({
      name: req.body.name,
    });
    const result = await brand.save();
    return res
      .status(200)
      .json({ message: 'برند جدید با موفقیت ثبت شد', data: result });
  })
);

export default router;
