
import db from "../Config/db.js";


// Add a building category

export const addBuildingCategory = async (req, res) => {
    try {
        const {
            BuildingCategoryCode,
            BuildingCategoryName,
            Description
        } = req.body;

        // Check required fields

        if (!BuildingCategoryCode || !BuildingCategoryName || !Description) {
            return res.status(400).json({
                message: "Please provide BuildingCategoryCode, BuildingCategoryName and Description."
            });
        }

        // Insert building category into database

        const sql = `
            INSERT INTO BuildingCategory
            (BuildingCategoryCode, BuildingCategoryName, Description)
            VALUES (?, ?, ?)
        `;

        await db.execute(sql, [
            BuildingCategoryCode,
            BuildingCategoryName,
            Description
        ]);

        return res.status(201).json({
            message: "Building category added successfully!",
            BuildingCategoryCode: BuildingCategoryCode
        });

    } catch (error) {
        console.error("Error adding building category:", error);

        return res.status(500).json({
            message: "Internal server error."
        });
    }
};
















// Get all building categories

export const getAllBuildingCategories = async (req, res) => {
    try {
        const [buildingCategories] = await db.execute(
            "SELECT * FROM BuildingCategory"
        );

        return res.status(200).json({
            message: "Building categories retrieved successfully",
            buildingCategories: buildingCategories
        });

    } catch (error) {
        console.error("Error retrieving building categories:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};












// Get a building category by ID

export const getBuildingCategoryById = async (req, res) => {
    try {
        const { id } = req.params;

        const [buildingCategories] = await db.execute(
            "SELECT * FROM BuildingCategory WHERE BuildingCategoryCode = ?",
            [id]
        );

        if (buildingCategories.length === 0) {
            return res.status(404).json({
                message: "Building category not found"
            });
        }

        return res.status(200).json({
            message: "Building category retrieved successfully",
            buildingCategory: buildingCategories[0]
        });

    } catch (error) {
        console.error("Error retrieving building category:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};












// Update a building category

export const updateBuildingCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            BuildingCategoryName,
            Description
        } = req.body;

        // Check if building category exists

        const [buildingCategories] = await db.execute(
            "SELECT * FROM BuildingCategory WHERE BuildingCategoryCode = ?",
            [id]
        );

        if (buildingCategories.length === 0) {
            return res.status(404).json({
                message: "Building category not found"
            });
        }

        // Check required fields

        if (!BuildingCategoryName || !Description) {
            return res.status(400).json({
                message: "Please provide BuildingCategoryName and Description."
            });
        }

        // Update building category

        const sql = `
            UPDATE BuildingCategory
            SET BuildingCategoryName = ?,
                Description = ?
            WHERE BuildingCategoryCode = ?
        `;

        await db.execute(sql, [
            BuildingCategoryName,
            Description,
            id
        ]);

        return res.status(200).json({
            message: "Building category updated successfully"
        });

    } catch (error) {
        console.error("Error updating building category:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};















// Delete a building category

export const deleteBuildingCategory = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if building category exists

        const [buildingCategories] = await db.execute(
            "SELECT * FROM BuildingCategory WHERE BuildingCategoryCode = ?",
            [id]
        );

        if (buildingCategories.length === 0) {
            return res.status(404).json({
                message: "Building category not found"
            });
        }

        // Delete building category

        await db.execute(
            "DELETE FROM BuildingCategory WHERE BuildingCategoryCode = ?",
            [id]
        );

        return res.status(200).json({
            message: "Building category deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting building category:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};
