
import db from "../Config/db.js";




// Add a building material

export const addBuildingMaterial = async (req, res) => {
    try {
        const {
            BuildingMaterialCode,
            BuildingMaterialName,
            UnitPrice,
            QuantityInStock,
            BuildingCategoryCode
        } = req.body;

        // Check required fields

        if (
            !BuildingMaterialCode ||
            !BuildingMaterialName ||
            UnitPrice === undefined ||
            QuantityInStock === undefined ||
            !BuildingCategoryCode
        ) {
            return res.status(400).json({
                message: "Please provide BuildingMaterialCode, BuildingMaterialName, UnitPrice, QuantityInStock and BuildingCategoryCode."
            });
        }

        // Insert building material into database

        const sql = `
            INSERT INTO BuildingMaterial
            (BuildingMaterialCode, BuildingMaterialName, UnitPrice, QuantityInStock, BuildingCategoryCode)
            VALUES (?, ?, ?, ?, ?)
        `;

        await db.execute(sql, [
            BuildingMaterialCode,
            BuildingMaterialName,
            UnitPrice,
            QuantityInStock,
            BuildingCategoryCode
        ]);

        return res.status(201).json({
            message: "Building material added successfully!",
            BuildingMaterialCode: BuildingMaterialCode
        });

    } catch (error) {
        console.error("Error adding building material:", error);

        return res.status(500).json({
            message: "Internal server error."
        });
    }
};















// Get all building materials

export const getAllBuildingMaterials = async (req, res) => {
    try {
        const [buildingMaterials] = await db.execute(
            "SELECT * FROM BuildingMaterial"
        );

        return res.status(200).json({
            message: "Building materials retrieved successfully",
            buildingMaterials: buildingMaterials
        });

    } catch (error) {
        console.error("Error retrieving building materials:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};










// Get a building material by ID

export const getBuildingMaterialById = async (req, res) => {
    try {
        const { id } = req.params;

        const [buildingMaterials] = await db.execute(
            "SELECT * FROM BuildingMaterial WHERE BuildingMaterialCode = ?",
            [id]
        );

        if (buildingMaterials.length === 0) {
            return res.status(404).json({
                message: "Building material not found"
            });
        }

        return res.status(200).json({
            message: "Building material retrieved successfully",
            buildingMaterial: buildingMaterials[0]
        });

    } catch (error) {
        console.error("Error retrieving building material:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};















// Update a building material

export const updateBuildingMaterial = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            BuildingMaterialName,
            UnitPrice,
            QuantityInStock
        } = req.body;

        // Check if building material exists

        const [buildingMaterials] = await db.execute(
            "SELECT * FROM BuildingMaterial WHERE BuildingMaterialCode = ?",
            [id]
        );

        if (buildingMaterials.length === 0) {
            return res.status(404).json({
                message: "Building material not found"
            });
        }

        // Check required fields

        if (
            !BuildingMaterialName ||
            UnitPrice === undefined ||
            UnitPrice === null ||
            QuantityInStock === undefined ||
            QuantityInStock === null
        ) {
            return res.status(400).json({
                message: "Please provide BuildingMaterialName, UnitPrice and QuantityInStock."
            });
        }

        // Update building material

        const sql = `
            UPDATE BuildingMaterial
            SET BuildingMaterialName = ?,
                UnitPrice = ?,
                QuantityInStock = ?
            WHERE BuildingMaterialCode = ?
        `;

        await db.execute(sql, [
            BuildingMaterialName,
            UnitPrice,
            QuantityInStock,
            id
        ]);

        return res.status(200).json({
            message: "Building material updated successfully"
        });

    } catch (error) {
        console.error("Error updating building material:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};










// Delete a building material

export const deleteBuildingMaterial = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if building material exists

        const [buildingMaterials] = await db.execute(
            "SELECT * FROM BuildingMaterial WHERE BuildingMaterialCode = ?",
            [id]
        );

        if (buildingMaterials.length === 0) {
            return res.status(404).json({
                message: "Building material not found"
            });
        }

        // Delete building material

        await db.execute(
            "DELETE FROM BuildingMaterial WHERE BuildingMaterialCode = ?",
            [id]
        );

        return res.status(200).json({
            message: "Building material deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting building material:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};
