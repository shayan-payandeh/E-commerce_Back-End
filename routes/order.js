import express, { query } from 'express';
import expressAsyncHandler from 'express-async-handler';
import Order from '../models/Order.js';
import User from '../models/User.js';
import { isAdmin, isAuth } from '../utils.js';

const router = express.Router();

const setSort = (sort) => {
  const sortObj = {};
  switch (sort) {
    case 'alphabetUser': {
      sortObj.user = 1;
      return sortObj;
    }
    case 'reverseAlphabetUser': {
      sortObj.user = -1;
      return sortObj;
    }

    case 'delieveredFirst': {
      sortObj.isDelievered = 1;
      return sortObj;
    }
    case 'processingFirst': {
      sortObj.isDelievered = -1;
      return sortObj;
    }

    case 'oldest': {
      sortObj.persianCreatedAt = 1;
      return sortObj;
    }
    case 'newest': {
      sortObj.persianCreatedAt = -1;
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
  '/',
  // isAuth,
  // isAdmin,
  expressAsyncHandler(async (req, res) => {
    const query = {};
    if (req.query.isDelievered) {
      query._id = [];
      const allOrders = await Order.find();
      const isDelievered = req.query.isDelievered === 'true' ? true : false;
      const filteredorders = allOrders.filter(
        (user) => user.isDelievered === isDelievered
      );
      const ordersId = filteredorders.map((user) => user._id);
      query._id.push(...ordersId);
    }
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 9,
      sort: {},
    };
    options.sort = req.query.sort ? setSort(req.query.sort) : {};
    const result = await Order.paginate(query, options);
    return res.status(200).send({ data: result });
  })
);

router.get(
  '/mine',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    // const paidOrders = await Order.find({
    //   $and: [{ user: req.user._id }, { isPaid: true }],
    // });
    const query = {};
    query._id = [];
    const allOrders = await Order.find();
    const theOrdersId = allOrders
      .filter((order) => order.user.email === req.user.email)
      .map((item) => item._id);
    query._id.push(...theOrdersId);
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
    const today = new Date();
    const second = String(today.getSeconds()).padStart(2, '0');
    const min = String(today.getMinutes()).padStart(2, '0');
    const hour = String(today.getHours()).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    const persianDate = new Date().toLocaleDateString('fa-IR');
    const user = await User.findById(req.user._id);
    if (!user)
      res.status(404).send({
        message: 'user not found',
        persianMessage: 'کاربر مورد نظر یافت نشد',
      });

    const order = new Order({
      ...req.body,
      user: {
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        persianCreatedAt: user.persianCreatedAt,
        time: user.time,
      },
      orderItems: req.body.orderItems,
      persianCreatedAt: `${persianDate}`,
      createdAt: `${dd}/${mm}/${yyyy}-${hour}:${min}:${second}`,
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
