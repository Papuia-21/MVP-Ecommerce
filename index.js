import express from "express";
import cors from "cors"
import authRouter from "./auth/auth.js";
import productRouter from "./product.js"

var app = express()

app.use(cors())

app.use(express.json())

app.use("/auth",authRouter)
app.use("/product",productRouter)

app.listen(3000)

//npm install cors