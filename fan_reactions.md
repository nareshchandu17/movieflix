📄 fan-reactions-feature.md
# Fan Reactions — End-to-End Feature (MovieFlix)

## 0. Goal
Build a scalable, reels-style "Fan Reactions" feature:
- Short video reactions (<= 30s)
- Linked to movies (TMDB movieId)
- Reels-style feed (global + per-movie)
- Fast, stable, minimal MVP → extensible to production

---

## 1. Tech Stack (Fixed)
- Frontend: Next.js (App Router), React, TypeScript
- Backend: Next.js API routes (or Route Handlers)
- Storage: Cloudinary (video + thumbnails)
- DB: MongoDB (Mongoose)
- State: React Query (or SWR)
- Styling: Tailwind CSS

---

## 2. Folder Structure

/app
  /fan-reactions
    page.tsx                # global reels page
  /movie/[id]
    page.tsx                # movie page (with reactions section)

/components
  /fan-reactions
    ReelsPlayer.tsx
    ReactionCard.tsx
    ReactionActions.tsx
    UploadModal.tsx

/lib
  cloudinary.ts
  db.ts
  ranking.ts

/models (if Mongo)
  Reaction.ts

/app/api
  /upload-signature/route.ts
  /reactions/route.ts
  /reactions/[id]/like/route.ts
  /reactions/[id]/view/route.ts

---

## 3. Data Model

## Reaction Schema

```ts
Reaction {
  id: string
  userId: string
  movieId: number

  videoUrl: string
  thumbnailUrl: string
  duration: number

  caption?: string

  likes: number
  views: number

  createdAt: Date
}

Indexes:

movieId
createdAt
likes
4. UI/UX
4.1 Global Page /fan-reactions
Fullscreen vertical reels
One video per viewport
Scroll = snap to next video

Layout:

[ VIDEO ]

Right:
❤️ Like
👁 Views

Bottom:
Movie Title
Caption
[ ▶ Watch Movie ]
4.2 Movie Page /movie/{id}
Section: "Fan Reactions"
Horizontal scroll OR mini vertical list
Only reactions for that movie
4.3 Upload Flow

Entry points:

Global page button
Movie page button

Steps:

Select or record video
Preview
Add caption
Upload

Constraints:

Max 30 seconds
Max size 20MB
5. Cloudinary Integration
5.1 Backend Signature

POST /api/upload-signature

Returns:

{
  "signature": "...",
  "timestamp": 123456,
  "apiKey": "..."
}
5.2 Frontend Upload

POST to:

https://api.cloudinary.com/v1_1/<cloud>/video/upload

Params:

file
timestamp
signature
api_key
upload_preset = "fan_reactions"
5.3 Thumbnail

Use:

https://res.cloudinary.com/<cloud>/video/upload/so_2/<public_id>.jpg
6. API Design
6.1 Create Reaction

POST /api/reactions

Body:

{
  "movieId": 123,
  "videoUrl": "...",
  "thumbnailUrl": "...",
  "caption": "..."
}
6.2 Fetch Feed

GET /api/reactions?type=global
GET /api/reactions?movieId=123

Rules:

limit = 20
order = latest first (MVP)
6.3 Like

POST /api/reactions/:id/like

6.4 View

POST /api/reactions/:id/view

Trigger:

after 2 seconds of playback
7. Frontend Logic
7.1 Reels Player
Track current index
Autoplay current
Pause others
Preload next video
7.2 Lazy Loading
Load 1 current + 1 next
Fetch more when near end
7.3 Optimistic UI

Likes:

increment instantly
sync with backend
8. Performance
Use Cloudinary transformations:
q_auto,f_auto,vc_auto
Preload next video
Avoid loading all videos
9. Security
Validate video size + type
Signed uploads only
Basic rate limiting (optional)
10. MVP Scope (STRICT)

INCLUDE:

Upload
Feed
Like
View

EXCLUDE:

Comments
AI ranking
Recommendations
Notifications
11. Future Enhancements (NOT NOW)
Ranking algorithm
AI moderation
Personalized feed
Comments system
12. Definition of Done

✔ Upload works
✔ Video plays smoothly
✔ Feed loads in batches
✔ Like & view update correctly
✔ Works on movie page + global page
✔ No crashes