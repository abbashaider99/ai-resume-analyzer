// API Route: Increment usage count
import { connectToDatabase, User } from "~/lib/mongodb.server";

export async function action({ params }: { params: { puterId: string } }) {
    try {
        const { puterId } = params;

        await connectToDatabase();

        const user = await User.findOne({ puterId });

        if (!user) {
            return Response.json({ error: "User not found" }, { status: 404 });
        }

        user.usageCount += 1;
        user.updatedAt = new Date();
        await user.save();

        console.log(`✅ Usage incremented: ${user.username} (${user.usageCount}/${user.maxUsage})`);
        
        return Response.json({ 
            usageCount: user.usageCount, 
            maxUsage: user.maxUsage 
        });
    } catch (error) {
        console.error("Error incrementing usage:", error);
        return Response.json({ error: "Failed to increment usage" }, { status: 500 });
    }
}
