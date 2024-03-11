const express = require("express") 
const episodesRouter = express.Router()
const mysql = require("mysql2/promise")
const authMiddleware = require("../authMiddleware")


const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "bdd_project"
})


episodesRouter.get("/",authMiddleware, async(req, res) => {
    try{
        const queury = "SELECT * FROM episodes"
        const [episodes] = await pool.execute(queury)
        if(episodes.length == 0){
            console.log("il n'existe aucun episode")
            res.status(404).send("il n'existe aucun episode")
        }else {
            console.log("success get epsiode")
            res.status(200).send(episodes)
        }
    }catch (error) {
        console.log("erreur lors du get de episodes : ", error)
        res.status(500).send("erreur lors du get de episodes : ", error)
    }
})

 
episodesRouter.get("/:id", authMiddleware, async(req, res) => {
    try{
        // initialisation de la data à envoyer au front
        const data = {
            date : null,
            edition :  "",
            diffusions : [null],
            participants : [null],
            phase1 : null,
            phase2 : null,
            phase3 : null
        }
        // initialiser les phases
        const phase1 = {
            name : "",
            theme : "",
            question1 : "",
            reponse1 : "",
            question2: "",
            reponse2: "",
            question3: "",
            reponse3 : ""
        }
        const phase2 = {
            name : "",
            theme : "",
            question1 : "",
            reponse1 : "",
            question2: "",
            reponse2: "",
            question3: "",
            reponse3 : ""
        }
        const phase3 = {
            name : "",
            theme : "",
            question1 : "",
            reponse1 : "",
            question2: "",
            reponse2: "",
            question3: "",
            reponse3 : ""
        }
        // recherche des elements de data
        const id = req.params.id
        const query = "SELECT * FROM episodes WHERE id_episode = ?"
        const values = [id]
        const [episode] = await pool.execute(query, values)
        if(episode.length == 0){
            console.log("cet episode n'existe pas")
            res.status(404).send("cet episode n'existe pas")
        }else {
            const query2 = "SELECT * FROM diffusions WHERE id_episode = ?"
            const values2 = [id]
            const [diffusions] = await pool.execute(query2, values2)
            const query3 = "SELECT * FROM condidats WHERE id_condidat IN (SELECT id_condidat FROM selections WHERE id_episode = ?) AND admit = ?"
            const values3 = [id, 'oui']
            const [participants] = await pool.execute(query3, values3)
            const query4 = "SELECT * FROM phases WHERE id_episode = ? AND type_phase = ?"
            const values4 = [id, 'Le face à face']
            const [phaseOne] = await pool.execute(query4, values4)
            // new version
            const query5 = "SELECT * FROM questions WHERE id_phase = ?"
            const values5 = [phaseOne[0].id_phase]
            const [questionsOne] = await pool.execute(query5, values5)
            const query6 = "SELECT * FROM phases WHERE id_episode = ? AND type_phase = ?"
            const values6 = [id, 'Le 4 à la suite']
            const [phaseTwo] = await pool.execute(query6, values6)
            const query7 = "SELECT * FROM questions WHERE id_phase = ?"
            const values7 = [phaseTwo[0].id_phase]
            const [questionsTwo] = await pool.execute(query7, values7)
            const query8 = "SELECT * FROM phases WHERE id_episode = ? AND type_phase = ?"
            const values8 = [id, 'Le duel']
            const [phaseThree] = await pool.execute(query8, values8)
            const query9 = "SELECT * FROM questions WHERE id_phase = ?"
            const values9 = [phaseThree[0].id_phase]
            const [questionsThree] = await pool.execute(query9, values9)
            // affectations à phase1
            phase1.name = phaseOne[0].type_phase
            phase1.theme = phaseOne[0].theme_phase
            phase1.question1 = questionsOne[0].contenu_question
            phase1.reponse1 = questionsOne[0].reponse_question
            phase1.question2 = questionsOne[1].contenu_question
            phase1.reponse2 = questionsOne[1].reponse_question
            phase1.question3 = questionsOne[2].contenu_question
            phase1.reponse3 = questionsOne[2].reponse_question
            // affectations à phase2
            phase2.name = phaseTwo[0].type_phase
            phase2.theme = phaseTwo[0].theme_phase
            phase2.question1 = questionsTwo[0].contenu_question
            phase2.reponse1 = questionsTwo[0].reponse_question
            phase2.question2 = questionsTwo[1].contenu_question
            phase2.reponse2 = questionsTwo[1].reponse_question
            phase2.question3 = questionsTwo[2].contenu_question
            phase2.reponse3 = questionsTwo[2].reponse_question
            // affectations à phase3
            phase3.name = phaseThree[0].type_phase
            phase3.theme = phaseThree[0].theme_phase
            phase3.question1 = questionsThree[0].contenu_question
            phase3.reponse1 = questionsThree[0].reponse_question
            phase3.question2 = questionsThree[1].contenu_question
            phase3.reponse2 = questionsThree[1].reponse_question
            phase3.question3 = questionsThree[2].contenu_question
            phase3.reponse3 = questionsThree[2].reponse_question
            // affectations à data
            data.date = episode[0].date
            data.edition = episode[0].edition
            data.diffusions = diffusions
            data.participants = participants
            data.phase1 = phase1
            data.phase2 = phase2
            data.phase3 = phase3
            //envoie de data au front
            console.log("success get un seul episode")
            res.status(200).send(data)
        }
    }catch (error) {
        console.log("erreur lors du get d'un seul episode : ", error)
        res.status(500).send("erreur lors du get d'un seul episode : ", error)
    }
})

 
episodesRouter.post("/", authMiddleware, async(req, res) => {
    try{
       const query = "UPDATE condidats SET admit = ? WHERE id_condidat = ?"
       const values = ['oui', req.body.id]
       await pool.execute(query, values)
       console.log("success modification du condidat à participant")
       res.status(200).send("success modification du condidat à participant") 
    }catch (error) {
        console.log("erreur lors du post d'ajout de participants à l'episode : ", error)
        res.status(500).send("erreur lors du post d'ajout de participants à l'episode : ", error)
    }
})

 
episodesRouter.get("/participants/:id", authMiddleware, async(req, res) => {
    try{
        const id = req.params.id
        const query = "SELECT * FROM episodes WHERE id_episode = ?"
        const values = [id]
        const [episode] = await pool.execute(query, values)
        if(episode.length == 0){
            console.log("cet episode n'existe pas")
            res.status(404).send("cet episode n'existe pas")
        }else {
            const query2 = "SELECT * FROM condidats WHERE id_condidat IN (SELECT id_condidat FROM selections WHERE id_episode = ?) AND note >= ?"
            const values2 = [id, 5]
            const [participants] = await pool.execute(query2, values2)
            if(participants.length == 0){
                console.log("il n'existe aucun condidats admis dans cet episode")
                res.status(404).send("il n'existe aucun condidats admis dans cet episode")
            }else {
                console.log("success affichage condidats admis")
                res.status(200).send(participants)
            }
        }
    }catch (error) {
        console.log("erreur lors de l'affichage des condidats de l'episode : ", error)
        res.status(500).send("erreur lors de l'affichage des condidats de l'episode : ", error)
    }
})

 
episodesRouter.post("/addEpisode", authMiddleware, async(req, res) => {
    try{
        const queury = "INSERT INTO episodes (date_episode, edition) VALUES (?, ?)"
        const values = [req.body.date_episode, req.body.edition]
        await pool.execute(queury, values)
        const query2 = "SELECT * FROM episodes WHERE date_episode = ?"
        const values2 = [req.body.date_episode]
        const [episode] = await pool.execute(query2, values2)
        const id = episode[0].id_episode
        const query3 = "INSERT INTO diffusions (chaine_diffusion, date_diffusion, id_episode) VALUES (?, ?, ?)"
        const values3 = [req.body.chaine ,req.body.date_diffusion , id]
        await pool.execute(query3, values3)
        // phase 1 
        const query4 = "INSERT INTO phases (theme_phase, type_phase, id_episode) VALUES (?, ?, ?)"
        const values4 = [req.body.theme_phase1, 'Le face à face', id]
        await pool.execute(query4, values4)
        const query5 = "SELECT * FROM phases WHERE id_episode = ? AND type_phase = ?"
        const values5 = [id, 'Le face à face']
        const [phase1] = await pool.execute(query5, values5)
        const query6 = "INSERT INTO questions (contenu_question, reponse_question, id_phase) VALUES (?, ?, ?)"
        const values6 = [req.body.question1_phase1, req.body.reponse1_phase1, phase1[0].id_phase]
        await pool.execute(query6, values6)
        const query7 = "INSERT INTO questions (contenu_question, reponse_question, id_phase) VALUES (?, ?, ?)"
        const values7 = [req.body.question2_phase1, req.body.reponse2_phase1, phase1[0].id_phase]
        await pool.execute(query7, values7)
        const query8 = "INSERT INTO questions (contenu_question, reponse_question, id_phase) VALUES (?, ?, ?)"
        const values8 = [req.body.question3_phase1, req.body.reponse3_phase1, phase1[0].id_phase]
        await pool.execute(query8, values8)
        // phase 2
        const query9 = "INSERT INTO phases (theme_phase, type_phase, id_episode) VALUES (?, ?, ?)"
        const values9 = [req.body.theme_phase1, 'Le 4 à la suite', id]
        await pool.execute(query9, values9)
        const query10 = "SELECT * FROM phases WHERE id_episode = ? AND type_phase = ?"
        const values10 = [id, 'Le 4 à la suite']
        const [phase2] = await pool.execute(query10, values10)
        const query11 = "INSERT INTO questions (contenu_question, reponse_question, id_phase) VALUES (?, ?, ?)"
        const values11 = [req.body.question1_phase2, req.body.reponse1_phase2, phase2[0].id_phase]
        await pool.execute(query11, values11)
        const query12 = "INSERT INTO questions (contenu_question, reponse_question, id_phase) VALUES (?, ?, ?)"
        const values12 = [req.body.question2_phase2, req.body.reponse2_phase2, phase2[0].id_phase]
        await pool.execute(query12, values12)
        const query13 = "INSERT INTO questions (contenu_question, reponse_question, id_phase) VALUES (?, ?, ?)"
        const values13 = [req.body.question3_phase2, req.body.reponse3_phase2, phase2[0].id_phase]
        await pool.execute(query13, values13)
        // phase 3
        const query14 = "INSERT INTO phases (theme_phase, type_phase, id_episode) VALUES (?, ?, ?)"
        const values14 = [req.body.theme_phase1, 'Le duel', id]
        await pool.execute(query14, values14)
        const query15 = "SELECT * FROM phases WHERE id_episode = ? AND type_phase = ?"
        const values15 = [id, 'Le duel']
        const [phase3] = await pool.execute(query15, values15)
        const query16 = "INSERT INTO questions (contenu_question, reponse_question, id_phase) VALUES (?, ?, ?)"
        const values16 = [req.body.question1_phase3, req.body.reponse1_phase3, phase3[0].id_phase]
        await pool.execute(query16, values16)
        const query17 = "INSERT INTO questions (contenu_question, reponse_question, id_phase) VALUES (?, ?, ?)"
        const values17 = [req.body.question2_phase3, req.body.reponse2_phase3, phase3[0].id_phase]
        await pool.execute(query17, values17)
        const query18 = "INSERT INTO questions (contenu_question, reponse_question, id_phase) VALUES (?, ?, ?)"
        const values18 = [req.body.question3_phase3, req.body.reponse3_phase3, phase3[0].id_phase]
        await pool.execute(query18, values18)
        console.log("success ajout d'un episode")
        res.status(200).send("success ajout d'un episode")
    }catch(error) {
        console.log("erreur lors de l'ajout d'un nouveau episode : ", error)
        res.status(500).send("erreur lors de l'ajout d'un nouveau episode : ", error)
    }
})


episodesRouter.post("/addDiffusion/:id", authMiddleware, async(req, res) => {
    try{
        const id = req.params.id
        const queury = "INSERT INTO diffusions (chaine_diffusion, date_diffusion, id_episode) VALUES (?, ?, ?)"
        const values = [req.body.chaine,req.body.date , id]
        await pool.execute(queury, values)
        console.log("success ajout diffusion")
        res.status(200).send("success ajout diffusion")
    }catch(error) {
        console.log("erreur lors de l'ajout d'une diffusion' à l'episode : ", error)
        res.status(500).send("erreur lors de l'ajout d'une diffusion' à l'episode : ", error)
    }
})

module.exports = episodesRouter





