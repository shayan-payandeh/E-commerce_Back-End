import express, { query } from 'express';
import expressAsyncHandler from 'express-async-handler';
import Order from '../models/order.js';
import Product from '../models/Product.js';
import { isAdmin, isAuth } from '../utils.js';

const router = express.Router();

router.get(
  '/',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const orders = await Order.find();
    // .populate("user")
    // .populate("orderItems.product");
    res.status(200).send(orders);
  })
);

const setSort = (sort) => {
  const sortObj = {};
  switch (sort) {
    case 'newest': {
      sortObj.createdAt = -1;
      return sortObj;
    }
    case 'oldest': {
      sortObj.createdAt = 1;
      return sortObj;
    }
    case 'cheaper': {
      sortObj.totalPrice = 1;
      return sortObj;
    }

    case 'expensive': {
      sortObj.totalPrice = -1;
      return sortObj;
    }
    default: {
      sortObj.createdAt = -1;
      return sortObj;
    }
  }
};

router.get(
  '/mine',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    // const paidOrders = await Order.find({
    //   $and: [{ user: req.user._id }, { isPaid: true }],
    // }); const options = {
    const query = {};
    query.user = req.user._id;
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 5,
      sort: {},
    };
    options.sort = req.query.sort ? setSort(req.query.sort) : {};
    const orders = await Order.paginate(query, options);
    res.send(orders);
  })
);

router.post(
  '/',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    if (req.body.orderItems.length === 0) {
      return res.status(400).send({
        message: 'Cart is empty',
        persianMessage: 'سبد خرید خالی می باشد',
      });
    }
    // calculate total price from back-end :
    // let totalPrice = 0;
    // for (let item of req.body.orderItems) {
    //   const currItem = await Products.findById(item.product);
    //   totalPrice =
    //     totalPrice + parseInt(item.quantity) * parseInt(currItem.offPrice);
    // }

    const today = new Date();
    const second = String(today.getSeconds()).padStart(2, '0');
    const min = String(today.getMinutes()).padStart(2, '0');
    const hour = String(today.getHours()).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    const persianDate = new Date().toLocaleDateString('fa-IR');

    const order = new Order({
      ...req.body,
      userId: req.user._id,
      orderItems: req.body.orderItems,
      persianCreatedAt: `${persianDate}`,
      createdAt: `${dd}/${mm}/${yyyy}-${hour}:${min}:${second}`,
      user: req.user._id,
    });
    try {
      const savedOrder = await order.save();
      res.send(savedOrder);
    } catch (error) {
      res.status(400).send(error);
    }
  })
);

router.get(
  '/:id',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) return res.send(order);
    return res.status(404).send({
      message: 'Order was Not Found',
      persianMessage: 'سفارش مورد نظر یافت نشد',
    });
  })
);

export default router;
