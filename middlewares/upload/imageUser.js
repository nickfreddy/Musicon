/* istanbul ignore file */
const path = require("path");
const crypto = require("crypto");
const sharp = require("sharp");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const REGION = "ap-southeast-1";

const uploadParams = (filename, body, mimetype) => {
  return {
    ACL: "public-read",
    Bucket: process.env.S3_BUCKET,
    Key: `users/${filename}`,
    Body: body,
    ContentType: mimetype,
  };
};

const s3 = new S3Client({
  signatureVersion: "v4",
  s3ForcePathStyle: "true",
  region: REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
  },
});

const run = async (filename, body, mimetype) => {
  try {
    await s3.send(new PutObjectCommand(uploadParams(filename, body, mimetype)));
    return "users/" + filename;
  } catch (err) {
    console.log("Error", err);
  }
};

exports.uploadImage = async (req, res, next) => {
  try {
    let errorMessages = [];

    if (req.files) {
      const file = req.files.photo;
      if (!file.mimetype.startsWith("image")) {
        errorMessages.push("File must be an image");
      }

      if (file.size > 1000000) {
        errorMessages.push("Image must be less than 1MB");
      }
      if (errorMessages.length > 0) {
        return next({ message: errorMessages.join(", "), statusCode: 400 });
      }
      let fileName = crypto.randomBytes(16).toString("hex");

      file.name = `${fileName}${path.parse(file.name).ext}`;
      file.nameCompress = `${fileName}-compress${path.parse(file.name).ext}`;

      req.body.image = await run(req.body.directory, file.name, file.data, file.mimetype);

      if (file.mimetype === "image/png") {
        file.dataCompress = await sharp(file.data).rotate().resize(512).png().toBuffer();
        file.mimetypeCompress = "image/png";
      } else {
        file.dataCompress = await sharp(file.data)
          .rotate()
          .resize(512)
          .jpeg({ mozjpeg: true })
          .toBuffer();
        file.mimetypeCompress = "image/jpeg";
      }

      await run(file.nameCompress, file.dataCompress, file.mimetypeCompress);
    }

    next();
  } catch (e) {
    return next(e);
  }
};
