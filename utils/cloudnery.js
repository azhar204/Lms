import { v2 as cloudinary } from 'cloudinary';
import dotenv from "dotenv"
dotenv.config({});
cloudinary.config({
    api_key:process.env.API_KEY,
    api_secret:process.env.API_SECRET,
    cloud_name:process.env.CLOUD_NAME
});
export const uploadMedia=async(file)=>{
    try{
        const uploadresponse=await cloudinary.uploader.upload(file,{
            resource_type:"auto",
        });
        return uploadresponse.secure_url;
    }catch(err){
        throw err;
    }
}
export const dlateMediaFromCloudianary=async(public_id)=>{
    try{
        await cloudinary.uploader.destroy(public_id);

    }catch(err){
        console.log("Error deleting media from Cloudinary", err);
    }

}

export const deleteVideoFromCloudinary=async(public_id)=>{
    try{
        await cloudinary.uploader.destroy(public_id, {resource_type:"video"});
    }
    catch(err){
        console.log("Error deleting video from Cloudinary", err);
    }
}