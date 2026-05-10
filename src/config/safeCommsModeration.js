

import OpenAI from "openai";
const openai = new OpenAI();

await openai.moderations.create({
model: "omni-moderation-latest",
input: "...text to classify goes here...",
});
