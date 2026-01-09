# Quick Reference - PlanOS

## 🚀 Quick Start Commands

### Development
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

### Git Commands
```bash
# Check status
git status

# Add all changes
git add .

# Commit changes
git commit -m "Your message"

# Push to GitHub
git push origin main

# Pull latest changes
git pull origin main

# Create new branch
git checkout -b feature/feature-name

# Switch to main branch
git checkout main
```

## 📁 Important Files

- `.env` - Environment variables (DO NOT commit!)
- `.env.example` - Template for environment variables
- `README.md` - Project documentation
- `GITHUB_SETUP.md` - GitHub setup instructions
- `CONTRIBUTING.md` - Contribution guidelines
- `LICENSE` - MIT License

## 🔑 Environment Variables

Required variables in `.env`:
- `GOOGLE_SHEET_ID` - Your Google Sheet ID
- `GOOGLE_SERVICE_ACCOUNT_EMAIL` - Service account email
- `GOOGLE_PRIVATE_KEY` - Service account private key
- `LINE_CHANNEL_ID` - LINE channel ID
- `LINE_CHANNEL_SECRET` - LINE channel secret
- `LINE_CALLBACK_URL` - LINE callback URL
- `SESSION_SECRET` - Random secret string

## 🌐 URLs

### Local Development
- App: http://localhost:3000
- Dashboard: http://localhost:3000/dashboard
- Profile: http://localhost:3000/profile
- Admin Users: http://localhost:3000/admin/users
- Admin Departments: http://localhost:3000/admin/departments

### API Endpoints
- `/api/users` - User management
- `/api/departments` - Department management
- `/api/projects` - Project management
- `/api/audit-logs` - Audit logs
- `/api/me` - Current user info

## 🎯 User Roles

- **Admin**: Full access to all features
- **Manager**: Department and project management
- **User**: View and update assigned projects

## 📊 Google Sheets Structure

Required sheets in your Google Sheet:
1. **Users** - User accounts and roles
2. **Departments** - Department information
3. **Projects** - Project details
4. **AuditLogs** - System activity logs

## 🔧 Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

**Node modules issues:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

**Build errors:**
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

**Git conflicts:**
```bash
# Abort merge
git merge --abort

# Reset to last commit
git reset --hard HEAD
```

## 📝 Commit Message Convention

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

Examples:
```bash
git commit -m "feat: Add user profile editing"
git commit -m "fix: Resolve login redirect issue"
git commit -m "docs: Update README with new features"
```

## 🚀 Deployment Checklist

- [ ] Update environment variables
- [ ] Test build locally: `npm run build`
- [ ] Update LINE callback URL
- [ ] Configure Google Sheets permissions
- [ ] Set session secret
- [ ] Test production build: `npm start`
- [ ] Deploy to hosting platform
- [ ] Verify all features work in production

## 📞 Support

- GitHub Issues: Report bugs and request features
- Documentation: Check README.md for detailed info
- Contributing: See CONTRIBUTING.md for guidelines

---

**Happy coding! 🎉**
