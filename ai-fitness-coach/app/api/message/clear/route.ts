import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI();

export async function POST(req: Request) {
  try {
    const { threadId } = await req.json();

    if (!threadId) {
      return NextResponse.json(
        { error: "threadId is required", success: false },
        { status: 400 }
      );
    }

    const response = await openai.beta.threads.messages.list(threadId);

    if (response.data.length === 0) {
      return NextResponse.json(
        { error: "No messages found", success: false },
        { status: 404 }
      );
    }

    for (const message of response.data) {
      await openai.beta.threads.messages.del(threadId,message.id);
    }

    return NextResponse.json(
      { success: true, message: "Messages cleared successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to clear messages:", error);
    return NextResponse.json(
      { error: "Something went wrong", success: false },
      { status: 500 }
    );
  }
}
