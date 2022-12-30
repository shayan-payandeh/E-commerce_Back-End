import express from 'express';
import Category from '../models/Category.js';
import asyncHandler from 'express-async-handler';

const router = express.Router();

const setSort = (sort) => {
  const sortObj = {};
  switch (sort) {
    case 'alphabet': {
      sortObj.name = -1;
      return sortObj;
    }
    case 'reverseAlphabet': {
      sortObj.name = 1;
      return sortObj;
    }

    default: {
      sortObj.createdAt = -1;
      return sortObj;
    }
  }
};

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const query = {};
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 9,
      sort: {},
    };
    options.sort = req.query.sort ? setSort(req.query.sort) : {};
    const result = await Category.paginate(query, options);
    return res.status(200).send({ data: result });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    try {
      let category = await Category.findById(req.params.id);
      res.status(200).send(category);
    } catch (error) {
      res.status(404).send({
        message: 'category not exist',
        persianMessage: 'دسته مورد نظر وجود ندارد',
      });
    }
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const category = new Category({
      name: req.body.name,
    });
    const result = await category.save();
    return res.status(200).json({
      message: 'Added successfully',
      persianMessage: 'دسته جدید با موفقیت ثبت شد',
      data: result,
    });
  })
);

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const theCategory = await Category.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
      },
      { new: true }
    );
    if (theCategory) {
      res.status(200).json({
        message: 'Edited successfully',
        persianMessage: 'دسته جدید با موفقیت ویرایش شد',
        data: theCategory,
      });
    } else {
      res.status(404).send({
        message: 'Category not exist',
        persianMessage: 'دسته مورد نظر وجود ندارد',
      });
    }
  })
);

router.delete('/:id', async (req, res) => {
  const theCategory = await Category.findByIdAndDelete(req.params.id);
  if (theCategory) {
    res.status(200).json({
      message: 'Deleted successfully',
      persianMessage: 'دسته جدید با موفقیت حذف شد',
      data: theCategory,
    });
  } else {
    res.status(404).send({
      message: 'Category not exist',
      persianMessage: 'دسته مورد نظر وجود ندارد',
    });
  }
});

export default router;
