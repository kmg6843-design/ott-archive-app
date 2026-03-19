import { Client } from "@notionhq/client";

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

export async function addToNotion(data: any) {
  const created = await notion.pages.create({
    parent: {
      database_id: process.env.NOTION_DATABASE_ID!,
    },
    properties: {
      NAME: {
        title: [
          {
            text: {
              content: data.title || "제목 없음",
            },
          },
        ],
      },
      Status: {
        status: {
          name: data.status || "WATCHED",
        },
      },
      Type: {
        select: {
          name: data.type || "Movie",
        },
      },
      Year: {
        number: Number(data.year) || null,
      },
      Genre: {
        multi_select: Array.isArray(data.genre)
          ? data.genre.map((g: string) => ({ name: g }))
          : [],
      },
      Rating: {
        number: Number(data.rating) || 0,
      },
      Poster: {
        files: data.poster
          ? [
              {
                name: `${data.title || "제목 없음"} Poster`,
                external: {
                  url: data.poster,
                },
              },
            ]
          : [],
      },
      Overview: {
        rich_text: [
          {
            text: {
              content: (data.overview || "").slice(0, 1900),
            },
          },
        ],
      },
      "Source URL": {
        url: data.url || "",
      },
      "Archived At": {
        date: {
          start: new Date().toISOString(),
        },
      },
      TMDB_ID: {
        rich_text: [
          {
            text: {
              content: String(data.id || ""),
            },
          },
        ],
      },
    },
  });

  if (data.poster) {
    try {
      await notion.pages.update({
        page_id: created.id,
        cover: {
          type: "external",
          external: {
            url: data.poster,
          },
        },
      });
    } catch (error) {
      console.error("cover update failed:", error);
    }
  }

  return created;
}