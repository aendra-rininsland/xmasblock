/**
 * @file
 * This is where the labeling work happens when an image is above the inference threshold
 */

import { Bot, PostReference } from "@skyware/bot";
import { CommitCreateEvent } from "@skyware/jetstream";

const { INFERENCE_PROMPT, BSKY_USERNAME, BSKY_PASSWORD } = process.env;
const bot = new Bot();

const loggedIn = bot.login({
  identifier: BSKY_USERNAME!,
  password: BSKY_PASSWORD!,
});

export const createLabel = async (
  post: CommitCreateEvent<"app.bsky.feed.post">,
  images: [string, { score: number; label: string }[]][]
) => {
  if (!images.length) {
    return false;
  }

  const reference = new PostReference(
    {
      uri: `at://${post.did}/${post.commit.collection}/${post.commit.cid}`,
      cid: post.commit.cid,
    },
    bot
  );

  const maxScore = Math.max(
    ...images.flatMap(([, img]) => img.map((d) => d.score))
  );

  if (maxScore < 0.65) return;

  console.log(
    {
      reference,
      labels: [INFERENCE_PROMPT],
      comment: `max-score: ${maxScore}`,
    },
    images
  );

  await loggedIn;

  return bot.label({
    reference,
    labels: ["xmas"],
    comment: `max-score: ${maxScore}`,
  });
};
