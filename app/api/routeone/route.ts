import mongoose from 'mongoose';
import dbConnect from './database';

// Define a schema and model for the data
const ValueSchema = new mongoose.Schema({
  number: Number,
  account: String
});

const Value = mongoose.models.Value || mongoose.model('Value', ValueSchema);


export async function GET() {
  console.log("Called GET function from route.ts. Awaiting dbConnect function...");
  await dbConnect();
  console.log("Sucessfully awaited dbConnect function.");

  try {
      const values = await Value.find({});
      //const numbers = values.map(value => value.number);
      //const accounts = values.map(value => value.account);
      //console.log(`Fetched all values: ${numbers}`);
      //console.log(`Fetched all accounts: ${accounts}`);
      return new Response(JSON.stringify(values), {status: 200, headers: {'Content-Type': 'application/json'}});
  } catch (error) {
      console.error("API route error:", error);
      return new Response(JSON.stringify({ success: false }), { status: 400 });
  }
}


export async function POST(req: Request) {
  console.log("Calling POST function from route.ts. Awaiting dbConnect function...");
  await dbConnect();

  try {
    // parse the body sent from `submitValue`, then grab the `number` and account that voted.
    const body = await req.json();
    const { number, account } = body;

    // If any data is missing return error
    if (!number || !account) {
      console.error("Missing number or account in the request body.");
      return new Response(JSON.stringify({ success: false }), { status: 400 });
    } 

    // Instantiate new `Value` model with the vote and account, and save it to MongoDB collection.
    const newValue = new Value({ number, account });
    await newValue.save();

    // log the value object and return success.
    console.log(`Saved vote successfully. Number: ${number}, Account: ${account}`);
    return new Response(JSON.stringify({ success: true }));

  } catch (error) {
    console.error("API route error:", error);
    return new Response(JSON.stringify({ success: false }), { status: 400 });
  }
}