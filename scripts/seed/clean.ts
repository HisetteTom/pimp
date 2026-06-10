import { db } from './db';
import { user, account, session, verification } from '../../src/db/schema/auth';
import { project } from '../../src/db/schema/project';
import { team } from '../../src/db/schema/team';
import { task } from '../../src/db/schema/task';
import { livrable } from '../../src/db/schema/livrable';
import { comment } from '../../src/db/schema/comment';
import { refusedProject } from '../../src/db/schema/refused_project';
import { projectEnrollment } from '../../src/db/schema/project_enrollment';
import { compte } from '../../src/db/schema/compte';
import { responsability } from '../../src/db/schema/responsability';
import { notification } from '../../src/db/schema/notification';
import { S3Client, ListObjectsV2Command, DeleteObjectsCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  endpoint: process.env.STORAGE_ENDPOINT || 'http://localhost:9010',
  region: process.env.STORAGE_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.STORAGE_ACCESS_KEY || 'pimp-dev-access-key',
    secretAccessKey: process.env.STORAGE_SECRET_KEY || 'pimp-dev-secret-key',
  },
  forcePathStyle: true,
});

const BUCKET_NAME = process.env.STORAGE_BUCKET || 'pimp-deliverables';

async function cleanS3Bucket() {
  console.log('Cleaning S3 / RustFS deliverables bucket...');
  try {
    const listResponse = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
      }),
    );

    const objects = listResponse.Contents;
    if (objects && objects.length > 0) {
      const deleteParams = {
        Bucket: BUCKET_NAME,
        Delete: {
          Objects: objects
            .filter((obj): obj is { Key: string } => typeof obj.Key === 'string')
            .map((obj) => ({ Key: obj.Key })),
        },
      };
      await s3Client.send(new DeleteObjectsCommand(deleteParams));
      console.log(`Deleted ${objects.length} files from S3 deliverables bucket.`);
    } else {
      console.log('S3 deliverables bucket is already empty.');
    }
  } catch (error) {
    console.warn('S3 bucket cleanup skipped or bucket does not exist:', error);
  }
}

export async function cleanDatabase() {
  console.log('Cleaning database...');

  // Run S3 clean and initial DB deletes in parallel
  await Promise.all([
    cleanS3Bucket(),
    db.delete(comment),
    db.delete(task),
    db.delete(livrable),
    db.delete(projectEnrollment),
    db.delete(refusedProject),
    db.delete(compte),
    db.delete(session),
    db.delete(notification),
  ])
    .then(() => Promise.all([db.delete(account), db.delete(verification), db.delete(team)]))
    .then(() => Promise.all([db.delete(user), db.delete(project)]))
    .then(() => Promise.all([db.delete(responsability)]));

  await db.insert(responsability).values({ id: 1 });
  console.log('Database cleaned.');
}
