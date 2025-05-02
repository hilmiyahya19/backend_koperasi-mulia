const Report = require('../models/report');
const Member = require('../models/member');
const Purchase = require('../models/purchase');
const Sale = require('../models/sale');
const Product = require('../models/product');
const Finance = require('../models/finance');

// Helper function to save report
const saveReport = async (reportType, data) => {
    try {
        const report = new Report({ reportType, data });
        await report.save();
    } catch (error) {
        console.error(`Gagal menyimpan laporan ${reportType}:`, error);
    }
};

// 🔹 Fungsi untuk mengubah angka bulan menjadi nama bulan
function getMonthName(monthNumber) {
    const months = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    return months[monthNumber - 1]; // Karena bulan di MongoDB dimulai dari 1
}

exports.getMemberStats = async (req, res) => {
    try {
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);

        // 🔹 Menghitung total member dengan status "approved"
        const totalMembers = await Member.countDocuments({ status: "approved" });

        // 🔹 Mengelompokkan member berdasarkan bulan approval (approvedAt)
        const monthlyMembers = await Member.aggregate([
            { $match: { status: "approved", approvedAt: { $exists: true } } }, // Pastikan approvedAt ada
            { 
                $group: { 
                    _id: { $month: "$approvedAt" }, 
                    count: { $sum: 1 } 
                } 
            },
            { $sort: { _id: 1 } }
        ]);

        // 🔹 Konversi bulan angka ke nama bulan
        const formattedMonthlyMembers = monthlyMembers.map(member => ({
            month: getMonthName(member._id),
            count: member.count
        }));

        // 🔹 Menghitung jumlah member baru dalam 30 hari terakhir
        const newMembers = await Member.countDocuments({
            approvedAt: { $gte: thirtyDaysAgo },
            status: "approved"
        });

        const reportData = { 
            totalMembers, 
            monthlyMembers: formattedMonthlyMembers, 
            newMembers 
        };

        await saveReport("members", reportData);

        res.json(reportData);
    } catch (error) {
        res.status(500).json({ message: "Gagal mengambil statistik anggota", error });
    }
};

// 🔥 Statistik Penjualan
exports.getSalesStats = async (req, res) => {
    try {
        const totalSales = await Sale.countDocuments();
        const totalRevenue = await Sale.aggregate([
            { $group: { _id: null, revenue: { $sum: "$totalAmount" } } }
        ]);

        // 🔹 Ambil data penjualan per bulan
        const monthlySales = await Sale.aggregate([
            { 
                $group: { 
                    _id: { $month: "$saleDate" }, 
                    sales: { $sum: 1 }, 
                    revenue: { $sum: "$totalAmount" } 
                } 
            },
            { $sort: { _id: 1 } }
        ]);

        // 🔹 Konversi bulan angka ke nama bulan
        const formattedMonthlySales = monthlySales.map(sale => ({
            month: getMonthName(sale._id),
            sales: sale.sales,
            revenue: sale.revenue
        }));

        const reportData = {
            totalSales,
            totalRevenue: totalRevenue[0]?.revenue || 0,
            monthlySales: formattedMonthlySales
        };

        await saveReport("sales", reportData);
        
        res.json(reportData);
    } catch (error) {
        res.status(500).json({ message: "Gagal mengambil statistik penjualan", error });
    }
};

// Statistik Produk Terlaris
exports.getTopProducts = async (req, res) => {
    try {
        const topSellingProducts = await Sale.aggregate([
            { $unwind: "$products" },
            { $group: { _id: "$products.productId", sold: { $sum: "$products.quantity" } } },
            { $sort: { sold: -1 } },
            { $limit: 5 }
        ]);

        const products = await Product.find({ _id: { $in: topSellingProducts.map(p => p._id) } });

        const result = topSellingProducts.map(p => ({
            name: products.find(prod => prod._id.equals(p._id))?.name || "Unknown",
            sold: p.sold
        }));

        const reportData = { topSellingProducts: result };
        await saveReport("top-products", reportData);
        
        res.json(reportData);
    } catch (error) {
        res.status(500).json({ message: "Gagal mengambil statistik produk", error });
    }
};

// 🔥 Statistik Keuangan (Arus Kas & Laba Rugi)
exports.getFinanceStats = async (req, res) => {
    try {
        // 🔹 Ambil data keuangan per bulan
        const monthlyFinance = await Finance.aggregate([
            {
                $group: {
                    _id: { $month: "$recordDate" },
                    income: { $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] } },
                    expense: { $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] } }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // 🔹 Hitung total keseluruhan
        let totalIncome = 0;
        let totalExpense = 0;

        const profitLoss = monthlyFinance.map(f => {
            totalIncome += f.income;
            totalExpense += f.expense;
            return {
                month: getMonthName(f._id), // Ubah bulan angka menjadi nama bulan
                income: f.income,
                expense: f.expense,
                profit: f.income - f.expense
            };
        });

        const summary = {
            totalIncome,
            totalExpense,
            netProfit: totalIncome - totalExpense
        };

        const reportData = { summary, monthlyReport: profitLoss };
        await saveReport("finance", reportData);
        
        res.json(reportData);
    } catch (error) {
        res.status(500).json({ message: "Gagal mengambil statistik keuangan", error });
    }
};

