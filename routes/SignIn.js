require("dotenv").config()
const express = require("express")
const signInRouter = express.Router()
const jwt = require("jsonwebtoken")
const crypto = require("crypto")
const mysql = require("mysql2/promise")


const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "bdd_project"
})


signInRouter.post("/", async (req, res) => {
    try{
        const queury  = "SELECT * FROM utilisateur WHERE email = ?"
        const  values = [req.body.email]
        const [user] = await pool.execute(queury, values)
        if(!user){
            console.log("aucun user n'est relié à cet email")
            res.status(404).send("aucun user n'est relié à cet email")
        }else{
            const hashedPassword = crypto.createHash('sha256').update(req.body.password).digest('hex');
            if(user[0].mot_de_passe == hashedPassword){
                const token = jwt.sign({user : user[0]}, process.env.SECRET, {expiresIn : "7d"})
                console.log("Success sign in")
                res.status(200).send(token)
            }else{
                console.log("mot de passe incorrect")
                res.status(404).send("mot de passe incorrect")
            }
        }
    }catch (error) {
        console.log("erreur lors du sign in : ", error)
        res.status(500).send("erreur lors du sign in : ", error)
    }
})

module.exports = signInRouter
