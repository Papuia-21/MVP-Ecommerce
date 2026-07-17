import express from "express"
import jwt from "jsonwebtoken"
import connection from "../connection.js"

const SECRET = "ACMEINTERN"

var authRouter = express.Router()

export default authRouter

authRouter.post("/signup", async (req, res) => {

    console.log("From UI=", req.body)

    /* let username = req.body.username
    let password = req.body.password
    let role = req.body.role */

    const { username, password, role } = req.body

    try {
        await connection.query("insert into users(username,password,role) values(?,?,?)", [username, password, role])
        res.status(201).json({ error: false, message: "Signup Success" })
    }
    catch (exception) {
        console.log("Signup Exception=", exception)
        res.status(500).json({ error: true, message: "Sometings went wrong" })
    }

    //res.send("Signup Works")
})

authRouter.post("/login", async (req, res) => {

    console.log("From client:", req.body)
    const { username, password } = req.body

    try {
        const sqlResult = await connection.query("select userid,username,role from users where username=? and password=?", [username, password])

        console.log("SQL result=", sqlResult)

        if(sqlResult[0].length==0){
            res.status(404).json({ error: true, message: "Invalid Credentials" })
            return
        }

        const token = jwt.sign(sqlResult[0][0],SECRET,{
            expiresIn:"1h"
        })
        console.log(token)

        res.status(200).json({ error: false, message: "Login Success",token,data:sqlResult[0][0]})
        
    }

    catch(exception){
        console.log("Login Exception=", exception)
        res.status(500).json({ error: true, message: "Sometings went wrong" })
    }

    //res.send("Login Works")
})

authRouter.get("/list", async (req,res)=>{

    //Authguard Layer

    const token = req.headers.authorization
    let decodedPayload = null;

    try {
        decodedPayload = jwt.verify(token,SECRET)
    } catch (exception) {
        console.log("Unauthorized Token")
        res.status(401).json({ error: true, message: "Unauthorized" })
    }
    if(decodedPayload==null){
        return
    }

    try{
        const sqlResult=await connection.query("select userid,username,role,created_date from users",[])
        res.status(200).json({error:false,message:"Users Reterived Successfully!",data:sqlResult[0]})
    }

    catch(exception){
        console.log("Login Exception=", exception)
        res.status(500).json({ error: true, message: "Sometings went wrong" })
    }

})

export function authGuard(req,res){
    const token = req.headers.authorization
    let decodedPayload = null;

    try {
        decodedPayload = jwt.verify(token,SECRET)
        req.user=decodedPayload
    } catch (exception) {
        console.log("Unauthorized Token")
        res.status(401).json({ error: true, message: "Unauthorized" })
        return null
    }
    
    return decodedPayload
    
}