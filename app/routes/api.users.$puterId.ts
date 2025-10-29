// API Route: Get user by Puter ID
import { connectToDatabase, User } from "~/lib/mongodb.server";

export async function loader({ params }: { params: { puterId: string } }) {
    try {
        const { puterId } = params;

        await connectToDatabase();

        const user = await User.findOne({ puterId }).populate('resumes');

        if (!user) {
            return Response.json({ error: "User not found" }, { status: 404 });
        }

        return Response.json({
            puterId: user.puterId,
            username: user.username,
            email: user.email,
            plan: user.plan,
            usageCount: user.usageCount,
            maxUsage: user.maxUsage,
            resumes: user.resumes,
            createdAt: user.createdAt,
        });
    } catch (error) {
        console.error("Error getting user:", error);
        return Response.json({ error: "Failed to get user" }, { status: 500 });
    }
}
