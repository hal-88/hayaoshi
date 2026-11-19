// ===== Firebase の設定 =====
// Firebase のページでコピーした「firebaseConfig」の中身を、下の '' の中に貼りつけます。
// （くわしい手順は docs/firebase-setup.md を見てください）
//
// まだ空っぽのままだと「テストモード」になり、記録はこの端末の中だけに残ります。
window.FIREBASE_CONFIG = {
  apiKey: 'AIzaSyDPJyWBzkkFFMsVXLtmbwX-Z9OIEL2mtOo',
  authDomain: 'hayaoshi-quiz-635b7.firebaseapp.com',
  databaseURL: 'https://hayaoshi-quiz-635b7-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'hayaoshi-quiz-635b7',
  storageBucket: 'hayaoshi-quiz-635b7.firebasestorage.app',
  messagingSenderId: '1084024224289',
  appId: '1:1084024224289:web:67f8bccf96c13690e54160',
};

// 先生用画面（admin.html）に入るためのパスコード（ステップ5で使います）
// ※かんたんなカギです。本格的なセキュリティではありません。
window.ADMIN_PASSCODE = '1234';
