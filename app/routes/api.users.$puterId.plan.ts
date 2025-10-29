// API Route: Update user plan
import { connectToDatabase, User } from "~/lib/mongodb.server";

export async function action({ params, request }: { params: { puterId: string }, request: Request }) {
    try {
        const { puterId } = params;
        const { plan } = await request.json();

        if (!['free', 'pro', 'enterprise'].includes(plan)) {
            return Response.json({ error: "Invalid plan type" }, { status: 400 });
        }

        await connectToDatabase();

        const user = await User.findOne({ puterId });

        if (!user) {
            return Response.json({ error: "User not found" }, { status: 404 });
        }

        user.plan = plan;
        user.maxUsage = plan === 'free' ? 5 : -1; // -1 means unlimited
        user.updatedAt = new Date();
        await user.save();

        console.log(`✅ User plan updated: ${user.username} -> ${plan}`);
        
        return Response.json({
            puterId: user.puterId,
            username: user.username,
            plan: user.plan,
            maxUsage: user.maxUsage,
        });
    } catch (error) {
        console.error("Error updating user plan:", error);
        return Response.json({ error: "Failed to update plan" }, { status: 500 });
    }
}
