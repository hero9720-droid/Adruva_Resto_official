"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadToR2 = uploadToR2;
exports.getPresignedUploadUrl = getPresignedUploadUrl;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const uuid_1 = require("uuid");
const logger_1 = require("./logger");
const s3 = new client_s3_1.S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    },
});
async function uploadToR2(file, fileName, contentType) {
    const key = `${(0, uuid_1.v4)()}-${fileName}`;
    try {
        await s3.send(new client_s3_1.PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: key,
            Body: file,
            ContentType: contentType,
        }));
        return `${process.env.R2_PUBLIC_URL}/${key}`;
    }
    catch (error) {
        logger_1.logger.error('R2 Upload Error', error);
        throw error;
    }
}
async function getPresignedUploadUrl(fileName, contentType) {
    const key = `${(0, uuid_1.v4)()}-${fileName}`;
    const command = new client_s3_1.PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
        ContentType: contentType,
    });
    try {
        const url = await (0, s3_request_presigner_1.getSignedUrl)(s3, command, { expiresIn: 3600 });
        return {
            uploadUrl: url,
            publicUrl: `${process.env.R2_PUBLIC_URL}/${key}`,
            key
        };
    }
    catch (error) {
        logger_1.logger.error('R2 Presigned URL Error', error);
        throw error;
    }
}
