import { addToNotion } from "../../../lib/notion";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await addToNotion(body);

    return new Response(
      JSON.stringify({ success: true, id: result.id }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("archive api error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error?.message || "노션 저장 실패",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
