const express = require('express');
const cors = require('cors');
require('dotenv').config();
require('./utils/db');

// dashboard admin
const memberRoutes = require('./routes/memberRoutes');
const adminRoutes = require('./routes/adminRoutes');
const productRoutes = require('./routes/productRoutes');
const purchaseRoutes = require('./routes/purchaseRoutes');
const saleRoutes = require('./routes/saleRoutes');
const financeRoutes = require('./routes/financeRoutes');
const reportRoutes = require('./routes/reportRoutes');
// landing page
const activityRoutes = require('./routes/landing-page/activityRoutes');
const articleRoutes = require('./routes/landing-page/articleRoutes');
const promotionRoutes = require('./routes/landing-page/promotionRoutes');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
// dashboard admin
app.use('/api/member', memberRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/product', productRoutes);
app.use('/api/purchase', purchaseRoutes);
app.use('/api/sale', saleRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/report', reportRoutes);
// landing page
app.use('/api/activities', activityRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/promotions', promotionRoutes);

// Error Handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ message: 'Something went wrong!' });
});

// Start Server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});