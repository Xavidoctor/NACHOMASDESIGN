import "server-only";

import { ListObjectsV2Command } from "@aws-sdk/client-s3";

import { getR2Client, getR2Config } from "@/src/lib/r2/client";

export type R2UsageSummary = {
  bucket: string;
  objects: number;
  bytes: number;
  sampled: boolean;
};

export async function getR2UsageSummary(
  options?: { maxPages?: number; pageSize?: number },
): Promise<R2UsageSummary> {
  const client = getR2Client();
  const { bucket } = getR2Config();

  const maxPages = Math.max(1, options?.maxPages ?? 200);
  const pageSize = Math.min(1000, Math.max(100, options?.pageSize ?? 1000));

  let continuationToken: string | undefined;
  let page = 0;
  let objects = 0;
  let bytes = 0;
  let sampled = false;

  while (page < maxPages) {
    const response = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        MaxKeys: pageSize,
        ContinuationToken: continuationToken,
      }),
    );

    const contents = response.Contents ?? [];
    objects += contents.length;
    bytes += contents.reduce((acc, item) => acc + Number(item.Size ?? 0), 0);

    if (!response.IsTruncated || !response.NextContinuationToken) {
      break;
    }

    continuationToken = response.NextContinuationToken;
    page += 1;
  }

  if (continuationToken) {
    sampled = true;
  }

  return {
    bucket,
    objects,
    bytes,
    sampled,
  };
}
