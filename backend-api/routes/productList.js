const express = require('express');
const router = express.Router();
const { getAllProductLists,getProductListByPos,searchProductByCode,getProductListByCode  } = require('../controllers/productList');
router.get('/search', searchProductByCode);



/**
 * @swagger
 * /getAllProductLists:
 *   get:
 *     summary: ดึงข้อมูล ProductList ทั้งหมด
 *     tags: [ProductList]
 *     responses:
 *       200:
 *         description: รายการ ProductList ทั้งหมด
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProductList'
 *       500:
 *         description: เกิดข้อผิดพลาดในการดึงข้อมูล
 * 
 * components:
 *   schemas:
 *     ProductList:
 *       type: object
 *       required:
 *         - position
 *         - code
 *         - product
 *         - quantity
 *       properties:
 *         position:
 *           type: number
 *           description: ตำแหน่งของสินค้าในรายการ
 *         code:
 *           type: string
 *           description: รหัสสินค้า
 *         product:
 *           type: string
 *           description: ชื่อสินค้า
 *         quantity:
 *           type: number
 *           description: จำนวนสินค้า
 */
router.get('/getAllProductLists', getAllProductLists);


/**
 * @swagger
 * /getProductListByPos:
 *   post:
 *     summary: Get product list by position
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pos
 *             properties:
 *               pos:
 *                 type: string
 *                 description: Position of the product
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 position:
 *                   type: string
 *                 code:
 *                   type: string
 *                 product_list:
 *                   type: string
 *                 quantity:
 *                   type: number
 *                 pos:
 *                   type: string
 *       400:
 *         description: Bad request
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */

router.post('/getProductListByPos', getProductListByPos);

/**
 * @swagger
 * /getProductListByCode:
 *   post:
 *     summary: Get product list by position
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pos
 *             properties:
 *               pos:
 *                 type: string
 *                 description: Position of the product
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 position:
 *                   type: string
 *                 code:
 *                   type: string
 *                 product_list:
 *                   type: string
 *                 quantity:
 *                   type: number
 *                 pos:
 *                   type: string
 *       400:
 *         description: Bad request
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */

router.post('/getProductListByCode', getProductListByCode );

module.exports = router;