import express from 'express';
import { executeCode, runCode } from '../controllers/executeCode.controller.js';
import { checkLogin } from '../middleware/login.middleware.js';

const app = express.Router();

app.use(checkLogin)

app.post('/execute-code', executeCode);
app.post('/run-code', runCode);


export default app;