const Product = require('../models/product');
const multer = require('multer');
const { storage } = require('../utils/cloudinary');
const upload = multer({ storage });
const XLSX = require('xlsx');
const fs = require('fs');

// GET all products
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data produk', error });
    }
};

// GET product by ID
exports.getProductById = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: 'Produk tidak ditemukan' });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data produk', error });
    }
};

// CREATE a new product
exports.createProduct = async (req, res) => {
    const { name, category, price, description, image } = req.body;
    const imageUrl = req.file?.path; // URL Cloudinary
  
    if (!name || !category || !price || !description) {
      return res.status(400).json({ message: "Semua field harus diisi" });
    }
  
    try {
        // Cek apakah nama produk sudah ada
        const existingProduct = await Product.findOne({ 
            name,
        });
    
        if (existingProduct) {
            return res.status(400).json({ message: "Nama produk sudah digunakan" });
        }

        const product = new Product({ 
            name, 
            category, 
            price, 
            description, 
            stock: 0,
            image: imageUrl, 
        });
        const savedProduct = await product.save();
        res.status(201).json(savedProduct);
        
        // console.log("Request body:", req.body); 
        // console.log("File upload:", req.file);

    }   catch (error) {
        console.error("ERROR CREATE PRODUCT:", error); // tambahkan ini
        res.status(500).json({ message: 'Gagal menambah produk', error });
    }
};

// ✅ UPDATE a product (stok tidak bisa diubah manual)
exports.updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, category, price, description, image } = req.body;
    const imageUrl = req.file?.path; // Ambil URL gambar jika ada file baru
  
    if (!name || !category || !price || !description) {
      return res.status(400).json({ message: "Semua field harus diisi" });
    }
  
    try {
        // Ambil data produk lama (untuk ambil image sebelumnya jika tidak diganti)
        const productToUpdate = await Product.findById(id);
        if (!productToUpdate) {
            return res.status(404).json({ message: 'Produk tidak ditemukan' });
        }

        // Cek apakah nama produk sudah digunakan oleh produk lain
        const existingProduct = await Product.findOne({ 
            name, // tidak diberi or seperti yg ada di member, karena cuma ngecek 1 field
            _id: { $ne: id } // Pastikan bukan dirinya sendiri
        });    

        if (existingProduct) {
            return res.status(400).json({ message: "Nama produk sudah digunakan" });
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            {
                name,
                category,
                price,
                description,
                image: imageUrl || productToUpdate.image, // jaga-jaga kalau tidak upload gambar baru
            },
            { new: true }
        );        
  
        if (!updatedProduct) {
            return res.status(404).json({ message: 'Produk tidak ditemukan' });
        }
  
        res.status(200).json(updatedProduct);
    }   catch (error) {
        res.status(500).json({ message: 'Gagal memperbarui produk', error });
    }
};

// ✅ DELETE a product
exports.deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedProduct = await Product.findByIdAndDelete(id);
        if (!deletedProduct) {
            return res.status(404).json({ message: 'Produk tidak ditemukan' });
        }
        res.status(200).json({ message: 'Produk berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menghapus produk', error });
    }
};

// import data produk dari file excel
exports.importProductsFromExcel = async (req, res) => {
    // console.log('Uploaded file:', req.file); // Debugging file yang diterima
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'File Excel tidak ditemukan' });
        }

        const workbook = XLSX.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);

        const productsToInsert = data.map((item) => ({
        name: item.name,
        category: item.category,
        price: item.price,
        description: item.description || '',
        stock: 0,
        image: '', // default kosong, bisa kamu ubah nanti
        }));

        const insertedProducts = await Product.insertMany(productsToInsert);
        fs.unlinkSync(req.file.path); // hapus file excel dari folder uploads

        res.status(201).json({
        message: `${insertedProducts.length} produk berhasil diimport`,
        data: insertedProducts,
        });
    } catch (error) {
        console.error('ERROR IMPORT EXCEL:', error);
        res.status(500).json({ message: 'Gagal mengimport data produk', error });
    }
};
