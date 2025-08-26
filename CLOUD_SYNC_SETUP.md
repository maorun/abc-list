# Cloud Sync Setup Guide

This guide walks you through setting up the cloud synchronization and backup system for ABC-List.

## Prerequisites

- A Supabase account (free tier available)
- A Google Cloud Platform account for OAuth
- Node.js 20+ and npm installed

## Step 1: Supabase Project Setup

### 1.1 Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `abc-list-cloud-sync`
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait for the project to be ready (2-3 minutes)

### 1.2 Configure Database

1. Go to the SQL Editor in your Supabase dashboard
2. Copy the contents of `supabase-schema.sql` from this repository
3. Paste it into the SQL editor and click "Run"
4. Verify that all tables were created successfully

### 1.3 Get Project Credentials

1. Go to Settings > API in your Supabase dashboard
2. Copy your **Project URL** and **anon/public key**
3. Keep these safe - you'll need them later

## Step 2: Google OAuth Setup

### 2.1 Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable the "Google+ API" (if not already enabled)

### 2.2 Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type
3. Fill in the required information:
   - **App name**: ABC-List
   - **User support email**: Your email
   - **Developer contact information**: Your email
4. Add scopes: `email`, `profile`, `openid`
5. Save and continue

### 2.3 Create OAuth Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Enter name: `ABC-List Cloud Sync`
5. Add authorized origins:
   - `http://localhost:5173` (for development)
   - `https://your-domain.com` (for production)
6. Add authorized redirect URIs:
   - `https://your-supabase-project.supabase.co/auth/v1/callback`
   - (Replace with your actual Supabase project URL)
7. Click "Create"
8. Copy the **Client ID** and **Client Secret**

## Step 3: Configure Supabase Authentication

### 3.1 Enable Google Provider

1. Go to Authentication > Providers in your Supabase dashboard
2. Find "Google" and click the toggle to enable it
3. Enter your Google OAuth credentials:
   - **Client ID**: From Step 2.3
   - **Client Secret**: From Step 2.3
4. Click "Save"

### 3.2 Configure URL Settings

1. Go to Authentication > URL Configuration
2. Set your Site URL:
   - Development: `http://localhost:5173/`
   - Production: `https://your-domain.com/`
3. Add Redirect URLs:
   - Development: `http://localhost:5173/`
   - Production: `https://your-domain.com/`

## Step 4: Application Configuration

### 4.1 Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` with your Supabase credentials:
   ```bash
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

### 4.2 Install Dependencies

```bash
npm install
```

### 4.3 Test the Setup

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser to `http://localhost:5173/`

3. Look for the "Cloud-Sync" button in the navigation

4. Click it and test the Google OAuth flow

## Step 5: Production Deployment

### 5.1 Update Environment Variables

For production deployment, ensure your hosting platform has the environment variables set:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 5.2 Update OAuth Settings

1. Update Google OAuth settings with your production domain
2. Update Supabase authentication URLs with your production domain

### 5.3 Test Production Features

- [ ] User can sign in with Google
- [ ] Data syncs between devices
- [ ] Offline functionality works
- [ ] Backups can be created and restored
- [ ] Conflict resolution works with simultaneous edits

## Security Considerations

### Row Level Security (RLS)

The provided SQL schema automatically sets up RLS policies that ensure:
- Users can only access their own data
- No cross-user data leakage
- Secure by default

### Environment Variables

**Never commit environment variables to your repository!**

- Use `.env.local` for development
- Use your hosting platform's environment variable settings for production
- Keep your Supabase keys secure

### HTTPS Requirements

- OAuth requires HTTPS in production
- Supabase requires HTTPS for security
- Ensure your hosting platform provides SSL/TLS

## Troubleshooting

### Common Issues

**1. "supabaseUrl is required" error**
- Check that your environment variables are properly set
- Ensure `.env.local` is in the project root
- Restart your development server after adding environment variables

**2. OAuth redirect error**
- Verify your redirect URLs match exactly in Google Console and Supabase
- Check that you're using the correct domain (http vs https)

**3. Database connection errors**
- Verify your Supabase URL and anon key are correct
- Check that the database schema was applied successfully
- Ensure RLS policies are properly configured

**4. Sync not working**
- Check browser console for JavaScript errors
- Verify user is properly authenticated
- Check network tab for failed requests

### Getting Help

1. Check the browser console for detailed error messages
2. Review the Supabase dashboard for authentication and database logs
3. Ensure all setup steps were completed correctly
4. Test with a clean browser session (incognito mode)

## Feature Testing Checklist

After setup, test these key features:

### Authentication
- [ ] Google OAuth sign-in works
- [ ] User session persists across browser restarts
- [ ] Sign-out works properly
- [ ] User email displays correctly

### Data Synchronization
- [ ] Creating ABC-List syncs to cloud
- [ ] Data appears on second device/browser
- [ ] Offline changes sync when back online
- [ ] Real-time updates work (if enabled)

### Conflict Resolution
- [ ] Simultaneous edits trigger conflict detection
- [ ] Conflict resolution strategies work
- [ ] Data integrity maintained during conflicts

### Backup and Restore
- [ ] Backups can be created successfully
- [ ] Backup list shows historical backups
- [ ] Restore functionality works correctly
- [ ] Data integrity verified after restore

### Privacy Features
- [ ] Data export works
- [ ] Complete data deletion works
- [ ] User controls are accessible

## Performance Optimization

### Production Settings

For optimal performance in production:

1. **Enable Realtime (Optional)**:
   ```sql
   ALTER publication supabase_realtime ADD TABLE user_abc_lists;
   -- Add other tables as needed
   ```

2. **Configure Sync Intervals**:
   - Set longer intervals for better performance
   - Use intelligent batching for multiple changes

3. **Monitor Usage**:
   - Check Supabase dashboard for usage statistics
   - Monitor for rate limiting or quota issues

4. **Optimize Queries**:
   - Use indexed columns for better performance
   - Consider pagination for large datasets

## Support and Maintenance

### Regular Maintenance

- Monitor Supabase usage and quotas
- Review authentication logs periodically
- Update environment variables if credentials change
- Test backup/restore functionality regularly

### Monitoring

- Set up alerts for authentication failures
- Monitor sync success rates
- Track user adoption of cloud features

This completes the setup guide for ABC-List's cloud synchronization system. The system is now ready for production use with full cross-device synchronization, conflict resolution, and backup capabilities.
