# GitHub Setup Guide for PlanOS

This guide will help you push your PlanOS project to GitHub.

## Prerequisites

- A GitHub account (create one at https://github.com if you don't have one)
- Git installed on your computer (already done ✓)
- Your project is ready and committed (already done ✓)

## Step 1: Create a New Repository on GitHub

1. Go to https://github.com
2. Click the "+" icon in the top right corner
3. Select "New repository"
4. Fill in the repository details:
   - **Repository name**: `PlanOS` (or your preferred name)
   - **Description**: "A modern project management system with LINE authentication and Google Sheets integration"
   - **Visibility**: Choose "Public" or "Private"
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
5. Click "Create repository"

## Step 2: Connect Your Local Repository to GitHub

After creating the repository, GitHub will show you commands. Use these commands in your terminal:

### Option A: If you created a new repository (recommended)

```bash
# Add the remote repository
git remote add origin https://github.com/YOUR_USERNAME/PlanOS.git

# Verify the remote was added
git remote -v

# Push your code to GitHub
git push -u origin main
```

### Option B: If you want to use SSH instead of HTTPS

```bash
# Add the remote repository with SSH
git remote add origin git@github.com:YOUR_USERNAME/PlanOS.git

# Verify the remote was added
git remote -v

# Push your code to GitHub
git push -u origin main
```

**Note**: Replace `YOUR_USERNAME` with your actual GitHub username.

## Step 3: Verify Your Push

1. Go to your repository on GitHub: `https://github.com/YOUR_USERNAME/PlanOS`
2. You should see all your files and the README displayed
3. Check that the commit message appears correctly

## Step 4: Set Up Repository Settings (Optional but Recommended)

### Add Topics/Tags
1. Go to your repository on GitHub
2. Click "About" (gear icon) on the right side
3. Add topics: `nextjs`, `typescript`, `project-management`, `line-login`, `google-sheets`, `tailwindcss`

### Add Repository Description
- Use the same description: "A modern project management system with LINE authentication and Google Sheets integration"

### Enable Issues and Discussions
- Go to Settings → Features
- Enable "Issues" for bug tracking
- Enable "Discussions" for community discussions (optional)

## Step 5: Protect Sensitive Information

**IMPORTANT**: Make sure you never commit these files:
- ✅ `.env` (already in .gitignore)
- ✅ `service-account.json` (already in .gitignore)
- ✅ `node_modules/` (already in .gitignore)
- ✅ `.next/` (already in .gitignore)

If you accidentally committed sensitive data:
```bash
# Remove file from git history (use with caution!)
git rm --cached .env
git commit -m "Remove sensitive file"
git push origin main
```

## Step 6: Future Updates

When you make changes to your project:

```bash
# Check what files have changed
git status

# Add all changed files
git add .

# Or add specific files
git add path/to/file

# Commit with a meaningful message
git commit -m "Your descriptive commit message"

# Push to GitHub
git push origin main
```

## Common Git Commands

```bash
# Check repository status
git status

# View commit history
git log --oneline

# Create a new branch
git checkout -b feature/new-feature

# Switch branches
git checkout main

# Merge a branch
git merge feature/new-feature

# Pull latest changes from GitHub
git pull origin main

# View differences
git diff
```

## Troubleshooting

### Authentication Issues

If you get authentication errors when pushing:

**For HTTPS:**
1. GitHub no longer accepts password authentication
2. You need to create a Personal Access Token (PAT):
   - Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Generate new token with `repo` scope
   - Use this token as your password when prompted

**For SSH:**
1. Generate SSH key: `ssh-keygen -t ed25519 -C "your_email@example.com"`
2. Add to ssh-agent: `ssh-add ~/.ssh/id_ed25519`
3. Add public key to GitHub: Settings → SSH and GPG keys → New SSH key
4. Copy key: `cat ~/.ssh/id_ed25519.pub`

### Branch Name Issues

If your default branch is `master` instead of `main`:
```bash
git branch -M main
git push -u origin main
```

### Large Files

If you have large files (>100MB), consider using Git LFS:
```bash
git lfs install
git lfs track "*.psd"
git add .gitattributes
```

## Next Steps

1. ✅ Push your code to GitHub
2. 📝 Update the README with your actual GitHub repository URL
3. 🔒 Set up branch protection rules (Settings → Branches)
4. 🤝 Invite collaborators if working in a team
5. 📊 Set up GitHub Actions for CI/CD (optional)
6. 🌐 Deploy to Vercel or another hosting platform

## Resources

- [GitHub Documentation](https://docs.github.com)
- [Git Basics](https://git-scm.com/book/en/v2/Getting-Started-Git-Basics)
- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [Markdown Guide](https://guides.github.com/features/mastering-markdown/)

---

**Your project is now ready for GitHub! 🚀**

For any issues, refer to the troubleshooting section or open an issue in the repository.
