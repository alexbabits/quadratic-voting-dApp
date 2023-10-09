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

`route.ts` acts as an intermediary between the frontend page and the database, essentially substituing Express as a backend server for simple projects.

The frontend sends data using a POST request with submitValue, your Next.js backend picks it up, processes it using the designated API route, and then commits this data to the database.


Next.js v13 vs v12:

"The pages folder has been roughly changed to app folder, and they have changed the way api routes work. The api routes you know from Next.js v12 have been replaced with new api route handlers. These api route handlers are only available within the `app` directory. You are supposed to put them in the `api` folder. And within the `api` folder, each of your routes are named based on the folder. All route files should be called `route.ts` in each of the folders. Now, for each HTTP method inside a `route.ts` we can export a function that has the corresponding name. To make a get request, we would export a function called GET. And for post we do POST. Before, it was done via pages/api location, and you could name your route file whatever you liked. Now it has to be called `route.ts` and whatever specific folder it is in within app/api, that is the 'name' of the route. In version 13, Next.js introduced a new App Router built on React Server Components, which supports shared layouts, nested routing, loading states, error handling, and more. The App Router works in a new directory named app. By default, components inside app are React Server Components. This is a performance optimization and allows you to easily adopt them, and you can also use Client Components."

GET requests are the only ones that can be statically evaluated.

So, I have my `app` folder. Inside it, I've mad an api folder. As a test, inside my api folder I have two folders called `routeone` and `routetwo`, both with a `route.ts` inside of them. Here is a working example inside routeone:

When I go to "http://localhost:3000/api/routeone", it succesfully displays the response string! And If I go to routetwo url, that one works as well!



## References
- Mongoose docs: https://mongoosejs.com/docs/
- Next.js docs: https://nextjs.org/docs
- Vercel docs: https://vercel.com/docs
- MetaMask docs: https://docs.metamask.io/
- Hardhat docs: https://hardhat.org/docs
- Solidity docs: https://docs.soliditylang.org/en/v0.8.21/
- Ethers 6 docs: https://docs.ethers.org/v6/