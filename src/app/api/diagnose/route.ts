import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mediaType } = await req.json();

    if (!imageBase64 || !mediaType) {
      return NextResponse.json({ error: "画像データが不正です" }, { status: 400 });
    }

    const prompt = `あなたは爪の専門美容診断AIです。送られてきた爪の写真を詳細に分析し、以下のJSON形式のみで回答してください。他の文字は一切含めないでください。

{
  "overall": <総合点 0-100の整数>,
  "shape": <形の美しさ 0-100>,
  "color": <色・ツヤ 0-100>,
  "health": <健康状態スコア 0-100>,
  "healthStatus": <"良好" or "注意" or "要チェック">,
  "comment": <爪全体への一言コメント（日本語、1〜2文）>,
  "goodPoints": [<良い点1>, <良い点2>],
  "improvements": [<改善点1>, <改善点2>],
  "healthAdvice": <健康面からのアドバイス（日本語、1〜2文）>,
  "nailType": <爪のタイプ（例: "スクエア型", "オーバル型", "ラウンド型", "アーモンド型"）>
}`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [{
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
              data: imageBase64,
            },
          },
          { type: "text", text: prompt },
        ],
      }],
    });

    const text = response.content.find((b) => b.type === "text")?.text || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("JSONが見つかりません");
    const result = JSON.parse(jsonMatch[0]);
    return NextResponse.json(result);
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json({ error: "診断に失敗しました" }, { status: 500 });
  }
}

