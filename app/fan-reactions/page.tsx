import { ReelsPlayer } from '@/components/fan-reactions/ReelsPlayer';
import connectDB from '@/lib/db';
import { Reaction } from '@/models/Reaction';

export const metadata = {
  title: 'Fan Reactions | MovieFlix',
  description: 'Watch fan video reactions to your favorite movies',
};

async function getInitialReactions() {
  try {
    await connectDB();
    const reactions = await Reaction.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    return JSON.parse(JSON.stringify(reactions));
  } catch {
    return [];
  }
}

export default async function FanReactionsPage() {
  const initialReactions = await getInitialReactions();

  return (
    <main className="w-full h-[100dvh] overflow-hidden bg-black">
      <ReelsPlayer initialReactions={initialReactions} />
    </main>
  );
}
