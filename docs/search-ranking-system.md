# MovieFlix Search Ranking System (Production Design)

## 0. Goal
Transform search into an intelligent system that:
- Understands user intent
- Routes query to correct strategy
- Applies type-specific ranking
- Removes low-quality results
- Returns high-confidence results in <500ms

---

## 1. Search Pipeline Architecture

QUERY → CLASSIFIER → STRATEGY → TMDB FETCH → FILTER → RANK → UI

---

## 2. Query Classification

## Types

1. KEYWORD → "avatar", "interstellar"
2. SEMANTIC → "movies like inception"
3. MOOD → "sad movies"
4. PERSON → "tom cruise movies"
5. GENRE → "action movies"
6. TRENDING → "latest movies"
7. HYBRID → "sad romantic movies"

---

## 3. Ranking Core Variables

Each movie gets a score:

score =
  (ratingWeight * vote_average) +
  (popularityWeight * popularity) +
  (recencyWeight * release_year_score) +
  (matchWeight * relevance_score)

---

## 4. Global Filters (ALL TYPES)

REMOVE:
- vote_count < 100
- missing poster
- release_date null

BOOST:
- vote_average > 7
- popularity high

---

# 🔥 5. TYPE-SPECIFIC RANKING

---

## 5.1 KEYWORD SEARCH

Example:
"interstellar"

### Strategy
- Direct TMDB search

### Ranking

score =
  (exactMatchBoost * 100) +
  (rating * 3) +
  (popularity * 2)

### Rules
- Exact title match = top result
- Partial match = secondary

---

## 5.2 SEMANTIC SEARCH

Example:
"movies like inception"

### Strategy
1. Extract base movie ("inception")
2. Get TMDB ID
3. Fetch:
   - similar movies
   - recommendations

### Ranking

score =
  (similarityScore * 5) +
  (rating * 3) +
  (popularity * 2)

### Extra Boost
- Same director
- Same genres
- Same keywords

---

## 5.3 MOOD SEARCH

Example:
"sad movies"

### Mood Mapping

sad →
  genres: [18]
  keywords: ["loss", "death", "love", "tragedy"]

happy →
  genres: [35, 10751]

thrilling →
  genres: [28, 53]

### Ranking

score =
  (emotionMatch * 5) +
  (rating * 3) +
  (popularity * 2)

### Emotion Match

emotionMatch =
  genreMatch +
  keywordMatch +
  toneScore

---

## 5.4 PERSON SEARCH

Example:
"tom cruise movies"

### Strategy
1. Search person
2. Get person_id
3. Fetch credits

### Ranking

score =
  (roleWeight * 5) +   // actor vs cameo
  (rating * 3) +
  (popularity * 2)

---

## 5.5 GENRE SEARCH

Example:
"action movies"

### Strategy
- Discover endpoint with genre

### Ranking

score =
  (rating * 3) +
  (popularity * 3) +
  (recency * 2)

---

## 5.6 TRENDING SEARCH

Example:
"latest movies"

### Strategy
- trending + now_playing

### Ranking

score =
  (recency * 5) +
  (popularity * 3)

---

## 5.7 HYBRID SEARCH

Example:
"sad romantic movies"

### Strategy
- Combine multiple genres

### Ranking

score =
  (multiMatch * 5) +
  (rating * 3) +
  (popularity * 2)

---

# 🧠 6. RELEVANCE SCORE

relevance_score =
  title_match +
  genre_match +
  keyword_match +
  semantic_similarity

---

# ⚡ 7. FALLBACK SYSTEM

If no results:

1. Relax filters
2. Switch to popular
3. Show "Related results"

---

# 🎯 8. UI OUTPUT

## Sections

- Top Match
- Movies
- Series
- Actors

---

# 🚀 9. PERFORMANCE

- Cache queries (Redis optional)
- Debounce 200ms
- Parallel API calls

---

# 🛡 10. ERROR HANDLING

- Empty → show fallback
- API fail → cached results

---

# 🏁 11. SUCCESS CRITERIA

✔ Correct results for:
  - "movies like inception"
  - "sad movies"
✔ No garbage results
✔ Fast response
✔ High relevance top 3