const movieGenreMap: Record<number, string> = {
  28: "액션",
  12: "모험",
  16: "애니메이션",
  35: "코미디",
  80: "범죄",
  99: "다큐멘터리",
  18: "드라마",
  10751: "가족",
  14: "판타지",
  36: "역사",
  27: "공포",
  10402: "음악",
  9648: "미스터리",
  10749: "로맨스",
  878: "SF",
  10770: "TV 영화",
  53: "스릴러",
  10752: "전쟁",
  37: "서부",
};

const tvGenreMap: Record<number, string> = {
  10759: "액션",
  16: "애니메이션",
  35: "코미디",
  80: "범죄",
  99: "다큐멘터리",
  18: "드라마",
  10751: "가족",
  10762: "키즈",
  9648: "미스터리",
  10763: "뉴스",
  10764: "리얼리티",
  10765: "SF",
  10766: "연속극",
  10767: "토크",
  10768: "전쟁/정치",
  37: "서부",
};

export async function searchTMDB(query: string) {
  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    throw new Error("TMDB_API_KEY가 없습니다. .env.local 확인 필요");
  }

  const url =
    `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}` +
    `&query=${encodeURIComponent(query)}&language=ko-KR`;

  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`TMDB 요청 실패: ${res.status} / ${text}`);
  }

  const data = await res.json();

  return (data.results || [])
    .filter((item: any) => item.media_type === "movie" || item.media_type === "tv")
    .map((item: any) => {
      const genreMap = item.media_type === "movie" ? movieGenreMap : tvGenreMap;
      const genre = Array.isArray(item.genre_ids)
        ? item.genre_ids
            .map((id: number) => genreMap[id])
            .filter(Boolean)
        : [];

      return {
        id: item.id,
        title: item.title || item.name || "",
        year: (item.release_date || item.first_air_date || "").slice(0, 4),
        overview: item.overview || "",
        poster: item.poster_path
          ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
          : "",
        type: item.media_type === "movie" ? "Movie" : "Series",
        rating: item.vote_average || 0,
        url: `https://www.themoviedb.org/${item.media_type}/${item.id}`,
        genre,
      };
    });
}
