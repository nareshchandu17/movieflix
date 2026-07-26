/**
 * @file mongodb.ts
 * @description Consolidated MongoDB connection helper delegating to lib/db.ts to maintain a unified Mongoose connection pool.
 * 
 * @author CHANDU NARESH <nareshchandu27@gmail.com>
 * @copyright (c) 2026 MovieFlix. All rights reserved.
 */

import { connectDB } from "@/lib/db";

export { connectDB };
export default connectDB;
