import mongoose from 'mongoose';
import dbConnect from './database';

// Define a schema and model for the data
const ValueSchema = new mongoose.Schema({number: Number});

const Value = mongoose.models.Value || mongoose.model('Value', ValueSchema);


export async function GET() {
  console.log("Called GET function from route.ts. Awaiting dbConnect function...");
  await dbConnect();
  console.log("Sucessfully awaited dbConnect function.");

  try {
      const values = await Value.find({});
      const numbers = values.map(value => value.number);
      const ids = values.map(value => value.id)
      console.log(`Fetched all values: ${numbers}`)
      console.log(`Fetched all ID's: ${ids}`)
      return new Response(JSON.stringify(values), {status: 200, headers: {'Content-Type': 'application/json'}});
  } catch (error) {
      console.error("API route error:", error);
      return new Response(JSON.stringify({ success: false }), { status: 400 });
  }
}


export async function POST(req: Request) {
  console.log("Called POST function from route.ts. Awaiting dbConnect function...");
  await dbConnect();
  console.log("Sucessfully awaited dbConnect function.");

  try {
    // parse the body sent from `submitValue`, then grab the `number`.
    const body = await req.json();
    const { number } = body;

    // Instantiate new `Value` model with the `number`, and save it to MongoDB collection.
    const newValue = new Value({ number });
    await newValue.save();

    // log the value object and return success.
    console.log(`Saved value successfully: ${newValue}`)
    return new Response(JSON.stringify({ success: true }));

  } catch (error) {
    console.error("API route error:", error);
    return new Response(JSON.stringify({ success: false }), { status: 400 });
  }
}