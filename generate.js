const zlib = require('zlib');
const text = `graph TD
    Client[Client (Next.js App Router)]
    
    subgraph Frontend
        UI[React UI Components]
        State[Zustand / SWR]
        UI --> State
        State --> Client
    end

    subgraph API Gateway
        NextAPI[Next.js API Routes]
    end

    Client -->|HTTP/REST| NextAPI

    subgraph Backend Services
        DB[(MongoDB)]
        Cache[(Redis Cache)]
        Socket[Socket.io / Real-time]
    end

    NextAPI -->|Mongoose| DB
    NextAPI -->|ioredis| Cache
    NextAPI -->|WS| Socket

    subgraph External APIs
        TMDB[TMDB API]
        GoogleAI[Google AI]
        Payment[Stripe / Razorpay]
        Cloudinary[Cloudinary]
    end

    NextAPI --> TMDB
    NextAPI --> GoogleAI
    NextAPI --> Payment
    NextAPI --> Cloudinary
    
    Payment -.->|Webhooks| NextAPI`;

const data = JSON.stringify({ code: text, mermaid: { theme: 'default' } });
const compressed = zlib.deflateSync(Buffer.from(data, 'utf8'));
const encoded = compressed.toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
console.log('https://mermaid.ink/img/pako:' + encoded);
