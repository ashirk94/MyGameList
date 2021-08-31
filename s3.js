const multer = require('multer')
const multerS3 = require('multer-s3')
const fs = require('fs')
const S3 = require('aws-sdk/clients/s3')
const path = require('path')
const Game = require('./models/game')
const uploadPath = path.join('public', Game.imageBasePath)

const s3 = new S3({
  secretAccessKey: process.env.AWS_IAM_USER_SECRET,
  accessKeyId: process.env.AWS_IAM_USER_KEY,
  region: "us-west-2",
});

/*const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type, only JPEG and PNG is allowed!"), false);
  }
};
*/

function uploadFile(file) {
    if (file == null | file.path == undefined)
    {
        return
    }
    const fileStream = fs.createReadStream(file.path)
  
    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Body: fileStream,
      Key: uploadPath
    }
      return s3.upload(uploadParams).promise()
  }

  function getFileStream(fileKey) {
    const downloadParams = {
      Key: fileKey,
      Bucket: process.env.AWS_BUCKET_NAME
    }

    return s3.getObject(downloadParams).createReadStream()
  }
  
exports.getFileStream = getFileStream
exports.uploadFile = uploadFile
