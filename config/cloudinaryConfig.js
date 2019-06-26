import { config, uploader } from 'cloudinary';
// import dotenv from 'dotenv';
// dotenv.config();
const cloudinaryConfig = (req, res, next) => {config({
	cloud_name: "dlzucgqfw",
	api_key:"893174125255488" ,
	api_secret: "GzS2jDFDRkGbTYJ2i-XPziaME8A",
});
next();}

export { cloudinaryConfig, uploader };