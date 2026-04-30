import bcrypt from "bcryptjs"
import crypto from 'crypto'
import jwt from "jsonwebtoken"
import { userRole } from "../generated/prisma/index.js"
import { db } from "../libs/db.js"
import { AsyncHandler } from "../utils/api-async-handler.js"
import { ApiError } from "../utils/api-error-handle.js"
import { ApiResponse } from "../utils/api-response.js"
import { uploadToCloudinary } from "../utils/api-upload-handler.js"
import { emailVerificationMailgenContent, forgotPasswordMailgenContent, sendEmail } from "../utils/send-mail.js"


const generateAccessAndRefereshToken = (email, id) => {
    const refreshToken = jwt.sign(
        { id },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )

    const accessToken = jwt.sign(
        {
            id,
            email
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )


    return { refreshToken, accessToken }
}

const generateTemporaryToken = () => {
    const unHashedToken = crypto.randomBytes(10).toString("hex")
    const hashedToken = crypto.createHash("sha256").update(unHashedToken).digest("hex")
    const tokenExpiry = Date.now() + (20 * 60 * 1000);

    return { hashedToken, unHashedToken, tokenExpiry }
}

const register = AsyncHandler(async (req, res) => {

    const file = req.file;
    const { email, password, name, username } = req.body

    if (!file) {
        throw new ApiError(404, "Please upload Avtar image.")
    }
    if (!(email && password && username)) {
        throw new ApiError(404, "Please enter all creadintials.")
    }

    const existingUser = await db.user.findFirst({
        where: {
            OR: [
                { email },
                { username }
            ]
        }
    })

    if (existingUser) {
        throw new ApiError(400, "User already exists.")
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { hashedToken, unHashedToken, tokenExpiry } = generateTemporaryToken()

    const emailVarificationTokenExpiry = new Date(tokenExpiry)

    const avatar = await uploadToCloudinary(file)

    const user = await db.user.create({
        data: {
            email,
            password: hashedPassword,
            name,
            username,
            image: avatar.url,
            role: userRole.USER,
            emailvarificationToken: hashedToken,
            emailVarificationTokenExpiry
        }
    })

    const newUser = await db.user.findUnique({
        where: {
            id: user.id
        },
        select: {
            id: true,
            email: true,
            name: true,
            username: true,
            image: true,
            role: true,
            isVarified: true,
            createdAt: true,
            updatedAt: true
        }
    })

    if (!newUser) {
        throw new ApiError(404, "Some internal error, User not created.")
    }

    const varificationUrl = `${process.env.CLIENT_URL}/verify-email/${unHashedToken}`
    const mailgenContent = emailVerificationMailgenContent(username, varificationUrl);

    sendEmail({
        mailgenContent,
        email,
        subject: "For User Varification"
    })

    return res.status(200).json(new ApiResponse(200, newUser, "User created sucessfully."))

})

const verifyEmail = AsyncHandler(async (req, res) => {
    const token = req.params.id
    if (!token) {
        throw new ApiError(400, "Token expired resend varification email.")
    }
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex")
    const existingUser = await db.user.findFirst({
        where: {
            emailvarificationToken: hashedToken
        }
    })

    if (!existingUser) {
        throw new ApiError(404, "Cannot find user or token expired.")
    }

    const updatedUser = await db.user.update({
        where: {
            id: existingUser.id
        },
        data: {
            isVarified: true,
            emailvarificationToken: "",
            emailVarificationTokenExpiry: null
        },
        select: {
            id: true,
            email: true,
            name: true,
            username: true,
            image: true,
            role: true,
            isVarified: true,
            createdAt: true,
            updatedAt: true
        }
    })

    res.status(200).json(new ApiResponse(200, updatedUser, "User varified sucessfully."))
})

const resendVarificationUrl = AsyncHandler(async (req, res) => {
    const { email, username } = req.body

    if (!(email || username)) {
        throw new ApiError(404, "Email or username must be required.")
    }
    const { hashedToken, unHashedToken, tokenExpiry } = generateTemporaryToken()
    const emailVarificationTokenExpiry = new Date(tokenExpiry)

    const existingUser = await db.user.findFirst({
        where: {
            OR: [
                { email },
                { username }
            ]
        },
    })

    if (!existingUser) {
        throw new ApiError(404, "User not found with this email")
    }

    const updatedUser = await db.user.update({
        where: {
            id: existingUser.id
        },
        data: {
            emailvarificationToken: hashedToken,
            emailVarificationTokenExpiry
        }
    })


    const varificationUrl = `${process.env.CLIENT_URL}/verify-email/${unHashedToken}`
    const mailgenContent = emailVerificationMailgenContent(existingUser.username, varificationUrl);

    await sendEmail({
        mailgenContent,
        email: existingUser.email,
        subject: "For User Varification"
    })

    res.status(200).json(new ApiResponse(200, {}, "Resend mail send sucessfully."))
})

const login = AsyncHandler(async (req, res) => {
    const { email, username, name, password } = req.body;

    if (!((email || username) && password)) {
        throw new ApiError(404, "Please enter all creadentials.")
    }

    const user = await db.user.findFirst({
        where: {
            OR: [
                { email },
                { username }
            ]
        }
    })

    if (!user) {
        throw new ApiError(401, "User not found with this email.")
    }

    if (!user.isVarified) {
        throw new ApiError(401, "Please verify account then login Again.")
    }

    const isMatched = await bcrypt.compare(password, user.password)

    if (!isMatched) {
        throw new ApiError(401, "Invalid creadintials.")
    }

    const { refreshToken, accessToken } = generateAccessAndRefereshToken(user.email, user.id)
    const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    const updatedUser = await db.user.update({
        where: { id: user.id },
        data: {
            refreshToken,
            refreshTokenExpiry
        },
        select: {
            id: true,
            email: true,
            name: true,
            username: true,
            image: true,
            role: true,
            isVarified: true,
            createdAt: true,
            updatedAt: true
        }
    })

    res.cookie("ACCESS_TOKEN", accessToken, {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV !== "development",
        maxAge: 7 * 24 * 60 * 60 * 1000  // 7 Days
    })

    return res.status(200).json(new ApiResponse(200, updatedUser, "User login sucessfully."))
})

const forgotPasswordRequest = AsyncHandler(async (req, res) => {
    const { email, username } = req.body

    if (!(email || username)) {
        throw new ApiError(404, "Please enter email or username.")
    }

    const user = await db.user.findFirst({
        where: {
            OR: [
                { email },
                { username }
            ]
        }
    })

    if (!user) {
        throw new ApiError(401, "User not found with this email.")
    }

    const { hashedToken, unHashedToken, tokenExpiry } = generateTemporaryToken()

    const passwordResetUrl = `${process.env.CLIENT_URL}/reset-password/${unHashedToken}`
    const mailgenContent = await forgotPasswordMailgenContent(user.username, passwordResetUrl);
    const forgotPasswordTokenExpiry = new Date(tokenExpiry);

    await sendEmail({
        mailgenContent,
        email: user.email,
        subject: "For reset password."
    })

    const updatedUser = await db.user.update({
        where: { id: user.id },
        data: {
            forgotPasswordToken: hashedToken,
            forgotPasswordTokenExpiry
        }
    })


    res.status(200).json(new ApiResponse(200, {
        data: {
            name: updatedUser.name,
            email: updatedUser.email,
            username: updatedUser.username,
            forgotPasswordTokenExpiry: updatedUser.forgotPasswordTokenExpiry
        }
    }, "Forgot password email send sucessfully."))

})

const resetPassword = AsyncHandler(async (req, res) => {
    const token = req.params.id;
    const { password } = req.body
    if (!password) {
        throw new ApiError(401, "Password must be required.")
    }

    if (!token) {
        throw new ApiError(400, "Token is expired.")
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex")
    const user = await db.user.findFirst({
        where: {
            forgotPasswordToken: hashedToken
        }
    })

    if (!user) {
        throw new ApiError(400, "User not found in db .")
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.user.update({
        where: {
            id: user.id
        },
        data: {
            password: hashedPassword,
            forgotPasswordToken:"",
            forgotPasswordTokenExpiry:null
        }
    })

    const updatedUser = await db.user.findFirst({
        where: {
            password: hashedPassword
        },
        select: {
            id: true,
            email: true,
            name: true,
            username: true,
            createdAt: true,
            updatedAt: true
        }
    })

    if (!updatedUser) {
        throw new ApiError(400, "Some internal error, password not forgot.")
    }

    res.status(200).json(new ApiResponse(200, updatedUser, "Password reset sucessfully."))
})

const changePassword = AsyncHandler(async (req, res) => {
    const { password, newPassword } = req.body

    if (!(password && newPassword)) {
        throw new ApiError(401, "Please enter old password and new password.")
    }

    const passwordInDb = await db.user.findUnique({
        where: {
            id: req.user.id
        },
        select: {
            password: true
        }
    })

    const isMatched = await bcrypt.compare(password, passwordInDb.password)

    if (!isMatched) {
        throw new ApiError(401, "Invalid crediantials")
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.user.update({
        where: {
            id: req.user.id
        },
        data: {
            password: hashedPassword
        }
    })

    const updatedUser = await db.user.findFirst({
        where: {
            password: hashedPassword
        },
        select: {
            id: true,
            email: true,
            name: true,
            username: true,
            createdAt: true,
            updatedAt: true
        }
    })

    if (!updatedUser) {
        throw new ApiError(400, "Some internal error, password not updated.")
    }

    res.status(200).json(new ApiResponse(200, updatedUser, "Password changed sucessfully."))
})

const changeUserDetail = AsyncHandler(async (req, res) => {
    const { newEmail, newUsername, newName, role } = req.body;
    const file = req.file

    if (!(newEmail || newUsername || newName || file || role)) {
        throw new ApiError(401, "Please give me detail which have update.")
    }

    let image = ""

    if (file) {
        image = await uploadToCloudinary(file)
    }
    if (newUsername) {
        const isExistedUsername = await db.user.findUnique({
            where: { username: newUsername },
            select: {
                id: true,
            }
        })

        if (isExistedUsername && isExistedUsername.id !== req.user.id) {
            throw new ApiError(401, "Username is already exists, Please enter a unique username.")
        }
    }
    if (newEmail) {
        const isExistedEmail = await db.user.findUnique({
            where: {
                email: newEmail
            },
            select: {
                id: true
            }
        })

        if (isExistedEmail && isExistedEmail.id !== req.user.id) {
            throw new ApiError(401, "Email is already exists, Enter a new email.")
        }
    }

    const updatedUser = await db.user.update({
        where: { id: req.user.id },
        data: {
            ...(newEmail && { email: newEmail }),
            ...(newUsername && { username: newUsername }),
            ...(newName && { name: newName }),
            ...(file && { image: image.url }),
            ...(role && { role })
        },
        select: {
            id: true,
            name: true,
            username: true,
            email: true,
            image: true,
            role: true,
            createdAt: true,
            updatedAt: true
        }
    })

    res.status(200).json(new ApiResponse(200, updatedUser, "User details changed sucessfully."))
})

const logout = AsyncHandler(async (req, res) => {
    await res.clearCookie("ACCESS_TOKEN", {
        httpOnly: true,
        secure: true,
        sameSite: 'strict'
    });

    await db.user.update({
        where: { id: req.user.id },
        data: {
            refreshToken: "",
            refreshTokenExpiry: null
        }
    })

    res.status(200).json(new ApiResponse(200, {}, "Logout sucessfully."))
})

const getMyProfile = AsyncHandler(async (req, res) => {

    const totalProblems = await db.problem.groupBy({
        by: ['difficulty'],
        _count: {
            _all: true
        }
    })

    const totalProblem = {
        "easy": 0,
        "medium": 0,
        "hard": 0
    }

    totalProblems.map(({ difficulty, _count }) => {
        switch (difficulty.toUpperCase()) {
            case "EASY":
                totalProblem.easy = _count._all
                break;
            case "MEDIUM":
                totalProblem.medium = _count._all
                break;
            case "HARD":
                totalProblem.hard = _count._all
                break;
        }
    })

    const allSolvedProblem = await db.user.findUnique({
        where: { id: req.user.id },
        select: {
            problemSolved: {
                select: {
                    difficulty: true
                }
            }
        }
    })

    const solvedProblem = await allSolvedProblem.problemSolved.reduce((acc, { difficulty }) => {
        const key = difficulty.toLowerCase()
        if (key === 'easy' || key === 'medium' || key === 'hard') {
            acc[key] += 1;
        }
        return acc;
    }, { easy: 0, medium: 0, hard: 0 })

    res.status(200).json(new ApiResponse(200, { ...req.user, totalProblem, solvedProblem }, "User fetched sucessfully."))
})

const check = AsyncHandler(async (req, res) => {
    if (!req.user) {
        throw new ApiError(401, "Please login to get profile")
    }
    res.status(200).json(new ApiResponse(200, req.user, "User authenticated sucessfully."))
})

export {
    changePassword,
    changeUserDetail,
    forgotPasswordRequest,
    getMyProfile,
    login,
    logout,
    register,
    resendVarificationUrl,
    resetPassword,
    verifyEmail,
    check
}
