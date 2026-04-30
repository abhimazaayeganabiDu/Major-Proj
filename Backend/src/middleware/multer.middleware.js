import multer from 'multer'

export const multerUpload = multer({
    limits: 1024*1024*5
})

const singleImage = multerUpload.single("avatar")

export {singleImage};