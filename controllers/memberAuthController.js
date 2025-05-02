const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Member = require('../models/member');

exports.register = async (req, res) => {
    try {
        const { fullName, email, username, password, phone } = req.body;

        const existingUser = await Member.findOne({ $or: [{ email }, { username }] });
        if (existingUser) return res.status(400).json({ message: 'Email atau username sudah digunakan' });

        const newMember = new Member({ fullName, email, username, password, phone });
        await newMember.save();

        res.status(201).json({ message: 'Registrasi berhasil, menunggu persetujuan admin' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal mendaftar', error });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await Member.findOne({ username });
        if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });

        // 🔥 Cek status member
        if (user.status !== 'approved') {
            return res.status(403).json({ message: 'Akun belum disetujui oleh admin. Harap tunggu.' });
        }

        // 🔑 Cek password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Password salah' });

        // 🎫 Generate token jika login berhasil
        const token = jwt.sign({ id: user._id, role: 'member' }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.status(200).json({ message: 'Login berhasil', token, user });
    } catch (error) {
        res.status(500).json({ message: 'Gagal login', error });
    }
};
