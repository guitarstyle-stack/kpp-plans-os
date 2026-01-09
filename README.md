# PlanOS - Project Management System

A modern, full-featured project management system built with Next.js, featuring LINE authentication, Google Sheets integration, and comprehensive admin capabilities.

## 🚀 Features

### Core Functionality
- **Project Management**: Create, track, and manage projects with detailed progress tracking
- **User Management**: Role-based access control (Admin, Manager, User)
- **Department Management**: Organize users and projects by departments
- **Audit Logging**: Complete audit trail of all system activities
- **Reports & Analytics**: Comprehensive reporting and data visualization

### Authentication & Security
- **LINE Login Integration**: Secure authentication via LINE platform
- **Session Management**: JWT-based session handling with secure cookies
- **Role-Based Access Control**: Granular permissions for different user roles
- **Audit Trail**: Track all user actions and system changes

### Data Management
- **Google Sheets Backend**: Leverages Google Sheets as a flexible database
- **Real-time Updates**: Live data synchronization
- **Data Export**: Export reports and project data

### User Interface
- **Modern Design**: Clean, responsive UI built with Tailwind CSS
- **Dark Mode Support**: Eye-friendly dark theme
- **Interactive Charts**: Data visualization with Chart.js
- **Toast Notifications**: Real-time feedback for user actions

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Authentication**: LINE Login API
- **Database**: Google Sheets API
- **Charts**: Chart.js + React-ChartJS-2
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast

## 📋 Prerequisites

Before you begin, ensure you have:
- Node.js 18+ installed
- A Google Cloud Project with Sheets API enabled
- A LINE Developers account with a channel created
- Service account credentials from Google Cloud

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/PlanOS.git
   cd PlanOS
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   
   Then edit `.env` with your credentials:
   ```env
   PORT=3000
   GOOGLE_SHEET_ID=your_google_sheet_id_here
   GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account_email@project.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   
   # LINE Login Credentials
   LINE_CHANNEL_ID=your_line_channel_id
   LINE_CHANNEL_SECRET=your_line_channel_secret
   LINE_CALLBACK_URL=http://localhost:3000/auth/line/callback
   
   # Session Secret (random string)
   SESSION_SECRET=change_this_to_a_secure_random_string
   ```

4. **Set up Google Sheets**
   
   Create a Google Sheet with the following sheets:
   - `Users` - User information and roles
   - `Departments` - Department data
   - `Projects` - Project details and status
   - `AuditLogs` - System audit trail

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔑 Configuration

### Google Cloud Setup

1. Create a project in [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the Google Sheets API
3. Create a Service Account
4. Download the JSON key file
5. Share your Google Sheet with the service account email
6. Copy the credentials to your `.env` file

### LINE Developers Setup

1. Create a channel in [LINE Developers Console](https://developers.line.biz/)
2. Get your Channel ID and Channel Secret
3. Set the callback URL to `http://localhost:3000/auth/line/callback` (or your production URL)
4. Add the credentials to your `.env` file

## 📁 Project Structure

```
PlanOS/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   ├── auth/              # Authentication routes
│   │   ├── dashboard/         # Dashboard pages
│   │   └── profile/           # User profile
│   ├── components/            # React components
│   │   ├── admin/            # Admin-specific components
│   │   ├── layout/           # Layout components
│   │   └── ui/               # Reusable UI components
│   └── lib/                   # Utility functions and services
│       ├── auth.ts           # Authentication utilities
│       ├── googleSheets.ts   # Google Sheets integration
│       ├── dataService.ts    # Data management
│       └── types.ts          # TypeScript type definitions
├── public/                    # Static assets
├── .env.example              # Environment variables template
└── package.json              # Project dependencies
```

## 🚦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🔐 User Roles

- **Admin**: Full system access, user management, audit logs
- **Manager**: Department and project management
- **User**: View and update assigned projects

## 📊 Features Overview

### Dashboard
- Overview of all projects and their status
- Quick access to recent activities
- Project progress visualization

### Project Management
- Create and edit projects
- Track project progress (0-100%)
- Assign projects to users
- Set project status and deadlines

### User Management (Admin)
- Create and manage user accounts
- Assign roles and departments
- View user activity

### Department Management (Admin)
- Create and organize departments
- Assign managers to departments
- Track department projects

### Audit Logs (Admin)
- Complete system activity log
- Filter by user, action, or date
- Export audit data

### Reports
- Project status reports
- User activity reports
- Department performance metrics

## 🌐 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Update LINE callback URL to your production domain
5. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- AWS
- Google Cloud Run

Make sure to:
- Set all environment variables
- Update the LINE callback URL
- Configure the session secret

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License.

## 🐛 Known Issues

- None at the moment

## 📧 Support

For support, please open an issue in the GitHub repository.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Authentication via [LINE Login](https://developers.line.biz/en/docs/line-login/)
- Data storage using [Google Sheets API](https://developers.google.com/sheets/api)
