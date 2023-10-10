import mongoose from 'mongoose';
import dbConnect from './database';

// Instantiate a Schema for the structure of the documents, and a Model to interface with the database.
const VotingDataSchema = new mongoose.Schema({votesArray: [Number], account: String});
const VotingData = mongoose.models.VotingData || mongoose.model('VotingData', VotingDataSchema, 'votingData');

// GET function to fetch and read the data from the database.
export async function GET() {
  console.log("Calling GET function from 'api/routeone/route.ts'. Awaiting database connection...");
  await dbConnect();

  try {
    // fetch all documents from the votingData collection.
    const votingData = await VotingData.find({});
    return new Response(JSON.stringify(votingData), {status: 200, headers: {'Content-Type': 'application/json'}});
  } catch (error) {
      console.error("API route error:", error);
      return new Response(JSON.stringify({ success: false }), { status: 400 });
  }
}

// POST function to write data to the database.
export async function POST(req: Request) {
  console.log("Calling POST function from 'api/routeone/route.ts'. Awaiting database connection...");
  await dbConnect();

  try {
    // parse the body sent from `submitValue`, then grab the votesArray and account that voted.
    const body = await req.json();
    const { votesArray, account } = body;

    // If any data is missing return error (More advanced checks later, such as exact length matching number of candidates)
    if (!votesArray || votesArray.length === 0 || !account) {
      console.error("votesArray missing or empty, or no account in the request body.");
      return new Response(JSON.stringify({ success: false }), { status: 400 });
    } 

    // Instantiate new `VotingData` document with the incoming votes for an account, and save it to the collection.
    const newVotingData = new VotingData({ votesArray, account });
    await newVotingData.save();

    // log the value object and return success.
    console.log(`Saved voting data successfully. Account: ${account}. Votes for Candidates: ${votesArray.join(', ')}`);
    return new Response(JSON.stringify({ success: true }));

  } catch (error) {
    console.error("API route error:", error);
    return new Response(JSON.stringify({ success: false }), { status: 400 });
  }
}