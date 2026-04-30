import { ApiError } from "../utils/api-error-handle.js";
import { db } from "../libs/db.js";
import { AsyncHandler } from "../utils/api-async-handler.js";
import jwt from 'jsonwebtoken'

const checkLogin = AsyncHandler(async (req, res, next) => {
    const token = req.cookies.ACCESS_TOKEN;    

    if(!token) {
        throw new ApiError(401, "Token expired, Please Login again.")
    }

    const data = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

    const user = await db.user.findUnique({
        where:{
            id:data.id
        },
        select:{
            id:true,
            username:true,
            name:true,
            email:true,
            image:true,
            role:true,
            isVarified:true,
            createdAt:true,
            updatedAt:true,
        }
    })

    if(!user) {
        throw new ApiError(404, "User not found or token expired. Please login again")
    }
    
    req.user = await user;
    next()
})

const checkAdmin = async (req, res, next) => {
    try {        
        const userId = req.user.id
        const user = await db.user.findUnique({
            where:{id:userId},
            select:{
                role:true
            }
        })

        if(!user || user.role !== "ADMIN") {
            throw new ApiError(403, "Access denied, Admins only")
        }

        next()

    } catch (error) {
        console.log(error);    
    }
}

export {checkLogin, checkAdmin}