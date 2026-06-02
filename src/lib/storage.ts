import { S3Client, CreateBucketCommand, HeadBucketCommand } from '@aws-sdk/client-s3';

export const s3Client = new S3Client({
  endpoint: process.env.STORAGE_ENDPOINT || 'http://localhost:9010',
  region: process.env.STORAGE_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.STORAGE_ACCESS_KEY || 'pimp-dev-access-key',
    secretAccessKey: process.env.STORAGE_SECRET_KEY || 'pimp-dev-secret-key',
  },
  forcePathStyle: true, // Crucial for self-hosted S3-compatible backends like RustFS
});

export const BUCKET_NAME = process.env.STORAGE_BUCKET || 'pimp-deliverables';

export async function ensureBucketExists() {
  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: BUCKET_NAME }));
  } catch (error) {
    const s3Error = error as { name?: string; $metadata?: { httpStatusCode?: number } };
    // If bucket doesn't exist, create it
    if (s3Error.name === 'NotFound' || s3Error.$metadata?.httpStatusCode === 404) {
      console.log(`Bucket "${BUCKET_NAME}" not found. Creating bucket...`);
      try {
        await s3Client.send(new CreateBucketCommand({ Bucket: BUCKET_NAME }));
        console.log(`Bucket "${BUCKET_NAME}" created successfully.`);
      } catch (createError) {
        console.error('Failed to create S3 bucket:', createError);
      }
    } else {
      console.error('Error checking S3 bucket existence:', error);
    }
  }
}
