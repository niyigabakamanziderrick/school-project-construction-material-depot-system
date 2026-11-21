
import express from 'express';

import {
    addBuildingMaterial,
    getAllBuildingMaterials,
    getBuildingMaterialById,
    updateBuildingMaterial,
    deleteBuildingMaterial
} from '../Controllers/buildingmaterialController.js';

import { verifyLogin } from '../Middleware/Auth.js';

const router = express.Router();


// Add building material (Login required)

router.post('/add-building-material', verifyLogin, addBuildingMaterial);


// Get all building materials

router.get('/get-all-building-materials', getAllBuildingMaterials);


// Get a building material by ID

router.get('/get-building-material-by-id/:id', getBuildingMaterialById);


// Update building material (Login required)

router.put('/update-building-material/:id', verifyLogin, updateBuildingMaterial);


// Delete building material (Login required)

router.delete('/delete-building-material/:id', verifyLogin, deleteBuildingMaterial);


export default router;
