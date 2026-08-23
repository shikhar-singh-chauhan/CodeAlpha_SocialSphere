\# 🌐 SocialSphere



SocialSphere is a full-stack social media web application developed as part of my \*\*CodeAlpha Full Stack Development Internship\*\*.



The platform allows users to create profiles, share posts, interact through likes and comments, follow other users, receive notifications, and discover people through search.



\## 🚀 Features



\### 🔐 Authentication

\- User registration

\- User login

\- JWT-based authentication

\- Protected routes

\- Persistent login sessions

\- Secure password hashing



\### 👤 User Profiles

\- Personal user profiles

\- Profile picture upload

\- Edit profile information

\- Add/update bio

\- View other users' profiles

\- View user posts

\- Followers and following counts



\### 👥 Follow System

\- Follow other users

\- Unfollow users

\- Followers list

\- Following list

\- Personalized feed based on followed users



\### 📝 Posts

\- Create text posts

\- Upload images

\- Upload videos

\- Display post media

\- View posts in the home feed

\- View posts from user profiles

\- Delete your own posts



\### ❤️ Likes

\- Like posts

\- Unlike posts

\- Display like count

\- Prevent duplicate likes

\- Like notifications



\### 💬 Comments

\- Add comments to posts

\- View comments

\- Delete your own comments

\- Persistent comments stored in MongoDB

\- Comment notifications



\### 🔍 User Search

\- Search for users

\- Open profiles from search results

\- Discover other SocialSphere users



\### 🔔 Notifications

Notifications are generated for social interactions such as:



\- New followers

\- Post likes

\- Post comments



\### ☁️ Media Uploads

\- Profile photo uploads

\- Post image uploads

\- Post video uploads

\- Cloud-based media storage using Cloudinary



\## 🛠️ Tech Stack



\### Frontend



\- React.js

\- Vite

\- JavaScript

\- HTML5

\- CSS3

\- React Router

\- Axios



\### Backend



\- Node.js

\- Express.js

\- REST API

\- JWT Authentication

\- bcrypt



\### Database



\- MongoDB

\- MongoDB Atlas

\- Mongoose



\### Media Storage



\- Cloudinary

\- Multer

\- Multer Storage Cloudinary



\### Development Tools



\- Git

\- GitHub

\- Postman

\- Visual Studio Code

\- npm



\## 🏗️ Project Structure



```text

SocialSphere

│

├── backend

│   ├── controllers

│   │   ├── authController.js

│   │   ├── commentController.js

│   │   ├── notificationController.js

│   │   ├── postController.js

│   │   └── userController.js

│   │

│   ├── middleware

│   ├── models

│   │   ├── Notification.js

│   │   ├── Post.js

│   │   └── User.js

│   │

│   ├── routes

│   │   ├── authRoutes.js

│   │   ├── notificationRoutes.js

│   │   ├── postRoutes.js

│   │   └── userRoutes.js

│   │

│   ├── server.js

│   └── package.json

│

├── frontend

│   ├── public

│   ├── src

│   │   ├── components

│   │   │   ├── Navbar.jsx

│   │   │   └── PostCard.jsx

│   │   │

│   │   ├── context

│   │   │   └── AuthContext.jsx

│   │   │

│   │   ├── pages

│   │   │   ├── Home.jsx

│   │   │   ├── Login.jsx

│   │   │   ├── Notifications.jsx

│   │   │   ├── Profile.jsx

│   │   │   ├── Register.jsx

│   │   │   └── Search.jsx

│   │   │

│   │   ├── services

│   │   │   └── api.js

│   │   │

│   │   ├── App.jsx

│   │   ├── index.css

│   │   └── main.jsx

│   │

│   └── package.json

│

└── README.md

```



\## ⚙️ Installation \& Setup



\### 1. Clone the repository



```bash

git clone https://github.com/shikhar-singh-chauhan/CodeAlpha\_SocialSphere.git

```



Then:



```bash

cd CodeAlpha\_SocialSphere

```



\### 2. Install backend dependencies



```bash

cd backend

npm install

```



\### 3. Configure environment variables



Create a `.env` file inside the `backend` directory.



Example:



```env

PORT=5000



MONGO\_URI=your\_mongodb\_connection\_string



JWT\_SECRET=your\_jwt\_secret



CLOUDINARY\_CLOUD\_NAME=your\_cloudinary\_cloud\_name

CLOUDINARY\_API\_KEY=your\_cloudinary\_api\_key

CLOUDINARY\_API\_SECRET=your\_cloudinary\_api\_secret

```



> Never upload your real `.env` file, database password, JWT secret, or Cloudinary secret to GitHub.



\### 4. Start the backend



```bash

npm run dev

```



or:



```bash

node server.js

```



\### 5. Install frontend dependencies



Open another terminal:



```bash

cd frontend

npm install

```



\### 6. Start the frontend



```bash

npm run dev

```



Open the local URL displayed by Vite.



\## 🔄 Application Workflow



```text

Register / Login

&#x20;      ↓

&#x20;  User Profile

&#x20;      ↓

&#x20;   Home Feed

&#x20;      ↓

Create / View Posts

&#x20;      ↓

Images \& Videos

&#x20;      ↓

Like / Comment

&#x20;      ↓

Follow Other Users

&#x20;      ↓

Personalized Feed

&#x20;      ↓

&#x20;Notifications

```



\## 🗄️ Database Design



SocialSphere uses MongoDB to manage application data.



\### User



Stores information such as:



\- Name

\- Email

\- Password

\- Bio

\- Profile picture

\- Followers

\- Following



\### Post



Stores:



\- Post content

\- Author

\- Images/videos

\- Likes

\- Comments

\- Creation time



\### Notification



Stores social interaction notifications including:



\- Recipient

\- Sender

\- Notification type

\- Related post



\## 🔐 Security



SocialSphere includes:



\- Password hashing

\- JWT authentication

\- Protected API routes

\- User authorization

\- Environment variables for sensitive credentials

\- Ownership checks before deleting content



Users can only perform protected actions after authentication, and operations such as deleting comments/posts are restricted appropriately.



\## 📸 Project Screenshots



Recommended screenshots for this section:



1\. Login page

2\. Registration page

3\. Home feed

4\. Create post

5\. Image/video post

6\. User profile

7\. Search users

8\. Follow/unfollow

9\. Comments and likes

10\. Notifications



\## 🎥 Project Demo



A project demonstration video will showcase the complete SocialSphere workflow, including authentication, profiles, posts, media uploads, likes, comments, follow functionality, search, and notifications.



\## 🎯 CodeAlpha Internship Task



This project was developed as part of the \*\*CodeAlpha Full Stack Development Internship\*\*.



The objective of the Social Media Platform task was to build a mini social media application containing:



\- User profiles

\- Posts

\- Comments

\- Like functionality

\- Follow functionality

\- Frontend using HTML, CSS and JavaScript

\- Backend using Express.js and Node.js

\- Database management for users, posts, comments and followers



SocialSphere implements these core requirements and extends the application with authentication, media uploads, notifications, search, personalized feeds, and profile customization.



\## 🔮 Future Improvements



Possible future improvements include:



\- Image cropping before upload

\- Real-time chat

\- Real-time notifications

\- Post sharing

\- Saved posts

\- Stories

\- Hashtags

\- Advanced search

\- Account privacy controls

\- Production deployment



\## 👨‍💻 Developer



\*\*Shikhar Singh Chauhan\*\*



B.Tech Computer Science Engineering  

IPS Academy, Indore



\## 📄 License



This project was developed for educational and internship purposes.

