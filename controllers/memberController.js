const Member = require('../models/member');

// endpoint untuk halaman anggota
exports.getAllMembers = async (req, res) => {
    try {
        const members = await Member.find().populate("transactionHistory");;
        res.status(200).json(members);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data anggota', error });
    }
};

// endpoint untuk halaman admin (melihat nama member berdasarkan id)
exports.getMemberSummary = async (req, res) => {
    try {
        const members = await Member.find({ status: "approved" }, '_id fullName'); // ✅ Hanya ID & Nama
        res.status(200).json(members);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil ringkasan anggota', error });
    }
};

// ✅ GET Member berdasarkan id
exports.getMemberById = async (req, res) => {
    const { id } = req.params;
    try {
        const member = await Member.findById(id).populate("transactionHistory");
        // console.log(member);
        
        if (!member) return res.status(404).json({ message: 'Anggota tidak ditemukan' });

        res.status(200).json(member);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data anggota berdasarkan id', error });
    }
};

exports.createMember = async (req, res) => {
    const { fullName, email, username, password, phone, status } = req.body;

    // Cek apakah semua field diisi
    if (!fullName || !email || !username || !password || !phone || !status) {
        return res.status(400).json({ message: "Semua field harus diisi" });
    }
    
    try {
        // Cek apakah fullName atau username sudah ada
        const existingMember = await Member.findOne({ 
            $or: [{ fullName }, { username }] 
        });

        if (existingMember) {
            return res.status(400).json({ message: "Full name atau Username sudah digunakan" });
        }

        const member = new Member({ fullName, email, username, password, phone, status });
        const savedMember = await member.save();
        res.status(201).json(savedMember);
    } catch (error) {
        res.status(500).json({ message: 'Gagal menambah anggota', error: error.message });
    }
};

exports.updateMember = async (req, res) => {
    const { id } = req.params;
    const { fullName, email, username, phone, status } = req.body;

    try {
        // Cek apakah fullName atau username sudah digunakan oleh member lain
        const existingMember = await Member.findOne({ 
            $or: [{ fullName }, { username }], 
            _id: { $ne: id } // Pastikan bukan dirinya sendiri
        });

        if (existingMember) {
            return res.status(400).json({ message: "Full name atau Username sudah digunakan" });
        }

        const updateData = { fullName, email, username, phone, status };

        // 🔥 Jika status berubah menjadi "approved", atur `approvedAt`
        if (status === "approved") {
            updateData.approvedAt = new Date();
        }

        const updatedMember = await Member.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedMember) return res.status(404).json({ message: 'Anggota tidak ditemukan' });
        res.status(200).json(updatedMember);
    } catch (error) {
        res.status(500).json({ message: 'Gagal memperbarui anggota', error: error.message });
    }
};

exports.deleteMember = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedMember = await Member.findByIdAndDelete(id);
        if (!deletedMember) return res.status(404).json({ message: 'Anggota tidak ditemukan' });

        res.status(200).json({ message: 'Anggota berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menghapus anggota', error: error.message });
    }
};

