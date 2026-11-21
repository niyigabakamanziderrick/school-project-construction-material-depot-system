
import express from 'express';

import {
    addBuildingCategory,
    getAllBuildingCategories,
    getBuildingCategoryById,
    updateBuildingCategory,
    deleteBuildingCategory
} from '../Controllers/buildingcategoryController.js';

import { verifyLogin } from '../Middleware/Auth.js';

const router = express.Router();


// Add building category (Login required)

router.post('/add-building-category', verifyLogin, addBuildingCategory);


// Get all building categories

router.get('/get-all-building-categories', getAllBuildingCategories);


// Get a building category by ID

router.get('/get-building-category-by-id/:id', getBuildingCategoryById);


// Update building category (Login required)

router.put('/update-building-category/:id', verifyLogin, updateBuildingCategory);


// Delete building category (Login required)

router.delete('/delete-building-category/:id', verifyLogin, deleteBuildingCategory);


export default router;
