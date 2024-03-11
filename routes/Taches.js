const express = require("express") 
const tachesRouter = express.Router()
const mysql = require("mysql2/promise")
const authMiddleware = require("../authMiddleware")


const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "bdd_project"
})


tachesRouter.get("/", authMiddleware, async(req, res) => {
    try{
        const queury = "SELECT * FROM taches WHERE id_episode IN (SELECT id_episode FROM episodes WHERE date_episode = CURDATE() + INTERVAL (6 - DAYOFWEEK(CURDATE()) + 7) % 7 DAY)"
        const [taches] = await pool.execute(queury)
        if(taches.length == 0){
            console.log("il n'existe aucune tache relié à l'épisode de cet semaine")
            res.status(404).send("il n'existe aucune tache relié à l'épisode de cet semaine")
        }else {
            console.log("success affichage des taches")
            res.status(200).send(taches)
        }
    }catch (error){
        console.log("erreur lors de l'affichage de la liste des taches de cette semaine : ", error)
        res.status(500).send("erreur lors de l'affichage de la liste des taches de cette semaine : ", error)
    }
})


tachesRouter.post("/", authMiddleware, async (req, res) => {
    try{
        const {id_employee, name_tache, etat} = req.body
        const queury = "SELECT id_episode FROM episodes WHERE date_episode = CURDATE() + INTERVAL (6 - DAYOFWEEK(CURDATE()) + 7) % 7 DAY"
        const [episode] = await pool.execute(queury)
        const queury2 = "INSERT INTO taches (etat_tache, description_tache, id_episode, id_collab) VALUES (?, ?, ?, ?)"
        const values = [etat, name_tache, episode[0].id_episode, id_employee]
        console.log(values)
        await pool.execute(queury2, values)
        console.log("success ajout tache")
        res.status(200).send("success ajout tache")
    }catch (error) {
        console.log("erreur lors de l'ajout d'une tache : ", error)
        res.status(500).send("erreur lors de l'ajout d'une tache : ", error)
    }
})


tachesRouter.post("/editEtat/:id", authMiddleware, async(req, res) => {
    try{
        const queury = "UPDATE taches SET etat_tache = ? WHERE id_tache =  ?"
        const values = [req.body.etat, req.params.id]
        await pool.execute(queury, values)
        console.log("success update etat tache")
        res.status(200).send("success update etat tache")
    }catch (error){
        console.log("erreur lors de l'update de l'etat de la tache' : ", error)
        res.status(500).send("erreur lors de l'update de l'etat de la tache' : ", error)
    }
})

module.exports = tachesRouter