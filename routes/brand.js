import express from 'express';
import Brand from '../models/Brand.js';
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
    const result = await Brand.paginate(query, options);
    return res.status(200).send({ data: result });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    try {
      let brand = await Brand.findById(req.params.id);
      res.status(200).send(brand);
    } catch (error) {
      res.status(404).send({
        message: 'brand  not exist',
        persianMessage: 'برند مورد نظر وجود ندارد',
      });
    }
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const brand = new Brand({
      name: req.body.name,
    });
    const result = await brand.save();
    return res.status(200).json({
      message: 'Added successfully',
      persianMessage: 'برند جدید با موفقیت ثبت شد',
      data: result,
    });
  })
);

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const theBrand = await Brand.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
      },
      { new: true }
    );
    if (theBrand) {
      res.status(200).json({
        message: 'Edited successfully',
        persianMessage: 'برند جدید با موفقیت ویرایش شد',
        data: theBrand,
      });
    } else {
      res.status(404).send({
        message: 'Brand not exist',
        persianMessage: 'برند مورد نظر وجود ندارد',
      });
    }
  })
);

router.delete('/:id', async (req, res) => {
  const theBrand = await Brand.findByIdAndDelete(req.params.id);
  if (theBrand) {
    res.status(200).json({
      message: 'Deleted successfully',
      persianMessage: 'برند جدید با موفقیت حذف شد',
      data: theBrand,
    });
  } else {
    res.status(404).send({
      message: 'Brand not exist',
      persianMessage: 'برند مورد نظر وجود ندارد',
    });
  }
});

export default router;
