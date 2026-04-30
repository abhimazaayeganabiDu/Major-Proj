import {v2 as cloudinary} from 'cloudinary'
import {v4 as uuid} from 'uuid'

const getBase64 = (file) => {
    return `data:${file.mimetype};base64,${file.buffer.toString("base64")}`
}


const uploadToCloudinary = async (file) => {
    try {
        const result = await cloudinary.uploader.upload(
            getBase64(file),
            {
                resource_type: "auto",
                public_id: uuid(),
            }
        )
    
        const formattedResults = {
            public_id: result.public_id,
            url: result.secure_url
        }
        return formattedResults;
    } catch (error) {
        console.log("Error occurs while sending image to cloudinary", error);
    }
}

export {uploadToCloudinary}