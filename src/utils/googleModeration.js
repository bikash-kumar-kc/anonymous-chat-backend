import fetch from "node-fetch"; 

async function checkToxicity(text) {
  const url = `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${process.env.GOOGLE_API_KEY}`;

  if(!text) return;

  const body = {
    comment: { text },
    requestedAttributes: { TOXICITY: {} },
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    const score =
      data.attributeScores.TOXICITY.summaryScore.value;

   return score;
  } catch {
    void 0;
  }
}

export default checkToxicity;


// // import {google} from 'googleapis'
// // const DISCOVERY_URL = 'https://commentanalyzer.googleapis.com/$discovery/rest?version=v1alpha1';


// // const checkToxicity = async (text)=>{

 
// //   if(!text.trim()) return;

// //   let response ="";

// //   google.discoverAPI(DISCOVERY_URL)
// //   .then(client => {
// //     const analyzeRequest = {
// //       comment: {
// //         text: text,
// //       },
// //       requestedAttributes: {
// //         TOXICITY: {},
// //       },
// //     };

// //     client.comments.analyze(
// //         {
// //           key:process.env.GOOGLE_API_KEY,
// //           resource: analyzeRequest,
// //         },
// //         (err, res) => {
// //           if (err) throw err;
// //           console.log(JSON.stringify(response.data, null, 2));
// //           response ={...res};
// //         });
// //   })
// //   .catch(err => {
// //     console.log(err);

// //   });


// //   return response;
// // };

// // export default checkToxicity;




// import { SafeCommsClient } from 'safecomms';



// import OpenAI from "openai";
// const openai = new OpenAI();



// const checkToxicity = async(text)=>{

//   if(!text.trim()) return;
  // const moderation = await openai.moderations.create({
  //   model: "omni-moderation-latest",
  //   input: text,
  //   });
    
  //   console.log(moderation);

  //   return moderation;

//   import ModerationApi from '@moderationapi/sdk';

// const moderationApi = new ModerationApi();

// export async function checkToxicity(text) {

//   if(!text.trim()) return;

//   const result = await moderationApi.content.submit({
//     content: {
//       type: "text",
//       text: text,
//     },
//   });

//   // Block the content if flagged
//   console.log(result);
//   return result.flagged;
// }
    
// }



// export default checkToxicity;