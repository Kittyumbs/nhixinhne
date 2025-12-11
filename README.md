# Nhixinhne - Affiliate Bio Site

Trang bio affiliate với quản lý sản phẩm và danh mục, tích hợp Firebase + Google Drive.

## 🚀 Tính năng

- ✅ **Mobile-first design** với dark mode
- ✅ **Quản lý danh mục sản phẩm** với icon tùy chỉnh
- ✅ **Upload hình ảnh** avatar và background qua Google Drive
- ✅ **Real-time sync** giữa edit và view
- ✅ **Admin dashboard** với form validation
- ✅ **Firebase backend** cho data persistence

## 🛠 Tech Stack

- **Frontend**: HTML, Tailwind CSS, JavaScript
- **Backend**: Node.js, Express, Firebase Admin SDK
- **Storage**: Google Drive API
- **Database**: Firestore
- **Deployment**: Vercel (frontend) + Render (backend)

## 📦 Cài đặt

### 1. Clone repository
```bash
git clone <repository-url>
cd nhixinhne
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup environment variables
Copy `.env.example` to `.env` và điền thông tin:

```bash
# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/...

# Google Drive API
GOOGLE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_GOOGLE_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
GOOGLE_DRIVE_FOLDER_ID=optional-folder-id

# Server
PORT=3000
```

### 4. Run locally
```bash
npm run dev
```

## 🚀 Deployment

### Frontend (Vercel)
1. Push code lên GitHub
2. Connect repository với Vercel
3. Deploy automatically

### Backend (Render)
1. **Connect GitHub** repository
2. **Build Command**: `npm install`
3. **Start Command**: `npm start`
4. **Environment Variables**: Copy từ `.env`

## 📋 API Endpoints

```
GET  /health              # Health check
GET  /api/site-data       # Lấy dữ liệu site
POST /api/site-data       # Lưu dữ liệu site
POST /api/upload/avatar   # Upload avatar
POST /api/upload/background # Upload background
```

## 🔧 Firebase Setup

### 1. Tạo Firebase Project
- Vào [Firebase Console](https://console.firebase.google.com/)
- Create project > Add Firestore Database

### 2. Tạo Service Account
- Project settings > Service accounts
- Generate new private key
- Download JSON file

### 3. Firestore Rules (Production)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /site-data/{document} {
      allow read: if true;
      allow write: if request.auth != null ||
                   request.headers.get('origin') == 'https://your-vercel-domain.vercel.app';
    }
  }
}
```

## 🔑 Google Drive Setup

### 1. Enable Google Drive API
- Vào [Google Cloud Console](https://console.cloud.google.com/)
- APIs & Services > Library > Google Drive API > Enable

### 2. Tạo Service Account
- IAM & Admin > Service Accounts > Create Service Account
- Grant Editor role
- Create JSON key

### 3. Domain Verification (Optional)
- Google Search Console để verify domain
- Giúp tăng quota upload

## 📱 Sử dụng

### Admin Panel (`/edit.html`)
1. **Thay đổi thông tin**: Tên, bio, avatar
2. **Upload hình nền**: Chọn file > preview > save
3. **Quản lý danh mục**: Thêm/sửa/xóa categories
4. **Thêm sản phẩm**: Chọn category > add product
5. **Xuất bản**: Click "Xuất bản" để sync lên production

### Public Site (`/index.html`)
- Auto load dữ liệu mới nhất từ Firebase
- Click categories để xem sản phẩm
- Click products để mở affiliate links

## 🐛 Troubleshooting

### Lỗi "Missing or insufficient permissions"
- Check Firestore rules đã deploy
- Verify Firebase credentials

### Upload hình thất bại
- Check Google Drive API credentials
- Verify service account permissions
- Check quota limits

### CORS errors
- Add your domains to CORS origins trong server.js
- Check environment variables

## 📈 Performance

- **Lazy loading** cho images
- **CDN** cho static assets
- **Compression** enabled
- **Caching** headers optimized

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT License - sử dụng tự do cho mục đích cá nhân và thương mại.

---

**Made with ❤️ for affiliate marketers**
