const express = require('express');
const router = express.Router();
const prisma =require('../Modules/prismaClient')

router.get("/health" , async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;

        res.status(200).json({
            status: "ok",
            database: "connected",
            timeStamp: Date.now()
        });

    } catch (error) {
        res.status(500).json({
            status: "error",
            database: "disconnected",
            timeStamp: Date.now()
        });
    }
});



module.exports = router