const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { google } = require('googleapis');
const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin from service account key
let serviceAccount;
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  } else {
    // Fallback to individual variables for development
    serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
    };
  }
} catch (error) {
  console.error('Error parsing FIREBASE_SERVICE_ACCOUNT_KEY:', error);
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id
});

const db = admin.firestore();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'https://nhixinhne.vercel.app', 'https://nhixinhne-a39e2.web.app'],
  credentials: true
}));
app.use(express.json());

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Google Drive authentication using OAuth
async function getDriveClient() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'urn:ietf:wg:oauth:2.0:oob' // For desktop apps
  );

  // Set refresh token
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN
  });

  // Refresh access token
  await oauth2Client.refreshAccessToken();

  const drive = google.drive({ version: 'v3', auth: oauth2Client });
  return drive;
}

// Upload image to Google Drive
async function uploadToGoogleDrive(fileBuffer, fileName, mimeType) {
  try {
    const drive = await getDriveClient();

    // Create file metadata
    const fileMetadata = {
      name: fileName,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID || 'root'], // Optional: specify folder
    };

    // Create media for upload
    const media = {
      mimeType: mimeType,
      body: fileBuffer,
    };

    // Upload file
    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id',
    });

    const fileId = response.data.id;

    // Make file publicly accessible
    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    // Get public URL
    const publicUrl = `https://drive.google.com/uc?id=${fileId}`;

    return {
      fileId,
      publicUrl,
      success: true
    };

  } catch (error) {
    console.error('Error uploading to Google Drive:', error);
    throw error;
  }
}

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Get site data
app.get('/api/site-data', async (req, res) => {
  try {
    const docRef = db.collection('site-data').doc('main');
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.json({
        profile: {
          name: "Mẹ Bỉm Sữa Review",
          bio: "Chia sẻ kinh nghiệm nuôi dạy con & săn deal hot cho bé yêu 🍼 Follow để nhận voucher mỗi ngày nhé!",
          avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuD4-4nseipxqo0kUCZE9uFM44MdTSYdXZK7Ip6KdlyymxoMUAFfS7Ve06-Q9hHGxjPluC6X1APdZdN4rucbf81eaxjkm_YhmgvFAXw4pcASA-ix8llEXZC5nUN6SacEV2XF_k-dtb9Yva94yHVEtkau6hvENT-rlCm-EdLda-wSIKp47tOJkZDAYu-1VrHNM-2ra5qRFgsaqhl86noxOuc2f75yKQwk7z-_QUC1XkJ0rEhR3XHAN6BLxLkkhAlcI2nDPjqbfeDSZ3h2"
        },
        backgroundImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuC8aAcLjxpyVZyPCmL72kiLClze8F-26nZRzXjNA-qmY4h-RzSJhNeTrZLXfhEr5bEkoErKSv2uzqv6I_Z1c0WGToWBBo8lmLUNeAu_LDe-B6S3W7w34pYYpdPQrqxAz8xq3TpZqdZYGIbp69Ua_oGY5QBQh5-87_vbnvnV7ZBjOqxAz-WTUZIAhSwh7ZlLA7pHlcbVbQ-UyX1jMuk4iQ_-RC6DX9nJz-Q_qINfaQcsZmJBDXDCP-yJdKV9S66Jyooe_Tw2Che6pEPO",
        categories: []
      });
    }

    res.json(doc.data());
  } catch (error) {
    console.error('Error getting site data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Save site data
app.post('/api/site-data', async (req, res) => {
  try {
    const siteData = req.body;
    siteData.lastUpdated = new Date().toISOString();

    const docRef = db.collection('site-data').doc('main');
    await docRef.set(siteData);

    res.json({ success: true, message: 'Site data saved successfully' });
  } catch (error) {
    console.error('Error saving site data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload avatar
app.post('/api/upload/avatar', upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.file;
    const fileName = `avatar-${Date.now()}.${file.mimetype.split('/')[1]}`;

    console.log('Uploading avatar:', fileName);

    const uploadResult = await uploadToGoogleDrive(
      file.buffer,
      fileName,
      file.mimetype
    );

    res.json({
      success: true,
      fileId: uploadResult.fileId,
      publicUrl: uploadResult.publicUrl,
      message: 'Avatar uploaded successfully'
    });

  } catch (error) {
    console.error('Error uploading avatar:', error);
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
});

// Upload background image
app.post('/api/upload/background', upload.single('background'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.file;
    const fileName = `background-${Date.now()}.${file.mimetype.split('/')[1]}`;

    console.log('Uploading background:', fileName);

    const uploadResult = await uploadToGoogleDrive(
      file.buffer,
      fileName,
      file.mimetype
    );

    res.json({
      success: true,
      fileId: uploadResult.fileId,
      publicUrl: uploadResult.publicUrl,
      message: 'Background uploaded successfully'
    });

  } catch (error) {
    console.error('Error uploading background:', error);
    res.status(500).json({ error: 'Failed to upload background' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
    }
  }

  if (error.message === 'Only image files are allowed!') {
    return res.status(400).json({ error: 'Only image files are allowed!' });
  }

  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
