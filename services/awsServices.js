const AWS = require("aws-sdk");

const dotenv = require("dotenv");
dotenv.config();

const uploadToS3 = (fileBuffer, filename, contentType) => {
  const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
  const IAM_USER_KEY = process.env.AWS_S3_ACCESS_KEY;
  const IAM_USER_SECRET = process.env.AWS_S3_SECRET_KEY;

  let s3bucket = new AWS.S3({
    accessKeyId: IAM_USER_KEY,
    secretAccessKey: IAM_USER_SECRET,
  });

  var params = {
    Bucket: BUCKET_NAME,
    Key: filename,
    Body: fileBuffer,
    ContentType: contentType,
    ACL: "public-read",
  };

  return new Promise((resolve, reject) => {
    s3bucket.upload(params, (err, s3response) => {
      if (err) {
        console.error("Error uploading to S3:", err);
        reject(err);
      } else {
        console.log("Successfully uploaded to S3:", s3response);
        resolve(s3response.Location);
      }
    });
  });
};

module.exports = { uploadToS3 };
