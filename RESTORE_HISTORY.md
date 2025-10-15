Backup bundle
----------------
A full backup of the repository history was created before rewriting the Git history.

Bundle path:
C:\Coding\React Learning\airesume\ai-resume-analyzer-backup.bundle

Restoring from the bundle
-------------------------
1. Create a new empty directory and change into it:
   mkdir restore-repo; cd restore-repo

2. Clone the remote (optional) or initialize a new repo and fetch the bundle:
   git init
   git remote add origin <your-remote-url>

3. Verify the bundle:
   git bundle verify "C:\\Coding\\React Learning\\airesume\\ai-resume-analyzer-backup.bundle"

4. Fetch the bundle refs into your local repo:
   git fetch "C:\\Coding\\React Learning\\airesume\\ai-resume-analyzer-backup.bundle" refs/heads/*:refs/remotes/bundle/*

5. List available branches from the bundle:
   git branch -r | grep bundle/

6. Create a branch from the desired bundle branch (example `bundle/main`):
   git checkout -b restored-main bundle/main

7. Push the restored branch to a remote if desired:
   git push origin restored-main

Notes
-----
- The bundle contains the full commit history as it existed when the bundle was created.
- Keep the bundle in a safe place until you're sure you won't need to restore history.
