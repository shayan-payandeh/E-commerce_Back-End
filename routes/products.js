import express, { response } from 'express';
import expressAsyncHandler from 'express-async-handler';
import formidable from 'formidable';
import fs from 'fs';
import shortid from 'shortid';
import Brand from '../models/Brand.js';
import Category from '../models/Category.js';
import order from '../models/order.js';
import Product from '../models/Product.js';
import { isAuth, isAdmin } from '../utils.js';

const router = express.Router();

const setSort = (sort) => {
  const sortObj = {};
  switch (sort) {
    case 'newest': {
      sortObj.createdAt = -1;
      return sortObj;
    }
    case 'cheaper': {
      sortObj.price = 1;
      return sortObj;
    }

    case 'expensive': {
      sortObj.price = -1;
      return sortObj;
    }
    default: {
      sortObj.createdAt = -1;
      return sortObj;
    }
  }
};

router.get(
  '/bestselling',
  expressAsyncHandler(async (req, res) => {
    const orders = await order.find();
    const products = await Product.find();
    const arrayOfItems = [];
    for (const order of orders) {
      for (const iterator of order.orderItems) {
        arrayOfItems.push(iterator);
      }
    }
    let bestSeller = [];
    const arrayOfItemsCopy = [...arrayOfItems];
    for (const iterator of arrayOfItemsCopy) {
      const isExist = bestSeller.find((item) => item._id === iterator._id);
      if (isExist) {
        isExist.quantity = isExist.quantity + iterator.quantity;
        const index = bestSeller.findIndex((item) => item._id === iterator._id);
        bestSeller.splice(index, 1, isExist);
      } else {
        bestSeller.push(iterator);
      }
    }
    bestSeller.sort((a, b) => b.quantity - a.quantity);
    const limitedBestSeller = bestSeller.slice(0, 4);
    const bestOrderItems = [...limitedBestSeller];
    let bestSellingProducts = [];
    for (const product of products) {
      for (const orderItem of bestOrderItems) {
        if (orderItem._id.toString() === product._id.toString()) {
          bestSellingProducts.push(product);
        }
      }
    }

    res.send(bestSellingProducts);
  })
);

router.get('/', async (req, res) => {
  const query = {};
  const category = req.query.categoryId;
  if (category) query.category = category;

  const { slug } = req.query;
  const { brand } = req.query;
  if (slug) {
    const { _id } = await Category.findOne({ name: slug });
    query.category = _id;
  }
  if (brand) {
    const { _id } = await Brand.findOne({ name: brand });
    query.brand = _id;
  }

  const options = {
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 9,
    sort: {},
  };
  options.sort = req.query.sort ? setSort(req.query.sort) : {};
  const result = await Product.paginate(query, options);
  return res.status(200).json({ data: result });
});

// router.get(
//   '/seed',
//   // isAuth,
//   // isAdmin,
//   asyncHandler(async (req, res) => {
//     console.log(data.products);
//     const createdProducts = await Product.insertMany(data.products);
//     res.send({ createdProducts });
//   })
// );

router.get('/:slug', async (req, res) => {
  try {
    let product = await Product.findOne({ slug: req.params.slug });
    const category = await Category.findById(product.category);
    const brand = await Brand.findById(product.brand);
    product.category = category;
    product.brand = brand;
    res.status(200).send(product);
  } catch (error) {
    res.status(404).send({
      message: 'product does not exist',
      persianMessage: 'محصول مورد نظر وجود ندارد',
    });
  }
});

router.post(
  '/',
  expressAsyncHandler(async (req, res) => {
    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
      const imagePath = `/image/${files.image.originalFilename}`;
      const image = fs.readFileSync(files.image.filepath);
      fs.writeFileSync(`./public${imagePath}`, image);

      const product = new Product({
        name: fields.name,
        slug: fields.slug,
        category: fields.category,
        image: imagePath,
        price: fields.price,
        brand: fields.brand,
        rating: 4.5,
        numReviews: 10,
        countInStock: fields.countInStock,
        description: fields.description,
      });
      const response = await product.save();
      return res.status(200).json({
        data: response,
        message: 'Product is updated successfully',
        persianMessage: 'محصول جدید با موفقیت ثبت شد',
      });
    });
  })
);

export default router;
