require("dotenv").config()
const express = require("express")
const app = express()
const PORT = 1000
const bodyParser = require("body-parser")
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}))
const cors = require("cors")
const mysql = require("mysql2/promise")

//linking database
const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "bdd_project"
})

async function connectToDb() {
    try{
        const connexion = await pool.getConnection()
        console.log("Connexion à la bdd réussi")
        connexion.release()
    }catch (error) {
        console.error("Erreur lors de la connexion à la base de données : ", error)
    }
}

connectToDb()

// Plus tard pour le linking
app.use(cors({
    origin: '*'
}));

app.listen(PORT, () => console.log("Listening at port : ", PORT))

const condidats = require("./routes/Condidats")
app.use("/condidats", condidats)

const dashboard = require("./routes/Dashboard")
app.use("/dashboard", dashboard)

const episodes = require("./routes/Episodes")
app.use("/episodes", episodes)

const signIn = require("./routes/SignIn")
app.use("/signIn", signIn)

const taches = require("./routes/Taches")
app.use("/taches", taches)
