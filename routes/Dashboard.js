const express = require("express") 
const dashboardRouter = express.Router()
const mysql = require("mysql2/promise")
const authMiddleware = require("../authMiddleware")


const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "bdd_project"
})


dashboardRouter.get("/employees", authMiddleware, async(req, res) => {
    try{
        const queury = "SELECT * FROM collaborateurs"
       const [employees] = await pool.execute(queury)
       if(employees.length == 0){
        console.log("il n'exitste aucun employés")
        res.status(404).send("il n'exitste aucun employés")
       } else {
        console.log("success affichage employees")
        res.status(200).send(employees)
       }
    }catch (error) {
        console.log("erreur lors de l'affichage de la liste des employées : ", error)
        res.status(500).send("erreur lors de l'affichage de la liste des employées : ", error)
    }
})


dashboardRouter.get("/nbrEpisodes", authMiddleware, async(req, res) => {
    try{
        const queury = "SELECT COUNT(*) FROM episodes"
        const [nbr] = await pool.execute(queury)
        console.log("success affichage nbr episodes")
        res.status(200).send(nbr[0])
    }catch (error){
        console.log("erreur lors de l'affichage du nombre total d'episodes : ", error)
        res.status(500).send("erreur lors de l'affichage du nombre total d'episodes : ", error)
    }
})


dashboardRouter.get("/nbrCondidats", authMiddleware, async(req, res) => {
    try{
        const queury = "SELECT COUNT(*) FROM condidats"
        const [nbr] = await pool.execute(queury)
        console.log("success affichage nbr condidats")
        res.status(200).send(nbr[0])
    }catch (error){
        console.log("erreur lors de l'affichage du nombre total de condidats : ", error)
        res.status(500).send("erreur lors de l'affichage du nombre total de condidats : ", error)
    }
})


dashboardRouter.get("/nbrAdmits", authMiddleware, async(req, res) => {
    try{
        const queury = "SELECT COUNT(*) FROM condidats WHERE admit = 'oui'"
        const [nbr] = await pool.execute(queury)
        console.log("success affichage nbr admits")
        res.status(200).send(nbr[0])
    }catch (error){
        console.log("erreur lors de l'affichage du nombre total d'admits : ", error)
        res.status(500).send("erreur lors de l'affichage du nombre total d'admits : ", error)
    }
})


dashboardRouter.get("/tasksGraph", authMiddleware, async(req, res) => {
    try{
        const queury = "SELECT etat_tache, COUNT(*) as taches_count FROM taches GROUP BY etat_tache"
        const [arr] = await pool.execute(queury)
        console.log("success get du graph de taches")
        res.status(200).send(arr)
    }catch (error){
        console.log("erreur lors du get du graph de taches : ", error)
        res.status(500).send("erreur lors du get du graph de taches : ", error)
    }
})


dashboardRouter.get("/editionGraph", authMiddleware, async(req, res) => {
    try{
        const queury = "SELECT edition, COUNT(*) as episode_count FROM episodes GROUP BY edition"
        const [arr] = await pool.execute(queury)
        console.log("success get du graph de edition")
        res.status(200).send(arr)
    }catch (error){
        console.log("erreur lors du get du graph de edition : ", error)
        res.status(500).send("erreur lors du get du graph de edition : ", error)
    }
})


// display the date of the next friday
dashboardRouter.get("/lastFriday", authMiddleware, async(req, res) => {
    try{
        const query = "SELECT CURDATE() + INTERVAL (6 - DAYOFWEEK(CURDATE()) + 7) % 7 DAY AS next_friday"
        const [date] = await pool.execute(query)
        const originalDate = new Date(date[0].next_friday)
        const formatedDate = originalDate.toISOString().split('T')[0]
        console.log(formatedDate)
        res.status(200).send(formatedDate)
    }catch (error) {
        console.log("erreur lors du get du dernier vendredi : ", error)
        res.status(500).send("erreur lors du get du dernier vendredi : ", error)
    }
})

        // checked
// add employee
// nom + prenom + email + num_tel + role
dashboardRouter.post("/", authMiddleware, async (req, res) => {
    try{
        const {nom, prenom, email, num_tel, role} = req.body
        const queury = "INSERT INTO collaborateurs (nom_collab, prenom_collab, num_tel_collab, email_collab, role_collab) VALUES (?, ?, ?, ?, ?)"
        const values = [nom, prenom, num_tel, email, role]
        await pool.execute(queury, values)
        console.log("success ajout collaborateur")
        res.status(200).send("success ajout collaborateur")
    }catch (error) {
        console.log("erreur lors de l'ajout d'un collaborateur : ", error)
        res.status(500).send("erreur lors de l'ajout d'un collaborateur : ", error)
    }
})


module.exports = dashboardRouter