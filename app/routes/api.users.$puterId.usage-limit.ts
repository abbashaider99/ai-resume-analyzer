// API Route: Check usage limit
import { connectToDatabase, User } from "~/lib/mongodb.server";

export async function loader({ params }: { params: { puterId: string } }) {
    try {
        const { puterId } = params;

        await connectToDatabase();

        const user = await User.findOne({ puterId });

        if (!user) {
            return Response.json({ error: "User not found" }, { status: 404 });
        }

        const canAnalyze = user.plan === 'pro' || user.plan === 'enterprise' 
            ? true 
            : user.usageCount < user.maxUsage;

        return Response.json({
            canAnalyze,
            currentUsage: user.usageCount,
            maxUsage: user.maxUsage,
            plan: user.plan,
        });
    } catch (error) {
        console.error("Error checking usage limit:", error);
        return Response.json({ error: "Failed to check usage limit" }, { status: 500 });
    }
}
