
import express from 'express';

import {
    addDepotSale,
    getAllDepotSales,
    updateDepotSale,
    deleteDepotSale,
    getMonthlyDepotSalesReport
} from '../Controllers/depotsaleController.js';

import { verifyLogin } from '../Middleware/Auth.js';

const router = express.Router();


// Add depot sale (Login required)

router.post('/add-depot-sale', verifyLogin, addDepotSale);


// Get all depot sales

router.get('/get-all-depot-sales', getAllDepotSales);


// Update depot sale (Login required)

router.put('/update-depot-sale/:id', verifyLogin, updateDepotSale);


// Delete depot sale (Login required)

router.delete('/delete-depot-sale/:id', verifyLogin, deleteDepotSale);

// Get monthly depot sales report

router.get('/get-monthly-depot-sales-report', getMonthlyDepotSalesReport);


export default router;
