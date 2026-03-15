const express = require('express');
const router = express.Router();
const Sales = require('../models/Sales');
const Medicine = require('../models/Medicine');

// ============================
// Get all sales
// ============================
router.get('/sales', async (req, res) => {
    try {
        const sales = await Sales.find().sort({ date: -1 });
        res.json(sales);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// ============================
// Create new sale
// ============================
router.post('/sales', async (req, res) => {
    try {

        const { items, totalAmount, paymentMethod, customerName, customerPhone } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        // Update medicine stock
        for (const item of items) {

            const medicine = await Medicine.findById(item.medicineId);

            if (!medicine) {
                return res.status(400).json({ message: `Medicine ${item.medicineName} not found` });
            }

            if (medicine.quantity < item.quantity) {
                return res.status(400).json({ message: `Not enough stock for ${medicine.name}` });
            }

            medicine.quantity -= item.quantity;
            await medicine.save();
        }

        // Save sale
        const sale = new Sales({
            items,
            totalAmount,
            paymentMethod,
            customerName,
            customerPhone
        });

        await sale.save();

        res.status(201).json({
            message: "Sale completed successfully",
            sale
        });

    } catch (error) {

        console.error(error);
        res.status(500).json({ message: "Server error" });

    }
});

// ============================
// Get sales by date range
// ============================
router.get('/sales/range', async (req, res) => {

    try {

        const { startDate, endDate } = req.query;

        const sales = await Sales.find({
            date: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        }).sort({ date: -1 });

        res.json(sales);

    } catch (error) {

        res.status(500).json({ message: error.message });

    }

});


// ============================
// Daily sales summary
// ============================
router.get('/sales/daily-summary', async (req, res) => {

    try {

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const sales = await Sales.find({
            date: {
                $gte: today,
                $lt: tomorrow
            }
        });

        const summary = {
            totalSales: sales.length,
            totalRevenue: sales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0),
            sales
        };

        res.json(summary);

    } catch (error) {

        res.status(500).json({ message: error.message });

    }

});

module.exports = router;
