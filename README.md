🚧 Problems Faced While Building Smart Bookmark App
This document describes the main technical issues encountered during development and how they were resolved.
No major problems were faced in UI implementation — all challenges were related to authentication, Supabase configuration, database security, and realtime behavior.

🔐 1. Google OAuth Configuration Issues
Problem
Initial confusion about how to correctly configure Google OAuth between:
Google Cloud Console
Supabase Auth settings
Localhost vs Production URLs
Incorrect redirect/origin settings caused login failures or unexpected redirects.
Solution
Used Supabase’s default callback URL for Google OAuth
Added the production site URL in Supabase redirect settings
Configured Google Console as follows:
Authorized redirect URI:
https://<project-ref>.supabase.co/auth/v1/callback

No need to manually handle OAuth endpoints.

🔁 2. Redirect After Login Contained Access Token in URL
Problem
After successful login, the app redirected to a URL like:
https://app-url/#access_token=...&refresh_token=...

This caused confusion about whether authentication succeeded.
Cause
Supabase uses hash-based token delivery by default in client-side apps.
Solution
Handled session properly using:
supabase.auth.getSession()
supabase.auth.onAuthStateChange()

Once the session is read, the app behaves normally.


🛡️ 3. Data Security Warning (RLS Disabled)
Problem
Supabase displayed warning:
Anonymous data can be accessed through the Data API
This meant anyone with the public project URL could read/write data.
Cause
Row Level Security (RLS) was disabled.
Solution
Enabled RLS and added policies restricting access to the authenticated user only:
auth.uid() = user_id

This ensured bookmarks are private per user.

⚡ 4. Realtime Updates Not Working Initially
Problem
Bookmarks did not update automatically after add/edit/delete.
Changes appeared only after page reload.
Causes
Realtime not enabled properly
Missing user filter
Incorrect subscription configuration
Solution
Configured Supabase Realtime correctly:
supabase
  .channel("bookmarks-changes")
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "bookmarks",
      filter: `user_id=eq.${session.user.id}`,
    },
    fetchBookmarks
  )
  .subscribe();

Also I discovered that in Supabase, enabling database replication or ensuring the “realtime” toggle was on in the dashboard was necessary. Once I did that, the real-time event listeners started working as expected

Now updates sync across tabs instantly.

🗑️ 5. Delete Operation Not Reflecting in Realtime
Problem
Deleting a bookmark did not update the UI immediately.
The record was removed from the database, but the change was not reflected in the app unless the page was refreshed.
Cause
PostgreSQL did not send enough information about deleted rows to the realtime system.
By default, deleted row data is limited, which prevents the Supabase realtime filter (user_id) from matching the event.
Solution
Configured PostgreSQL to send the full row data for DELETE operations by running:
ALTER TABLE bookmarks REPLICA IDENTITY FULL;
After applying this setting, Supabase began emitting proper realtime events for DELETE actions, and the UI updated instantly without requiring a page reload.



✅ Conclusion
Most challenges were related to backend configuration rather than frontend development.
Key learnings:
Correct OAuth setup is critical
RLS is mandatory for security in Supabase
Realtime requires proper subscription configuration
Understanding session flow is essential
After resolving these issues, the application worked reliably in both local and production environments.

