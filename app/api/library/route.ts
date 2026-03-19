import { getArchivedItems } from "../../../lib/notion";

export async function GET() {
  try {
    const items = await getArchivedItems();

    return new Response(JSON.stringify(items), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
    console.error("library api error:", error);

    return new Response(
      JSON.stringify({
        error: error?.message || "라이브러리 조회 실패",
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
