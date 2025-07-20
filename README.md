## 🗄️ Database Design
User
Represents each authenticated user (Google OAuth supported).

Field	Type	Description
id	String	Primary key (CUID)
googleId	String	Google OAuth ID (unique)
email	String	User email (unique)
name	String	Full name
picture	String?	Profile picture URL (optional)
accessToken	String?	App-specific access token (optional)
refreshToken	String?	App-specific refresh token (optional)
googleAccessToken	String?	Google OAuth access token (optional)
googleRefreshToken	String?	Google OAuth refresh token (optional)
createdAt	DateTime	Timestamp of account creation
updatedAt	DateTime	Auto-updated timestamp
Relations		notes, eventLogs (1:N)

Note
Stores personal notes linked to a specific video for a user.

Field	Type	Description
id	String	Primary key (CUID)
userId	String	Foreign key → User.id
videoId	String	YouTube video ID
content	String	The actual note content
createdAt	DateTime	Timestamp of note creation
updatedAt	DateTime	Auto-updated timestamp

EventLog
Captures every user action for auditing and analytics.

Field	Type	Description
id	String	Primary key (CUID)
userId	String	Foreign key → User.id
action	String	Action performed (e.g. edit_title)
metadata	Json?	Additional details for the event
timestamp	DateTime	When the action occurred

🔗 Relationships
User ↔ Notes: One-to-many (User has many Notes)

User ↔ EventLogs: One-to-many (User has many EventLogs)


## 🗄️ API Design


🔐 Google OAuth
GET /api/auth/google
→ Initiates Google OAuth login (requests YouTube + profile scopes).

GET /api/auth/google/callback
→ Handles OAuth callback, returns accessToken, refreshToken, and user info.

📹 Video Management
GET /api/video/:videoId
→ Fetch details of a specific YouTube video.

PATCH /api/video/:videoId/metadata
→ Update the video's title and description.

💬 Comments
POST /api/video/:videoId/comment
→ Post a top-level comment on the video.

POST /api/comment/:commentId/reply
→ Reply to an existing comment.

DELETE /api/comment/:commentId
→ Delete a comment by its ID.

📝 Personal Notes
POST /api/notes
→ Add a personal note linked to a video.

GET /api/notes
→ Get all your personal notes.

📊 Event Logs
GET /api/video
→ Fetch all event logs (e.g., actions like commenting, editing metadata, etc.).