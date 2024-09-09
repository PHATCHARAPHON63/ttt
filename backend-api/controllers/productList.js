const ProductList = require('../models/product')

// ค้นหาสินค้าด้วย code
exports.searchProductByCode = async (req, res) => {
  console.log('searchProductByCode function called');
  try {
    const { code } = req.query;
    console.log('Searching for code:', code);
    
    if (!code) {
      return res.status(400).json({ message: 'Code parameter is required' });
    }

    const product = await ProductList.findOne({ code });
    
    if (!product) {
      console.log('Product not found');
      return res.status(404).json({ message: 'ไม่พบสินค้า' });
    }
    
    console.log('Product found:', product);
    res.json(product);
  } catch (error) {
    console.error('Error in searchProductByCode:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการค้นหาสินค้า', error: error.message });
  }
};
  exports.getProductListByPos = async (req, res) => {
    try {
      const { pos } = req.body;
      const productList = await ProductList.findOne({ pos }).lean();
  
      if (!productList) {
        return res.status(404).json({ message: 'Product not found', pos });
      }
  
      // เพิ่มการตรวจสอบและกำหนดค่าเริ่มต้น
      const result = {
        _id: productList._id,
        position: productList.position || pos,
        pos: productList.pos || pos,
        code: productList.code || 'ไม่ระบุ',
        product_list: productList.product_list || 'ไม่ระบุ',
        quantity: productList.quantity !== undefined ? productList.quantity : 'ไม่ระบุ'
      };
  
      console.log('Data to be sent:', result);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error fetching product list:', error);
      res.status(500).json({ message: 'Error fetching product list', error: error.message });
    }
  };

exports.getAllProductLists = async (req, res) => {
    try {
      console.log('Fetching all product lists...');
      const productLists = await ProductList.find().lean();
      console.log(`Found ${productLists.length} product lists`);
      
      // Log ตัวอย่างข้อมูล 3 รายการแรก
      console.log('Sample data (first 3 items):');
      console.log(JSON.stringify(productLists.slice(0, 3), null, 2));
      
      // Log ชื่อฟิลด์ทั้งหมดของรายการแรก
      if (productLists.length > 0) {
        console.log('Fields in the first item:');
        console.log(Object.keys(productLists[0]));
      }
  
      res.status(200).json(productLists);
    } catch (error) {
      console.error('Error fetching product lists:', error);
      res.status(500).json({ message: 'Error fetching product lists', error: error.message });
    }
  };

  exports.getProductListByCode = async (req, res) => {
    try {
      const { code } = req.body;
      const productList = await ProductList.findOne({ code }).lean();
  
      if (!productList) {
        return res.status(404).json({ message: 'Product not found', pos });
      }
  
      // เพิ่มการตรวจสอบและกำหนดค่าเริ่มต้น
      const result = {
        _id: productList._id,
        position: productList.position || pos,
        pos: productList.pos || pos,
        code: productList.code || 'ไม่ระบุ',
        product_list: productList.product_list || 'ไม่ระบุ',
        quantity: productList.quantity !== undefined ? productList.quantity : 'ไม่ระบุ'
      };
  
      console.log('Data to be sent:', result);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error fetching product list:', error);
      res.status(500).json({ message: 'Error fetching product list', error: error.message });
    }
  };