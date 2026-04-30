import express from 'express'
import { changePassword, changeUserDetail, check, forgotPasswordRequest, getMyProfile, login, logout, register, resendVarificationUrl, resetPassword, verifyEmail } from '../controllers/auth.controller.js';
import { singleImage } from '../middleware/multer.middleware.js';
import { checkLogin } from '../middleware/login.middleware.js';

const app = express.Router()


app.post("/register", singleImage, register);
app.post("/login", login)
app.get("/verify-email/:id", verifyEmail)
app.post("/resend-verify-email", resendVarificationUrl)

app.post("/reset-password-request", forgotPasswordRequest)
app.post("/reset-password/:id", resetPassword)

app.use(checkLogin)

app.post("/change-password", changePassword)
app.post("/change-user-detail", singleImage, changeUserDetail)
app.delete("/logout", logout)
app.get("/get-my-profile", getMyProfile)
app.get("/check", check)




export default app;
