import cloudinary from '../config/cloudinary.js';

/**
 * Uploads a file buffer to Cloudinary
 * @param {Buffer} fileBuffer - Memory buffer of the uploaded file
 * @param {string} folder - Folder name on Cloudinary
 * @returns {Promise<object>} Cloudinary response object
 */
export const uploadBufferToCloudinary = (fileBuffer, folder = 'speedmotors') => {
  return new Promise((resolve, reject) => {
    // Check if Cloudinary is fully configured in the environment
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      console.warn('Cloudinary credentials are not configured. Falling back to default mock image URL.');
      // Resolve immediately with a standard premium mock car image url
      return resolve({
        secure_url: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=800'
      });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) {
          console.error('Cloudinary Upload Stream Error:', error);
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
};
