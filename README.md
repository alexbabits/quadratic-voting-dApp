69. `vercel` deploys on vercel, follow logical prompts.
69. Then just link github repo to vercel project on vercel website. It will now auto deploy on any commits.
69. Try using with Nuxt.js after (vue).


My general thoughts (please critique/improve where you see fit):
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


Next.js version 13 vs 12:
- `pages` --> `app`. API routes are now API route handlers. Must be in `app`, recommended inside `app/api`.
- Name routes with the folder they are housed in: `app/api/myroutename`. Within `myroutename` the file should always be called `route.ts`.
- Going to `http://localhost:3000/api/myroutename` works.
- `route.ts` now names functions based directly on the HTTP method (GET, POST, PUT, DELETE, etc.).
- To make a GET request, we would name the function inside `route.ts` GET.
- The new App Router supports shared layouts, nested routing, loading states, error handling, etc.
- The components inside `app` default to React Server Components, but can also use/declare them as Client Components. 


## Plan overview
- Instead of submitting one number, submit multiple numbers.
- Allocate vote credits to the user. They start with 100, and by increasing the vote of each proposal, it increases the number of vote credits that must be spent.
- determine how to make a custom ERC-20 (through manipulating transfer function, or see if you can include a `vote` function.)
- May need a DAO contract as well to recieve the vote credits, or they can simply get burned when voted.


## Finishing Up
- Bug: Voter can vote multiple times still until page refreshes. Needs to immediately refresh somehow.
- Bug: Address also doesn't immediately update when switching addresses.
- `useReducer` to batch multiple state updates in one go. When you are updating multiple state variables consecutively and you are sure they are always updated together. `React.memo` also helps, higher order component that memorizes the rendered output of the wrapped component preventing unecessary renders.
- Will local database work on deployment to vercel?
- componentize everything in a component folder or similar afterwards.


## References
- Mongoose docs: https://mongoosejs.com/docs/
- Next.js docs: https://nextjs.org/docs
- Vercel docs: https://vercel.com/docs
- MetaMask docs: https://docs.metamask.io/
- Hardhat docs: https://hardhat.org/docs
- Solidity docs: https://docs.soliditylang.org/en/v0.8.21/
- Ethers 6 docs: https://docs.ethers.org/v6/