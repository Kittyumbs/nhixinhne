// Script để parse Firebase/Google Service Account JSON và tạo .env
// Run: node parse-service-account.js <path-to-json-file>

const fs = require('fs');
const path = require('path');

function parseFirebaseServiceAccount(jsonPath) {
    try {
        const jsonContent = fs.readFileSync(jsonPath, 'utf8');
        const serviceAccount = JSON.parse(jsonContent);

        const envContent = `# Firebase Admin SDK (Service Account)
FIREBASE_PROJECT_ID=${serviceAccount.project_id}
FIREBASE_PRIVATE_KEY_ID=${serviceAccount.private_key_id}
FIREBASE_PRIVATE_KEY="${serviceAccount.private_key.replace(/\n/g, '\\n')}"
FIREBASE_CLIENT_EMAIL=${serviceAccount.client_email}
FIREBASE_CLIENT_ID=${serviceAccount.client_id}
FIREBASE_CLIENT_X509_CERT_URL=${serviceAccount.client_x509_cert_url}

# Google Drive API (Service Account) - dùng cùng service account
GOOGLE_CLIENT_EMAIL=${serviceAccount.client_email}
GOOGLE_PRIVATE_KEY="${serviceAccount.private_key.replace(/\n/g, '\\n')}"
GOOGLE_DRIVE_FOLDER_ID=

# Server
PORT=3000
NODE_ENV=development`;

        fs.writeFileSync('.env', envContent);
        console.log('✅ Đã tạo file .env từ service account JSON');
        console.log('🔧 Kiểm tra và điều chỉnh các giá trị nếu cần');

    } catch (error) {
        console.error('❌ Lỗi khi parse service account JSON:', error.message);
        console.log('\n📝 Cách sử dụng:');
        console.log('1. Download service account JSON từ Firebase Console');
        console.log('2. Chạy: node parse-service-account.js path/to/serviceAccount.json');
        console.log('3. Hoặc copy thủ công các giá trị vào file .env');
    }
}

// Auto-detect nếu có file JSON trong thư mục
const jsonFiles = fs.readdirSync('.').filter(file => file.endsWith('.json'));
if (jsonFiles.length > 0) {
    console.log('🔍 Tìm thấy file JSON:', jsonFiles);
    const jsonFile = jsonFiles.find(file => file.includes('firebase') || file.includes('service'));
    if (jsonFile) {
        console.log(`📄 Sử dụng file: ${jsonFile}`);
        parseFirebaseServiceAccount(jsonFile);
    } else {
        console.log('📄 Sử dụng file đầu tiên:', jsonFiles[0]);
        parseFirebaseServiceAccount(jsonFiles[0]);
    }
} else {
    console.log('📄 Không tìm thấy file JSON nào trong thư mục hiện tại');
    console.log('📝 Hướng dẫn:');
    console.log('1. Download Firebase Service Account JSON');
    console.log('2. Đặt file vào thư mục này');
    console.log('3. Chạy lại script: node parse-service-account.js');
}

// Nếu có argument từ command line
if (process.argv[2]) {
    parseFirebaseServiceAccount(process.argv[2]);
}
