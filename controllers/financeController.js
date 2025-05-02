const Finance = require('../models/finance');

// ✅ Ambil semua data keuangan
exports.getAllFinances = async (req, res) => {
    try {
        const finances = await Finance.find();
        res.status(200).json(finances);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data keuangan', error: error.message });
    }
};

// GET finance by ID
exports.getFinanceById = async (req, res) => {
    const { id } = req.params;
    try {
        const finance = await Finance.findById(id);
        if (!finance) {
            return res.status(404).json({ message: 'Data Keuangan tidak ditemukan' });
        }
        res.status(200).json(finance);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data keuangan', error });
    }
};

// ✅ Tambah data keuangan (income/expense)
exports.createFinance = async (req, res) => {
    const { type, amount, description, recordDate } = req.body;

    if (!type || !amount || !description || !recordDate) {
        return res.status(400).json({ message: "Semua field harus diisi" });
    }

    try {
        if (!['income', 'expense'].includes(type)) {
            return res.status(400).json({ message: 'Tipe transaksi harus "income" atau "expense"' });
        }

        if (amount <= 0) {
            return res.status(400).json({ message: 'Jumlah harus lebih dari 0' });
        }

        const financeRecord = new Finance({ type, amount, description, recordDate });
        const savedFinance = await financeRecord.save();

        res.status(201).json(savedFinance);
    } catch (error) {
        res.status(500).json({ message: 'Gagal menambahkan data keuangan', error: error.message });
    }
};

// ✅ Perbarui data keuangan
exports.updateFinance = async (req, res) => {
    const { id } = req.params;
    const { type, amount, description, recordDate } = req.body;

    if (!type || !amount || !description || !recordDate) {
        return res.status(400).json({ message: "Semua field harus diisi" });
    }

    try {
        if (amount <= 0) {
            return res.status(400).json({ message: 'Jumlah harus lebih dari 0' });
        }

        const updatedFinance = await Finance.findByIdAndUpdate(
            id,
            { type, amount, description, recordDate },
            { new: true }
        );

        if (!updatedFinance) {
            return res.status(404).json({ message: 'Data keuangan tidak ditemukan' });
        }

        res.status(200).json(updatedFinance);
    } catch (error) {
        res.status(500).json({ message: 'Gagal memperbarui data keuangan', error: error.message });
    }
};

// ✅ Hapus data keuangan
exports.deleteFinance = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedFinance = await Finance.findByIdAndDelete(id);

        if (!deletedFinance) {
            return res.status(404).json({ message: 'Data keuangan tidak ditemukan' });
        }

        res.status(200).json({ message: 'Data keuangan berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menghapus data keuangan', error: error.message });
    }
};
