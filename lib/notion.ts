import { Client } from "@notionhq/client";

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

export async function addToNotion(data: any) {
  return await notion.pages.create({
  parent: {
    database_id: process.env.NOTION_DATABASE_ID!,
  },
  cover: data.poster
    ? {
        type: "external",
        external: {
          url: data.poster,
        },
      }
    : undefined,
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
      url: data.poster || "",
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

export async function getArchivedItems() {
  const response = await (notion.databases as any).query({
    database_id: process.env.NOTION_DATABASE_ID!,
    page_size: 100,
  });

  return response.results.map((page: any) => {
    const props = page.properties || {};

    const tmdbId =
      props.TMDB_ID?.rich_text?.[0]?.plain_text ||
      "";

    const title =
      props.NAME?.title?.[0]?.plain_text ||
      "";

    const type =
      props.Type?.select?.name || "";

    const sourceUrl =
      props["Source URL"]?.url || "";

    return {
      notionPageId: page.id,
      tmdbId,
      title,
      type,
      sourceUrl,
    };
  });
}
