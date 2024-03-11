const express = require("express") 
const condidatsRouter = express.Router()
const mysql = require("mysql2/promise")
const authMiddleware = require("../authMiddleware")


const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "bdd_project"
})

 
condidatsRouter.post("/", authMiddleware, async (req, res) => {
    try{
        const {nom, prenom, email, num_tel, note} = req.body
        const query = "SELECT * FROM condidats WHERE nom = ? AND prenom = ?"
        const values0 = [nom, prenom]
        const [test] = await pool.execute(query, values0)
        if(test.length == 0){
            const queury = "INSERT INTO condidats (nom_condidat, prenom_condidat, num_tel_condidat, email_condidat, note, admit) VALUES (?, ?, ?, ?, ?, ?)"
            const values = [nom, prenom, num_tel, email, note, 'non']
            await pool.execute(queury, values)
        }
        const queury2 = "SELECT * FROM condidats WHERE email_condidat = ?"
        const values2 = [email]
        const [condidat] = await pool.execute(queury2, values2)
        const id_condidat = condidat[0].id_condidat
        const queury4 = "SELECT id_episode FROM episodes WHERE date_episode = CURDATE() + INTERVAL (6 - DAYOFWEEK(CURDATE()) + 7) % 7 DAY"
        const [episode] = await pool.execute(queury4)
        console.log(episode)
        const queury3 = "INSERT INTO selections (id_episode, id_condidat) VALUES (?, ?)"
        const values3 = [episode[0].id_episode, id_condidat]
        await pool.execute(queury3, values3)
        console.log("success ajout condidats")
        res.status(200).send("success ajout condidats")
    }catch (error) {
        console.log("erreur lors de l'ajout d'un condidat : ", error)
        res.status(500).send("erreur lors de l'ajout d'un condidat : ", error)
    }
})


condidatsRouter.get("/", authMiddleware, async(req, res) => {
    const queury = "SELECT * FROM condidats WHERE id_condidat IN (SELECT id_condidat FROM selections WHERE id_episode IN (SELECT id_episode FROM episodes WHERE date_episode = CURDATE() + INTERVAL (6 - DAYOFWEEK(CURDATE()) + 7) % 7 DAY)) ORDER BY id_condidat DESC"
    const [condidats] = await pool.execute(queury)
    if(condidats.length == 0){
        console.log("il n'existe aucun participant relié à l'épisode de cet semaine")
        res.status(404).send("il n'existe aucun participant relié à l'épisode de cet semaine")
    }else {
        console.log("success affichage des condidats")
        res.status(200).send(condidats)
    }
})


module.exports = condidatsRouter