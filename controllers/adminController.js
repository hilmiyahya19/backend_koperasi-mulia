const Admin = require('../models/admin');

// Mendapatkan semua admin (Hanya superAdmin)
exports.getAllAdmins = async (req, res) => {
    try {
        const admins = await Admin.find();
        res.status(200).json(admins);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data admin', error });
    }
};

// GET admin by ID
exports.getAdminById = async (req, res) => {
    const { id } = req.params;
    try {
        const admin = await Admin.findById(id);
        if (!admin) {
            return res.status(404).json({ message: 'Admin tidak ditemukan' });
        }
        res.status(200).json(admin);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data admin', error });
    }
};

// Membuat admin baru (Hanya superAdmin)
exports.createAdmin = async (req, res) => {
    const { username, password, role } = req.body;

    try {
        if (!username || !password || !role) {
            return res.status(400).json({ message: "Semua field harus diisi" });
        }

        const existingAdmin = await Admin.findOne({ username });
        if (existingAdmin) return res.status(400).json({ message: "Username sudah digunakan" });

        const newAdmin = new Admin({ username, password, role });
        await newAdmin.save();

        res.status(201).json({ message: "Admin berhasil ditambahkan", admin: newAdmin });
    } catch (error) {
        console.error("🔥 Error saat menambahkan admin:", error);
        res.status(500).json({ message: "Gagal menambahkan admin", error: error.message });
    }
};


// Mengupdate admin (Hanya superAdmin)
exports.updateAdmin = async (req, res) => {
    const { id } = req.params;
    const { username, password, role } = req.body;

    try {
        if (!username || !role) {
            return res.status(400).json({ message: "Username dan role harus diisi" });
        }

        // Cek apakah username sudah digunakan oleh admin lain
        const existingAdmin = await Admin.findOne({ username, _id: { $ne: id } });
        if (existingAdmin) {
            return res.status(400).json({ message: "Username sudah digunakan" });
        }

        // Ambil admin lama untuk mendapatkan password lama jika tidak diubah
        const adminToUpdate = await Admin.findById(id);
        if (!adminToUpdate) {
            return res.status(404).json({ message: "Admin tidak ditemukan" });
        }

        // Gunakan password lama jika tidak ada password baru
        const updatedData = {
            username,
            role,
            password: password || adminToUpdate.password, // Pakai password lama jika tidak diisi
        };

        // Perbarui admin
        const updatedAdmin = await Admin.findByIdAndUpdate(id, updatedData, { new: true });

        res.status(200).json(updatedAdmin);
    } catch (error) {
        res.status(500).json({ message: "Gagal memperbarui admin", error: error.message });
    }
};


// Menghapus admin (Hanya superAdmin)
exports.deleteAdmin = async (req, res) => {
    const { id } = req.params;
    
    try {
        await Admin.findByIdAndDelete(id);
        res.status(200).json({ message: 'Admin berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menghapus admin', error });
    }
};
