# MovieFlix TMDB Search Contract

## Goal

Return only records that are supported by TMDB and match the user's query intent. Search results must never be padded with unrelated popular titles or AI-invented titles.

## Request flow

\`/api/search?query=...\`
1. Validate and normalize the query.
2. Detect one of the supported intents.
3. Call the corresponding TMDB endpoint.
4. Resolve people before requesting filmography.
5. Apply intent-specific validation and deduplication.
6. Return the TMDB records with the resolved intent and person metadata.

## Intent routing

| Intent | TMDB route | Matching rule |
|---|---|---|
| Movie title | \`/search/movie\` or \`/search/multi\` | Exact title first, then TMDB relevance/popularity |
| TV title | \`/search/tv\` or \`/search/multi\` | Exact name first, then TMDB relevance/popularity |
| Actor / actress | \`/search/person\` → \`/person/{id}/movie_credits\` | Only cast credits for the resolved person |
| Director | \`/search/person\` → \`/person/{id}/movie_credits\` | Only crew credits whose job is exactly \`Director\` |
| Genre | \`/discover/movie\` | TMDB genre IDs; comma means AND, pipe means OR |
| Mood | \`/discover/movie\` | Curated mood-to-genre mapping; results are heuristic mood matches |
| Language / year / rating | \`/discover/movie\` | Apply actual TMDB filters |
| Similar title | TMDB similar / recommendations | Resolve the source title first; never substitute trending titles |

## Query examples

- \`Interstellar\` → title search.
- \`Prabhas\` → exact person resolution, then his movie cast credits.
- \`movies of Samantha\` → person resolution, then cast credits.
- \`Christopher Nolan movies\` → person resolution, then director credits.
- \`movies directed by S. S. Rajamouli\` → director-only credits.
- \`Telugu action movies after 2020\` → Discover with language, genre and release-date constraints.
- \`mind bending movies\` → Discover using the curated mood genre set.

## Relevance and quality rules

- Never use a random first person hit as a resolved identity. Prefer exact normalized names; accept only safe meaningful partial-name matches.
- Do not confuse cast credits with director credits.
- Deduplicate by TMDB ID.
- Exclude adult records.
- Do not invent titles or fill result limits with popular/trending content.
- Do not replace empty results with unrelated content. Return an honest empty state.
- Popularity and vote data rank already-relevant results; they do not establish relevance by themselves.
- A mood is not a native TMDB field. Mood results are genre-based approximations and should be described honestly.

## Mood discovery

The mood endpoint uses TMDB Discover with a curated genre set, adult filtering, a minimum vote-count floor, poster/date/overview validation, and stable popularity ordering. It returns however many valid records TMDB actually supplies. It must not fabricate a 100-item quota, shuffle the results randomly, or fill shortages from unrelated languages.

## Security and reliability

- Keep TMDB credentials server-side.
- Use the configured TMDB API key or v4 bearer token.
- Validate query length and pagination.
- Return a clear error when TMDB is unavailable.
- Cache TMDB responses for a bounded period.
- UI components should consume the central \`/api/search\` response contract rather than implementing their own competing intent parsers.

## Known limitation

Mood labels such as “inspirational”, “dark”, or “feel-good” cannot be perfectly inferred from TMDB genre metadata alone. The current mapping is a transparent approximation. Higher precision requires verified TMDB keyword mappings or a curated editorial mood dataset, followed by result-level relevance checks.
