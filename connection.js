import mysql from "mysql2/promise"

const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "acme26_mar",
    port: 3306
})

try {
    await connection.connect()
    console.log("DB connection successfully...")
} catch (exception) {
    console.log("DB Connection Error=", exception)
}

export default connection