import express from 'express';
import Category from '../models/Category.js';
import asyncHandler from 'express-async-handler';

const router = express.Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const result = await Category.find({});
    return res.status(200).send({ result });
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const category = new Category({
      name: req.body.name,
    });
    const result = await category.save();
    return res
      .status(200)
      .json({ message: 'دسته جدید با موفقیت ثبت شد', data: result });
  })
);

export default router;
