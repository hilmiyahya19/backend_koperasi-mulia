const Activity = require('../../models/landing-page/activity');

// GET all activities
exports.getAllActivities = async (req, res) => {
    try {
        const activities = await Activity.find().sort({ date: -1 }); // Urutkan dari terbaru
        res.status(200).json(activities);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data aktivitas', error });
    }
};

// GET single activity by ID
exports.getActivityById = async (req, res) => {
    const { id } = req.params;
    try {
        const activity = await Activity.findById(id);
        if (!activity) {
            return res.status(404).json({ message: 'Aktivitas tidak ditemukan' });
        }
        res.status(200).json(activity);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data aktivitas', error });
    }
};

// CREATE a new activity
exports.createActivity = async (req, res) => {
    const { title, date, location, description, image } = req.body;
    const imageUrl = req.file?.path; // URL Cloudinary

    if (!title || !date || !location) {
        return res.status(400).json({ message: 'Judul, tanggal, dan lokasi wajib diisi' });
    }

    try {
        const existingCount = await Activity.countDocuments();
        if (existingCount >= 3) {
            return res.status(400).json({ message: 'Tidak bisa menambah kegiatan. Maksimal 3 data diperbolehkan.' });
        }

        const newActivity = new Activity({ 
            title, 
            date, 
            location, 
            description,
            image: imageUrl,  
        });
        const savedActivity = await newActivity.save();
        res.status(201).json(savedActivity);
    } catch (error) {
        res.status(500).json({ message: 'Gagal menambah aktivitas', error });
    }
};

// UPDATE activity
exports.updateActivity = async (req, res) => {
    const { id } = req.params;
    const { title, date, location, description, image } = req.body;
    const imageUrl = req.file?.path; // Ambil URL gambar jika ada file baru

    if (!title || !date || !location) {
        return res.status(400).json({ message: 'Judul, tanggal, dan lokasi wajib diisi' });
    }

    try {
        // Ambil data kegiatan lama (untuk ambil image sebelumnya jika tidak diganti)
        const existingActivity = await Activity.findById(id);
        if (!existingActivity) {
            return res.status(404).json({ message: 'Kegiatan tidak ditemukan' });
        }

        const updatedActivity = await Activity.findByIdAndUpdate(
            id,
            { 
                title, 
                date, 
                location, 
                description, 
                image: imageUrl || existingActivity.image, // Pakai gambar baru jika ada, kalau tidak tetap pakai yang lama
            },
            { new: true }
        );

        if (!updatedActivity) {
            return res.status(404).json({ message: 'Aktivitas tidak ditemukan' });
        }

        res.status(200).json(updatedActivity);
    } catch (error) {
        res.status(500).json({ message: 'Gagal memperbarui aktivitas', error });
    }
};

// DELETE activity
exports.deleteActivity = async (req, res) => {
    const { id } = req.params;
    try {
        const deleted = await Activity.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ message: 'Aktivitas tidak ditemukan' });
        }
        res.status(200).json({ message: 'Aktivitas berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menghapus aktivitas', error });
    }
};
