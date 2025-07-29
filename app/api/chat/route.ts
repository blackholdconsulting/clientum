import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
    });

    const content = completion.choices?.[0]?.message?.content || "⚠️ Sin respuesta";

    return NextResponse.json({ content });
  } catch (error: any) {
    console.error("Error API Chat:", error);
    return NextResponse.json({ content: `Error: ${error.message}` }, { status: 500 });
  }
}
