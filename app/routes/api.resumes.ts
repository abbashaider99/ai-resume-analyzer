// API Route: Save resume to MongoDB
import { connectToDatabase, Resume, User } from "~/lib/mongodb.server";

export async function action({ request }: { request: Request }) {
    try {
        const { id, puterId, companyName, jobTitle, jobDescription, resumePath, imagePath, feedback } = await request.json();

        if (!id || !puterId || !resumePath || !imagePath) {
            return Response.json({ error: "Missing required fields" }, { status: 400 });
        }

        await connectToDatabase();

        const user = await User.findOne({ puterId });

        if (!user) {
            return Response.json({ error: "User not found" }, { status: 404 });
        }

        // Check if resume already exists
        let resume = await Resume.findOne({ id });

        if (resume) {
            // Update existing resume
            resume.companyName = companyName;
            resume.jobTitle = jobTitle;
            resume.jobDescription = jobDescription;
            resume.feedback = feedback;
            await resume.save();
        } else {
            // Create new resume
            resume = new Resume({
                id,
                userId: user._id,
                puterId,
                companyName,
                jobTitle,
                jobDescription,
                resumePath,
                imagePath,
                feedback,
            });
            await resume.save();

            // Add resume to user's resumes array
            user.resumes.push(resume._id);
            await user.save();
        }

        console.log(`✅ Resume saved: ${id} for ${user.username}`);
        
        return Response.json({ 
            id: resume.id, 
            success: true 
        });
    } catch (error) {
        console.error("Error saving resume:", error);
        return Response.json({ error: "Failed to save resume" }, { status: 500 });
    }
}
