// API Route: Sync Puter user to MongoDB
import { connectToDatabase, User } from "~/lib/mongodb.server";

export async function action({ request }: { request: Request }) {
    if (request.method !== "POST") {
        return Response.json({ error: "Method not allowed" }, { status: 405 });
    }

    try {
        const { puterId, username, email } = await request.json();

        if (!puterId || !username) {
            return Response.json({ error: "puterId and username are required" }, { status: 400 });
        }

        // Connect to MongoDB
        await connectToDatabase();

        // Find or create user
        let user = await User.findOne({ puterId });

        if (!user) {
            // Create new user
            user = new User({
                puterId,
                username,
                email,
                plan: 'free',
                usageCount: 0,
                maxUsage: 5,
            });
            await user.save();
            console.log(`✅ New user created: ${username} (${puterId})`);
        } else {
            // Update existing user
            user.username = username;
            if (email) user.email = email;
            user.updatedAt = new Date();
            await user.save();
            console.log(`✅ User updated: ${username} (${puterId})`);
        }

        return Response.json({
            puterId: user.puterId,
            username: user.username,
            email: user.email,
            plan: user.plan,
            usageCount: user.usageCount,
            maxUsage: user.maxUsage,
        });
    } catch (error) {
        console.error("Error syncing user:", error);
        return Response.json({ error: "Failed to sync user" }, { status: 500 });
    }
}
