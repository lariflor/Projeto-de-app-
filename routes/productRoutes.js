const express = require('express');
const multer = require('multer');
const Product = require('../models/Product');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

router.post('/estoque', upload.single('image'), async (req, res) => {
  try {
    console.log('Corpo da requisição recebido:', req.body); // Dados recebidos no corpo
    console.log('Arquivo recebido:', req.file); // Dados do arquivo de imagem

    const { name, description, price, quantity, type } = req.body;
    const image = req.file ? req.file.path : null;

    if (!image) {
      return res.status(400).json({ message: 'Imagem é obrigatória!' });
    }

    if (!type || !['frios', 'laticínios', 'não perecíveis', 'bebidas', 'outros'].includes(type)) {
      return res.status(400).json({ message: 'Tipo inválido!' });
    }

    const product = new Product({ name, description, price, quantity, type, image });
    await product.save();

    res.status(201).json(product);
  } catch (err) {
    console.error('Erro no backend:', err.message);
    res.status(500).json({ message: 'Erro interno', error: err.message });
  }
});

router.get('/estoque', async (req, res) => {
  try {
    const baseUrl = `${req.protocol}://${req.get('host')}/uploads/`;
    const products = await Product.find();

    const productsWithImageUrl = products.map((product) => ({
      ...product._doc,
      image: product.image ? `${baseUrl}${product.image.split('/').pop()}` : null,
    }));

    res.status(200).json(productsWithImageUrl);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar produtos', error: err.message });
  }
});
router.get('/estoque/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Produto não encontrado' });
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: 'Erro interno', error: err.message });
  }
});

router.put('/estoque/:id', upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, quantity, type } = req.body;
    const image = req.file ? req.file.path : null;

    if (type && !['frios', 'laticínios', 'não perecíveis', 'bebidas', 'outros'].includes(type)) {
      return res.status(400).json({ message: 'Tipo inválido' });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { name, description, price, quantity, type, image },
      { new: true }
    );

    if (!updatedProduct) return res.status(404).json({ message: 'Produto não encontrado' });

    res.status(200).json(updatedProduct);
  } catch (err) {
    res.status(500).json({ message: 'Erro interno', error: err.message });
  }
});

router.delete('/estoque/:id', async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) return res.status(404).json({ message: 'Produto não encontrado' });
    res.status(200).json({ message: 'Produto deletado com sucesso' });
  } catch (err) {
    res.status(500).json({ message: 'Erro interno', error: err.message });
  }
});

module.exports = router;