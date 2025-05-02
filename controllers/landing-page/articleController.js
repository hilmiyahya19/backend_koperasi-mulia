const Article = require('../../models/landing-page/article');

// GET all articles
exports.getAllArticles = async (req, res) => {
    try {
        const articles = await Article.find().sort({ date: -1 }); // Urutkan dari terbaru
        res.status(200).json(articles);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data artikel', error });
    }
};

// GET single article by ID
exports.getArticleById = async (req, res) => {
    const { id } = req.params;
    try {
        const article = await Article.findById(id);
        if (!article) {
            return res.status(404).json({ message: 'Artikel tidak ditemukan' });
        }
        res.status(200).json(article);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data artikel', error });
    }
};

// CREATE a new article
exports.createArticle = async (req, res) => {
    const { title, content, author, date, image } = req.body;
    const imageUrl = req.file?.path; // URL Cloudinary

    if (!title || !content || !author) {
        return res.status(400).json({ message: 'Judul, konten, dan penulis wajib diisi' });
    }

    try {
        const existingCount = await Article.countDocuments();
        if (existingCount >= 3) {
            return res.status(400).json({ message: 'Tidak bisa menambah artikel. Maksimal 3 data diperbolehkan.' });
        }

        const newArticle = new Article({ 
            title, 
            content, 
            author, 
            date,
            image: imageUrl, 
        });
        const savedArticle = await newArticle.save();
        res.status(201).json(savedArticle);
    } catch (error) {
        res.status(500).json({ message: 'Gagal menambah artikel', error });
    }
};

// UPDATE article
exports.updateArticle = async (req, res) => {
    const { id } = req.params;
    const { title, content, author, date, image } = req.body;
    const imageUrl = req.file?.path; // Ambil URL gambar jika ada file baru

    if (!title || !content || !author) {
        return res.status(400).json({ message: 'Judul, konten, dan penulis wajib diisi' });
    }

    try {
        // Ambil data artikel lama (untuk ambil image sebelumnya jika tidak diganti)
        const existingArticle = await Article.findById(id);
        if (!existingArticle) {
            return res.status(404).json({ message: 'Artikel tidak ditemukan' });
        }

        const updatedArticle = await Article.findByIdAndUpdate(
            id,
            { 
                title, 
                content, 
                author, 
                date, 
                image: imageUrl || existingArticle.image, // Pakai gambar baru jika ada, kalau tidak tetap pakai yang lama 
            },
            { new: true }
        );

        if (!updatedArticle) {
            return res.status(404).json({ message: 'Artikel tidak ditemukan' });
        }

        res.status(200).json(updatedArticle);
    } catch (error) {
        res.status(500).json({ message: 'Gagal memperbarui artikel', error });
    }
};

// DELETE article
exports.deleteArticle = async (req, res) => {
    const { id } = req.params;
    try {
        const deleted = await Article.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ message: 'Artikel tidak ditemukan' });
        }
        res.status(200).json({ message: 'Artikel berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menghapus artikel', error });
    }
};
