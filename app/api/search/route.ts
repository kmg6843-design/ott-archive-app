import { searchTMDB } from "../../..//lib/tmdb";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query) {
      return Response.json([]);
    }

    const results = await searchTMDB(query);
    return Response.json(results);
  } catch (error: any) {
    console.error("search api error:", error);
    return new Response(
      JSON.stringify({
        error: error?.message || "알 수 없는 오류",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
