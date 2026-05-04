
// import { SafeCommsClient } from 'safecomms';


// // Initialize with your API Key
// const moderator = new SafeCommsClient({
//   apiKey: process.env.SAFECOMMS_API_KEY
// });


// export default moderator;


import OpenAI from "openai";
const openai = new OpenAI();

const moderation = await openai.moderations.create({
model: "omni-moderation-latest",
input: "...text to classify goes here...",
});

console.log(moderation);