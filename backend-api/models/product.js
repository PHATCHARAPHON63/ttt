const mongoose = require('mongoose')

const productListSchema = new mongoose.Schema({
  position: {
    type: String,
  },
  code: {
    type: String,
  },
  product_list: {
    type: String,
  },
  quantity: {
    type: String,
  },
  po: {
    type: String,
  },
})

const ProductList = mongoose.model('ProductList', productListSchema)

module.exports = ProductList
