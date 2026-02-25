const { v4: uuidv4 } = require('crypto');
const { minioClient, BUCKET_NAME } = require('../config/minio');
const UploadedFile = require('../models/uploadedFile');
const crypto = require('crypto');

const uploadController = {
  async upload(req, res, next) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
      }

      const deckId = req.body.deck_id || null;
      const results = [];

      for (const file of req.files) {
        // Generate unique key for MinIO
        const uniqueId = crypto.randomUUID();
        const ext = file.originalname.split('.').pop();
        const minioKey = `${uniqueId}.${ext}`;

        // Upload to MinIO
        await minioClient.putObject(BUCKET_NAME, minioKey, file.buffer, file.size, {
          'Content-Type': file.mimetype,
          'Original-Name': encodeURIComponent(file.originalname),
        });

        // Record in database
        const record = await UploadedFile.create({
          deck_id: deckId,
          original_name: file.originalname,
          minio_key: minioKey,
          file_type: file.mimetype,
          file_size: file.size,
        });

        results.push(record);
      }

      res.status(201).json({ message: `${results.length} file(s) uploaded`, files: results });
    } catch (err) {
      next(err);
    }
  },

  async getFilesByDeck(req, res, next) {
    try {
      const files = await UploadedFile.findByDeckId(req.params.deckId);
      res.json(files);
    } catch (err) {
      next(err);
    }
  },

  async deleteFile(req, res, next) {
    try {
      const file = await UploadedFile.findById(req.params.id);
      if (!file) return res.status(404).json({ error: 'File not found' });

      // Remove from MinIO
      await minioClient.removeObject(BUCKET_NAME, file.minio_key);

      // Remove from DB
      await UploadedFile.delete(req.params.id);

      res.json({ message: 'File deleted', file });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = uploadController;
