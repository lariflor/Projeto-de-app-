const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  image: { type: String, required: true },
  type: { 
    type: String, 
    required: true, 
    enum: ['frios', 'laticínios', 'não perecíveis', 'bebidas', 'outros'], 
    default: 'outros' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);