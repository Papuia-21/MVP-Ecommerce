import { authGuard } from "./auth/auth.js";
import connection from "./connection.js";
import express from "express"

var productRouter = express.Router()
export default productRouter

productRouter.post("/add", async (req, res) => {

    //get the owner info from JWT token
    //Task : Validate this API with token from headers

    const jwtResult = authGuard(req, res)
    if (jwtResult == null) {
        return
    }
    console.log("REQ User =", req.user)

    const { name, price, detail } = req.body

    try {
        await connection.query("insert into product(name,price,detail,owner) values(?,?,?,?)", [name, price, detail, req.user.userid])
        res.status(201).json({ error: false, message: "Product added successfully!" })
    } catch (exception) {
        console.log("Product Upload Exception=", exception)
        res.status(500).json({ error: true, message: "Sometings went wrong" })
    }

})

productRouter.get("/list", async (req, res) => {

    const jwtResult = authGuard(req, res)
    if (jwtResult == null)
        return

    try {

        let sqlResult = []
        if (req.user.role.toLowerCase() == "vendor") {
            sqlResult = await connection.query("select * from product where is_active=1 and owner=?", [req.user.userid])
        }

        else if (req.user.role.toLowerCase() == "customer") {
            sqlResult = await connection.query("select * from product where is_active=1", [])
        }

        res.status(200).json({ error: false, message: "Product fetched successfully", data: sqlResult[0] })

    } catch (exception) {
        console.log("Product Listing Exception=", exception)
        res.status(500).json({ error: true, message: "Something went wrong" })
    }

})

productRouter.delete("/remove/:pid", async (req, res) => {

    const jwtResult = authGuard(req, res)
    if (jwtResult == null)
        return

    const { pid } = req.params

    try {

        await connection.query("update product set is_active=0 where pid=?", [pid])
        res.status(200).json({ error: false, message: "Product deactivated successfully" })

    } catch (exception) {
        console.log("Product delete exception", exception)
        res.status(500).json({ error: true, message: "Something went wrong" })
    }

})

productRouter.post("/buy/:pid", async (req, res) => {

    const jwtResult = authGuard(req, res)
    if (jwtResult == null)
        return

    const { pid } = req.params
    const status = "Confirmed"
    const { paymentMethod } = req.body

    try {

        const sqlResult = await connection.query(
            "SELECT price FROM product WHERE pid = ?",
            [pid]
        )

        if (sqlResult[0].length === 0) {
            return res.status(404).json({
                error: true,
                message: "Product not found"
            })
        }

        const price = sqlResult[0][0].price;

        await connection.query(
            "INSERT INTO order_item( productid, userid, price, status, payment_method,date_order) VALUES (?, ? , ?, ?, ?, NOW())",
            [pid, req.user.userid, price ,status , paymentMethod]
        )

        res.status(200).json({ error: false, message: "Product ordered successfully" })

    } catch (exception) {

        console.log("Product order exception", exception)
        res.status(500).json({ error: true, message: "Something went wrong" })

    }
})