import express from 'express';
import { getAllSubmission, getAllSubmissionByProblemId, getSubmissionById, getSubmissionCountById } from '../controllers/submission.controller.js';
import { checkLogin } from '../middleware/login.middleware.js'; // Middleware to check if user is logged in

const app = express.Router();   


app.use(checkLogin); // Middleware to check if user is logged in

app.get("/get-all-submissions", getAllSubmission);
app.get("/get-submissions/:problemId", getAllSubmissionByProblemId);
app.get("/get-submission/:submissionId", getSubmissionById);
app.get("/get-submission-count/:problemId", getSubmissionCountById);

export default app;