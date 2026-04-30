import express from 'express'
import { checkAdmin, checkLogin } from '../middleware/login.middleware.js';
import { createProblem, deleteProblem, getAllProblems, getAllProblemSolvedByUser, getProblemByID, updateProblem } from '../controllers/problem.controller.js';

const app = express.Router();

// check if user is logged or not
app.use(checkLogin)

app.get("/get-all-problem", getAllProblems)
app.get("/get-problem/:id", getProblemByID)
app.get("/get-solved-problem", getAllProblemSolvedByUser)

// // check user is admin or not 
app.use(checkAdmin)

app.post("/create-problem", createProblem)
app.put("/update-problem/:id", updateProblem)
app.delete("/delete-problem/:id", deleteProblem)


export default app;