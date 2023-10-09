// Exmaple of another route

export async function GET() {
    return new Response('This is route.ts from app/api/routetwo!')
}

export async function POST(req: Request){
    const body = await req.json() // rather than `const body = req.body`
    console.log(body)
    return new Response('OK') // rather than `res.status(200).end()`
}