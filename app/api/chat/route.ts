import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Formato de mensajes inválido" }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
    });

    return NextResponse.json({
      content: completion.choices[0].message.content,
    });
  } catch (error: any) {
    console.error("Error en API Chat:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
