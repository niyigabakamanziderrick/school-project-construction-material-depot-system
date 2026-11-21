
import db from "../Config/db.js";


// 1. ADD DEPOT SALE

export const addDepotSale = async (req, res) => {
    let connection;

    try {
        const { BuildingMaterialCode, QuantitySold } = req.body;

        const quantity = Number(QuantitySold);

        // Check required fields

        if (
            !BuildingMaterialCode ||
            QuantitySold === undefined ||
            QuantitySold === null ||
            QuantitySold === "" ||
            !Number.isInteger(quantity) ||
            quantity <= 0
        ) {
            return res.status(400).json({
                message: "Please provide a valid BuildingMaterialCode and QuantitySold."
            });
        }

        // Get database connection

        connection = await db.getConnection();

        // Start transaction

        await connection.beginTransaction();

        // Check building material and lock its row

        const [buildingMaterials] = await connection.execute(
            `SELECT BuildingMaterialCode, UnitPrice, QuantityInStock
             FROM BuildingMaterial
             WHERE BuildingMaterialCode = ?
             FOR UPDATE`,
            [BuildingMaterialCode]
        );

        if (buildingMaterials.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                message: "Building material not found."
            });
        }

        const buildingMaterial = buildingMaterials[0];

        // Check available stock

        if (buildingMaterial.QuantityInStock < quantity) {
            await connection.rollback();

            return res.status(400).json({
                message: "Insufficient stock.",
                AvailableStock: buildingMaterial.QuantityInStock,
                RequestedQuantity: quantity
            });
        }

        // Calculate total amount

        const UnitPrice = Number(buildingMaterial.UnitPrice);

        const TotalAmount = Number(
            (UnitPrice * quantity).toFixed(2)
        );

        // Insert depot sale

        const [result] = await connection.execute(
            `INSERT INTO DepotSale
            (BuildingMaterialCode, QuantitySold, TotalAmount)
            VALUES (?, ?, ?)`,
            [BuildingMaterialCode, quantity, TotalAmount]
        );

        // Reduce building material stock

        await connection.execute(
            `UPDATE BuildingMaterial
             SET QuantityInStock = QuantityInStock - ?
             WHERE BuildingMaterialCode = ?`,
            [quantity, BuildingMaterialCode]
        );

        // Commit transaction

        await connection.commit();

        return res.status(201).json({
            message: "Depot sale recorded successfully.",
            DepotSaleNumber: result.insertId,
            BuildingMaterialCode,
            QuantitySold: quantity,
            UnitPrice,
            TotalAmount,
            RemainingStock: buildingMaterial.QuantityInStock - quantity
        });

    } catch (error) {
        if (connection) {
            try {
                await connection.rollback();
            } catch (rollbackError) {
                console.error("Rollback error:", rollbackError);
            }
        }

        console.error("Error recording depot sale:", error);

        return res.status(500).json({
            message: "Internal server error."
        });

    } finally {
        if (connection) {
            connection.release();
        }
    }
};










// 2. READ ALL DEPOT SALES

export const getAllDepotSales = async (req, res) => {
    try {
        const sql = `
            SELECT *
            FROM DepotSale
            ORDER BY DepotSaleNumber DESC
        `;

        const [depotSales] = await db.execute(sql);

        return res.status(200).json(depotSales);

    } catch (error) {
        console.error("Error retrieving depot sales:", error);

        return res.status(500).json({
            message: "Internal server error."
        });
    }
};








// 3. UPDATE DEPOT SALE

export const updateDepotSale = async (req, res) => {
    let connection;

    try {
        const { BuildingMaterialCode, QuantitySold } = req.body;

        const { id } = req.params;

        const quantity = Number(QuantitySold);
        const saleNumber = Number(id);

        // Check required fields

        if (
            !BuildingMaterialCode ||
            QuantitySold === undefined ||
            QuantitySold === null ||
            QuantitySold === "" ||
            !Number.isInteger(quantity) ||
            quantity <= 0 ||
            !Number.isInteger(saleNumber) ||
            saleNumber <= 0
        ) {
            return res.status(400).json({
                message: "Please provide a valid DepotSaleNumber, BuildingMaterialCode and QuantitySold."
            });
        }

        // Get database connection

        connection = await db.getConnection();

        // Start transaction

        await connection.beginTransaction();

        // Find the sale and lock its row

        const [depotSales] = await connection.execute(
            `SELECT DepotSaleNumber, BuildingMaterialCode, QuantitySold, TotalAmount
             FROM DepotSale
             WHERE DepotSaleNumber = ?
             FOR UPDATE`,
            [saleNumber]
        );

        if (depotSales.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                message: "Depot sale not found."
            });
        }

        const oldSale = depotSales[0];

        // Collect old and new material codes

        const materialCodes = [
            ...new Set([
                oldSale.BuildingMaterialCode,
                BuildingMaterialCode
            ])
        ].sort();

        // Lock the involved building materials in a consistent order

        const materials = {};

        for (const code of materialCodes) {
            const [rows] = await connection.execute(
                `SELECT BuildingMaterialCode, UnitPrice, QuantityInStock
                 FROM BuildingMaterial
                 WHERE BuildingMaterialCode = ?
                 FOR UPDATE`,
                [code]
            );

            if (rows.length === 0) {
                await connection.rollback();

                return res.status(404).json({
                    message: "Building material not found."
                });
            }

            materials[code] = rows[0];
        }

        const oldMaterial = materials[oldSale.BuildingMaterialCode];
        const newMaterial = materials[BuildingMaterialCode];

        // Calculate stock available for the updated sale

        // Restore the old quantity before checking the new quantity

        const availableStock =
            newMaterial.QuantityInStock +
            (oldSale.BuildingMaterialCode === BuildingMaterialCode
                ? oldSale.QuantitySold
                : 0);

        // Check whether the new quantity is available

        if (availableStock < quantity) {
            await connection.rollback();

            return res.status(400).json({
                message: "Insufficient stock for the updated sale.",
                AvailableStock: availableStock,
                RequestedQuantity: quantity
            });
        }

        // Calculate new total amount using the new material's price

        const UnitPrice = Number(newMaterial.UnitPrice);

        const TotalAmount = Number(
            (UnitPrice * quantity).toFixed(2)
        );

        // Restore the old sale quantity to its material stock

        await connection.execute(
            `UPDATE BuildingMaterial
             SET QuantityInStock = QuantityInStock + ?
             WHERE BuildingMaterialCode = ?`,
            [oldSale.QuantitySold, oldSale.BuildingMaterialCode]
        );

        // Deduct the new sale quantity from the new material stock

        await connection.execute(
            `UPDATE BuildingMaterial
             SET QuantityInStock = QuantityInStock - ?
             WHERE BuildingMaterialCode = ?`,
            [quantity, BuildingMaterialCode]
        );

        // Update the sale record

        await connection.execute(
            `UPDATE DepotSale
             SET BuildingMaterialCode = ?,
                 QuantitySold = ?,
                 TotalAmount = ?
             WHERE DepotSaleNumber = ?`,
            [
                BuildingMaterialCode,
                quantity,
                TotalAmount,
                saleNumber
            ]
        );

        // Commit transaction

        await connection.commit();

        return res.status(200).json({
            message: "Depot sale updated successfully.",
            DepotSaleNumber: saleNumber,
            BuildingMaterialCode,
            QuantitySold: quantity,
            UnitPrice,
            TotalAmount,
            RemainingStock: availableStock - quantity
        });

    } catch (error) {
        if (connection) {
            try {
                await connection.rollback();
            } catch (rollbackError) {
                console.error("Rollback error:", rollbackError);
            }
        }

        console.error("Error updating depot sale:", error);

        return res.status(500).json({
            message: "Internal server error."
        });

    } finally {
        if (connection) {
            connection.release();
        }
    }
};










// 4. DELETE DEPOT SALE


export const deleteDepotSale = async (req, res) => {
    let connection;

    try {
        const { id } = req.params;

        const saleNumber = Number(id);

        // Validate depot sale number

        if (!Number.isInteger(saleNumber) || saleNumber <= 0) {
            return res.status(400).json({
                message: "Please provide a valid DepotSaleNumber."
            });
        }

        // Get database connection
        
        connection = await db.getConnection();

        // Start transaction

        await connection.beginTransaction();

        // Find sale and lock its row

        const [depotSales] = await connection.execute(
            `SELECT DepotSaleNumber, BuildingMaterialCode, QuantitySold
             FROM DepotSale
             WHERE DepotSaleNumber = ?
             FOR UPDATE`,
            [saleNumber]
        );

        if (depotSales.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                message: "Depot sale not found."
            });
        }

        const depotSale = depotSales[0];

        // Lock the building material

        const [buildingMaterials] = await connection.execute(
            `SELECT BuildingMaterialCode, QuantityInStock
             FROM BuildingMaterial
             WHERE BuildingMaterialCode = ?
             FOR UPDATE`,
            [depotSale.BuildingMaterialCode]
        );

        if (buildingMaterials.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                message: "Building material associated with this sale not found."
            });
        }

        // Restore sold quantity to stock

        await connection.execute(
            `UPDATE BuildingMaterial
             SET QuantityInStock = QuantityInStock + ?
             WHERE BuildingMaterialCode = ?`,
            [
                depotSale.QuantitySold,
                depotSale.BuildingMaterialCode
            ]
        );

        // Delete the sale record

        await connection.execute(
            `DELETE FROM DepotSale
             WHERE DepotSaleNumber = ?`,
            [saleNumber]
        );

        // Commit transaction

        await connection.commit();

        return res.status(200).json({
            message: "Depot sale deleted successfully.",
            DepotSaleNumber: saleNumber,
            BuildingMaterialCode: depotSale.BuildingMaterialCode,
            RestoredQuantity: depotSale.QuantitySold
        });

    } catch (error) {
        if (connection) {
            try {
                await connection.rollback();
            } catch (rollbackError) {
                console.error("Rollback error:", rollbackError);
            }
        }

        console.error("Error deleting depot sale:", error);

        return res.status(500).json({
            message: "Internal server error."
        });

    } finally {
        if (connection) {
            connection.release();
        }
    }
};





















// Generate Monthly Depot Sales Report

export const getMonthlyDepotSalesReport = async (req, res) => {
    try {

        // Get year and month from the URL
        
        const year = req.query.year;
        const month = req.query.month;

        // Check if year and month are provided

        if (!year || !month) {
            return res.status(400).json({
                message: "Please provide year and month."
            });
        }

        // SQL query to generate the report

        const sql = `
            SELECT
                BuildingMaterial.BuildingMaterialName,
                BuildingCategory.BuildingCategoryName,
                SUM(DepotSale.QuantitySold) AS QuantitySold,
                SUM(DepotSale.TotalAmount) AS TotalAmount
            FROM DepotSale
            JOIN BuildingMaterial
                ON DepotSale.BuildingMaterialCode = BuildingMaterial.BuildingMaterialCode
            JOIN BuildingCategory
                ON BuildingMaterial.BuildingCategoryCode = BuildingCategory.BuildingCategoryCode
            WHERE YEAR(DepotSale.DepotSaleDate) = ?
            AND MONTH(DepotSale.DepotSaleDate) = ?
            GROUP BY
                BuildingMaterial.BuildingMaterialCode,
                BuildingMaterial.BuildingMaterialName,
                BuildingCategory.BuildingCategoryName
        `;

        // Execute the query

        const [report] = await db.execute(sql, [year, month]);

        // Return the report

        return res.status(200).json({
            message: "Monthly sales report generated successfully.",
            report: report
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            message: "Internal server error."
        });
    }
};














