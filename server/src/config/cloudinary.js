/**
 * Cloudinary Media Storage configuration settings (Scaffold only).
 */
export const cloudinaryConfig = {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'placeholder_cloud_name',
  apiKey: process.env.CLOUDINARY_API_KEY || 'placeholder_api_key',
  apiSecret: process.env.CLOUDINARY_API_SECRET || 'placeholder_api_secret',
};

export default cloudinaryConfig;
