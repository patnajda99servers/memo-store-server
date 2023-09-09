const cloudinary = require('cloudinary').v2
const dotenv = require('dotenv')
const {CloudinaryStorage} = require('multer-storage-cloudinary')

dotenv.config()

cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});


class Cloudinary {

    constructor(multimedia, folder_name) {
        this.multimedia_ = multimedia,
        this.folder_name_ = folder_name
    }
 
    control_function() {
        console.log(this.multimedia_)
    }

    upload() {
        cloudinary.uploader.upload(this.multimedia_.path, {folder: this.folder_name_}).then(res => {
            console.log(res)
            console.log('Well done !')
        })
    }

    getImages() {
        return cloudinary.search.expression(`folder:${this.folder_name_}`).execute()
    }

}

module.exports = Cloudinary