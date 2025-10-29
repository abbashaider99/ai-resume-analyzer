// API Route: Get user's resumes
import { connectToDatabase, Resume } from "~/lib/mongodb.server";

export async function loader({ params }: { params: { puterId: string } }) {
    try {
        const { puterId } = params;

        await connectToDatabase();

        const resumes = await Resume.find({ puterId }).sort({ createdAt: -1 });

        return Response.json(resumes);
    } catch (error) {
        console.error("Error getting resumes:", error);
        return Response.json({ error: "Failed to get resumes" }, { status: 500 });
    }
}
