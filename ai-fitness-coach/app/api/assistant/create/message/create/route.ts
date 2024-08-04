export async function POST(req: Request) {
    const {message, threadID} = await req.json()

    console.log("from user", {message, threadID})
}