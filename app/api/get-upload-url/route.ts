import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.AWS_REGION!, // e.g., 'us-east-1'
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: Request) {
  const { fileName, fileType } = await req.json();

  if (!fileName) {
    throw new Error("File name is required");
  }

  const params = {
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: fileName,
    ContentType: fileType,
  };

  const command = new PutObjectCommand(params);
  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

  const publicUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

  return new Response(
    JSON.stringify({
      uploadUrl, // Pre-signed URL for uploading
      publicUrl, // Public URL for storing in the database
    }),
    {
      headers: { "Content-Type": "application/json" },
    }
  );
}
