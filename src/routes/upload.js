const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');
const path = require('path');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Multer configuration
const storage = multer.memoryStorage(); // Use memory storage to avoid writing files to disk

const upload = multer({
  storage: storage,
  fileFilter: function(req, file, cb) {
    checkFileType(file, cb); // Check the file type of the uploaded file
  }
});

// Function to check the file type of the uploaded file
function checkFileType(file, cb) {
  // Allowed file extensions
  const filetypes = /jpeg|jpg|png|gif|mp4|mp3|pdf|html|docx/;

  // Check the file extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  // Check the mime type
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Invalid file type');
  }
}

// AWS configuration
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

// Endpoint for uploading files to S3
router.post('/', upload.single('file'), (req, res) => {
    const file = req.file;
    console.log(req.headers.authorization);
    const decodedToken = jwt.decode(req.headers.authorization.split(' ')[1]);
   
    const originalName_noUnderline = file.originalname.replace(/_/g, '-');
    console.log(decodedToken);
    // Create an S3 object with metadata
    const s3Object = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `${decodedToken.username}_${Date.now()}_${originalName_noUnderline}`,
      Body: file.buffer,
      ContentType: file.mimetype,
      ContentLength: file.size,
      Metadata: {
        created_at: new Date().toISOString(),
        modified_at: new Date().toISOString(),
        description: req.body.description,
        tags: req.body.tags,
        original: file.originalname
      }
    };
  
    // Upload the file to S3
    s3.upload(s3Object, (err, data) => {
      if (err) {
        console.log(err);
        res.status(500).send('Error uploading file to S3');
      } else {
        console.log(data);
        res.send('File uploaded to S3');
      }
    });
  });

module.exports = router;