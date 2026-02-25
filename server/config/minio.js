const Minio = require('minio');
require('dotenv').config();

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT) || 9000,
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin123',
});

const BUCKET_NAME = process.env.MINIO_BUCKET || 'learnlang-uploads';

// Ensure bucket exists on startup
async function initBucket() {
  try {
    const exists = await minioClient.bucketExists(BUCKET_NAME);
    if (!exists) {
      await minioClient.makeBucket(BUCKET_NAME);
      console.log(`✅ Bucket "${BUCKET_NAME}" created successfully`);
    } else {
      console.log(`✅ Bucket "${BUCKET_NAME}" already exists`);
    }
  } catch (err) {
    console.error('❌ MinIO bucket init error:', err.message);
  }
}

module.exports = { minioClient, BUCKET_NAME, initBucket };
