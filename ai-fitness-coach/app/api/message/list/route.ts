import { NextResponse } from "next/server"
import OpenAI from "openai"

export async function POST(req: Request) {
    const { threadID } = await req.json()

    if(!threadID) {
        return NextResponse.json(
            { error: "threadID is required", success: false},
            { status: 400}
        )
    }

    const openai = new OpenAI

    try {
        const response = await openai.beta.threads.messages.list(threadID)

        console.log("from openai messages", response)

        return NextResponse.json({messages: response.data, success: true}, {status: 200})
    }
    catch (error) {
        console.error(error)
        return NextResponse.json(
            { error: "Something went wrong", success: false},
            { status: 500}
        )
    }
}