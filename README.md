## Finishing Up
- UI Concerns
    - pop ups for error messages on screen rather than console. pop up for successful vote.
    - Move everything visually to how you want
        - Connect Wallet & Disconnect button in top right
        - Past Voters in a nice box format on left or right.
        - Vote Summary in a box somewhere nice.
    - Coloring/Background/Aesthetics
    - Break everything into component files

- Detail the project in the README.

toast.error, toast.success, toast.info

Right now, everything is in one big div I think, just centered and top to bottom.




## Questions
- Will local database work on deployment to vercel? (Or will I have to use atlas cloud one, is the same but just with a different string?)
- `vercel` deploys on vercel, follow logical prompts.
- Then just link github repo to vercel project on vercel website. It will now auto deploy on any commits.




## General Process
- I ran `npm init -y` to install basic package.json.
- I ran `npx create-next-app appname` to create most of the starter folders for a Next.js project (`app` folder, `.next` folder)
- I can now run `npm run dev` which starts a local development server at `http://localhost:3000`. 
- I also installed mongodb and mongoose with `npm install mongodb` and `npm install mongoose`. Mongoose makes CRUD easier with Object Data Modeling (ODM) allowing interaction with database using JSON instead of writing raw queries.
- I installed MongoDB locally on my computer at `C:\Program Files\MongoDB\Server\7.0\`. This sets up a MongoDB server on my machine that can accept connections and store data.
- I created a database with MongoDB Compass naming it `mydatabase`. It's connection string is: `mongodb://127.0.0.1:27017/mydatabase`.
- For API routes, I needed to make an `api` folder inside of `app`. And then the route name as the folder like `routeone`. 
- Inside of `routeone` is where my `database.js` and `route.ts` is housed. My `database.js` file contains a function for mongoose to connect to `mydatabase`.
- `route.ts` is where I create an API endpoint. I define how my server should respond to incoming HTTP requests. The GET and POST functions are examples of how to read and write data to the database.
- `page.js` inside of `app` is the frontend that has the button and spinbox for a user to input their number. Our `submitValue` function successfully writes the users chosen number via the POST function from `route.ts` to the database.
- `MNNN` (Mongo, Next.js, Next.js, Node) Next.js API Route handlers substitute for traditional Express backend server. And Next.js also substitutes for React for the frontend.
- `route.ts` acts as an intermediary between the frontend page and the database, essentially substituting Express as a backend server for simple projects.
- The frontend sends data using a POST request with submitValue, your Next.js backend picks it up, processes it using the designated API route, and then commits this data to the database.
- ran `npx hardhat init` with baseline javascript project.
- `npx hardhat run scripts/deploy.js --network sepolia` to deploy `VoteToken`.
- `npm install ws bufferutil utf-8-validate --save-optional` to fix warning bug in terminal for Next.js 13 with ethers.
- `VTKN` contract address: `0xcb76a79aE432a579c80be9674ce1Ab4a5A5E6f0D`


## Next.js 12 vs 13 Notes
- `pages` --> `app`. API routes are now API route handlers. They must be in `app`, recommended inside `app/api`.
- Name routes with the folder they are housed in: `app/api/myroutename`. The route within `myroutename` should always be called `route.ts`.
- `route.ts` now names functions based directly on the HTTP method (GET, POST, PUT, DELETE, etc.).
- To make a GET request, we would name a function `GET` inside `route.ts`.
- The new App Router supports shared layouts, nested routing, loading states, error handling, etc.
- The components inside `app` default to React Server Components, but can also use/declare them as Client Components. 


## References
- Mongoose docs: https://mongoosejs.com/docs/
- Next.js docs: https://nextjs.org/docs
- Vercel docs: https://vercel.com/docs
- MetaMask docs: https://docs.metamask.io/
- Hardhat docs: https://hardhat.org/docs
- Solidity docs: https://docs.soliditylang.org/en/v0.8.21/
- Ethers 6 docs: https://docs.ethers.org/v6/



## Misc notes

What is 'fair'?
What illucidates the truth?
What kind of human psychology is at play when distributing their vote tokens?
Humans have a bias for certain numbers.

=> voting basic solidity example: https://docs.soliditylang.org/en/latest/solidity-by-example.html

1. Tokens?
2. Multiple Users?
3. Database connection? Mongo/SQL
4. Express?
5. Quadratic voting formula

https://quadraticvote.co/
https://github.com/anish-agnihotri/quadratic-voting

https://qv.geek.sg/

Quadratic voting: 
https://vitalik.ca/general/2019/12/07/quadratic.html

ITS NOT N^2, ITS N^2/2. VITALIK HAS IT RIGHT. SHOW THE GRAPHS!
Each votes `price` changes. You pay one for 1st vote, two credits for 2nd vote, (Totaling 3, and so on.)
If everyone is given 100 credits, does not mean that each will get the same number of votes.
Because each vote costs a different amount, some may choose to spread out votes more, giving more total votes.
Or some may choose to stack votes heavily on one candidate, which will consume more vote credits more quickly.

https://vitalik.ca/general/2019/10/24/gitcoin.html
https://vitalik.ca/general/2020/01/28/round4.html




atlas:

adminUser, NMinaNidGa4rXe4S


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://adminUser:<password>@cluster0.wfzut53.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);
