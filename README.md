# Coaching Center — React + Firebase + SSLCommerz (Vercel)

## নতুন কী যোগ হয়েছে (v1.3)
- 🛠️ **ছবি আপলোড এখন Cloudinary দিয়ে হয় (Firebase Storage বাদ দেওয়া হয়েছে)** — Firebase Storage এখন ব্যবহারের জন্য Blaze প্ল্যান (billing card) লাগে, তাই সেটা সরিয়ে ফ্রি Cloudinary আপলোডে পরিবর্তন করা হয়েছে। এতে আগের CORS এরর ঠিক হয়ে গেছে। নিচে "ধাপ ৩" দেখুন সেটআপের জন্য। ছবি সরাসরি URL হিসেবে পেস্ট করার অপশনও এখন আছে (fallback হিসেবে)।

## নতুন কী যোগ হয়েছে (v1.2)
- 🌗 **Dark/Light mode toggle** — নেভবারে বাটন দিয়ে সুইচ করা যায়, পছন্দ ব্রাউজারে সেভ থাকে
- ⌨️ **হিরো সেকশনে টাইপিং এনিমেশন** ("ICT শিখুন সহজভাবে" ইত্যাদি কয়েকটা লাইন ঘুরে ঘুরে দেখায়) + নিচে stats bar (কোর্স/শিক্ষার্থী/রেটিং সংখ্যা)
- 🔍 **কোর্স সার্চ বার** নেভবারে — টাইপ করলেই মিলে যাওয়া কোর্স দেখায়
- 🏷️ **কোর্স কার্ড ব্যাজ রিডিজাইন** — ডিসকাউন্ট লাল ব্যাজ (বাম দিকে), Featured হলুদ ব্যাজ (ডান দিকে, admin panel থেকে টিক দিয়ে চালু করা যায়)
- 📈 **Growth stats সেকশন** ("শিক্ষার্থীদের ভবিষ্যৎ গড়তে আমরা প্রতিশ্রুতিবদ্ধ" — বড় নাম্বার দিয়ে)

> টাইপিং লাইন ও growth stats-এর নাম্বারগুলো এখন কোডে ফিক্সড করা (`src/components/Hero.jsx` ও `src/components/GrowthStats.jsx` ফাইলে) — চাইলে সরাসরি ওখান থেকে বদলে দিতে পারবেন, অথবা পরে admin panel-এ যোগ করে দেওয়া যাবে।

## নতুন কী যোগ হয়েছে (v1.1)
- 🖼️ **Admin panel থেকে হিরো ব্যাকগ্রাউন্ড ছবি আপলোড** — Cloudinary-তে (ফ্রি, কার্ড লাগে না) আপলোড হয়ে হোমপেজের উপরে বড় করে বসে, সাথে dark overlay slider (লেখা স্পষ্ট রাখার জন্য)
- 📱 **মোবাইল রেসপনসিভ নেভবার** (hamburger menu) এবং পুরো সাইট জুড়ে ভালো মোবাইল লেআউট
- 🎨 **Design polish** — card hover animation, সাইটের নাম এডিট করার অপশন
- 🔍 **SEO** — meta description, Open Graph/Twitter card tags, favicon
- ⚡ **SSLCommerz দিয়ে instant অনলাইন পেমেন্ট** (Card/Mobile Banking/bKash gateway) — admin panel থেকে চালু/বন্ধ করা যায়; চালু থাকলে পেমেন্ট সাথে সাথে যাচাই হয়ে কোর্স আনলক হয়ে যায় (আগের ম্যানুয়াল bKash/Nagad Send Money পদ্ধতিও পাশাপাশি থাকছে)

এই পেমেন্ট অংশটুকু একটা ছোট **Node.js (Vercel Serverless Functions)** ব্যাকএন্ড দিয়ে করা হয়েছে (`/api` ফোল্ডার) — কারণ SSLCommerz-এর secret key নিরাপদে browser-এ রাখা যায় না, সার্ভার-সাইড লাগেই। বাকি সব আগের মতোই Firebase-এ চলছে (ফ্রি, সহজ)।

---

## যা যা আছে (আগে থেকে)
- React (Vite) দিয়ে বানানো, dark shadcn-style ডিজাইন
- Firebase Auth (Google login) — সম্পূর্ণ ফ্রি
- Firestore — কোর্স ডেটা ও এনরোলমেন্ট রিকোয়েস্ট রাখার জন্য — ফ্রি (Spark plan)
- Admin panel থেকে কোর্স add/edit/delete এবং YouTube video ID বসানো যায়

---

## ধাপ ১: Firebase প্রজেক্ট বানান (ফ্রি)
1. https://console.firebase.google.com এ যান, "Add project" দিন।
2. **Authentication** → Sign-in method → **Google** enable করুন।
3. **Firestore Database** → Create database → production mode।
4. Project settings → General → "Your apps" → Web app (</>) যোগ করে config নিন, `.env`-এ বসান।

> **Storage বাদ:** আগে এখানে Firebase Storage এনাবল করার ধাপ ছিল, কিন্তু এখন Firebase Storage ব্যবহারের জন্য Blaze প্ল্যানে যেতে হয় (billing card লাগে) — তাই ছবি আপলোডের জন্য বদলে ফ্রি **Cloudinary** ব্যবহার করা হচ্ছে (নিচে ধাপ ৩ দেখুন)। Firebase-এ Storage এনাবল করার দরকার নেই।

## ধাপ ২: Firestore Security Rules
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /courses/{courseId} {
      allow read: if true;
      allow write: if request.auth != null &&
                    request.auth.token.email == "youremail@gmail.com";
    }

    match /enrollments/{enrollmentId} {
      allow read: if request.auth != null &&
                   (resource.data.userId == request.auth.uid ||
                    request.auth.token.email == "youremail@gmail.com");
      allow create: if request.auth != null &&
                      request.resource.data.userId == request.auth.uid;
      allow update: if request.auth != null &&
                      request.auth.token.email == "youremail@gmail.com";
    }

    match /settings/{docId} {
      allow read: if true;
      allow write: if request.auth != null &&
                    request.auth.token.email == "youremail@gmail.com";
    }
  }
}
```
> `enrollments` কালেকশনে `/api` ফাংশনগুলো Firebase **Admin SDK** দিয়ে লেখে, যেটা এই rules বাইপাস করে (admin-এর ফুল অ্যাক্সেস থাকে) — তাই SSLCommerz পেমেন্ট automatic approve হতে rules-এ কোনো বাধা হয় না।

## ধাপ ৩: Cloudinary সেটআপ (ছবি আপলোডের জন্য, ফ্রি — কার্ড লাগে না)
1. https://cloudinary.com/users/register/free গিয়ে ফ্রি অ্যাকাউন্ট বানান (কোনো কার্ড চাইবে না)।
2. Dashboard-এর হোমপেজেই আপনার **Cloud name** দেখা যাবে — সেটা কপি করুন।
3. Settings (⚙️) → **Upload** ট্যাবে যান → **Upload presets** সেকশনে **Add upload preset** ক্লিক করুন।
4. **Signing Mode** → **Unsigned** সিলেক্ট করুন (browser থেকে সরাসরি আপলোডের জন্য এটা দরকার), Save করুন।
5. প্রিসেটের নামটা কপি করুন।
6. `.env`-এ বসান:
   ```
   VITE_CLOUDINARY_CLOUD_NAME=আপনার-cloud-name
   VITE_CLOUDINARY_UPLOAD_PRESET=আপনার-preset-এর-নাম
   ```
> ফ্রি প্ল্যানে মাসে যথেষ্ট storage/bandwidth থাকে ছোট একটা কোচিং সাইটের জন্য, এবং কখনো কার্ড চাইবে না।

## ধাপ ৪: লোকাল সেটআপ
```bash
npm install
cp .env.example .env
```
`.env`-এ Firebase config, admin gmail, এবং Cloudinary cloud name/preset বসান। তারপর:
```bash
npm run dev
```
http://localhost:5173 এ চেক করুন।

## ধাপ ৫: SSLCommerz সেটআপ (অনলাইন পেমেন্টের জন্য, ঐচ্ছিক)
1. https://developer.sslcommerz.com/registration/ থেকে **sandbox** অ্যাকাউন্ট বানান — এটা সম্পূর্ণ ফ্রি, টেস্ট করার জন্য।
2. Store ID ও Store Password পাবেন — `.env`-এ `SSLCZ_STORE_ID`, `SSLCZ_STORE_PASSWORD` বসান, `SSLCZ_IS_LIVE=false` রাখুন (sandbox মোড)।
3. আসল টাকা নিতে চাইলে পরে SSLCommerz-এ merchant account-এর জন্য apply করে approve হলে `SSLCZ_IS_LIVE=true` করে আসল store id/password বসাবেন।

## ধাপ ৬: Firebase Admin SDK (পেমেন্ট backend-এর জন্য)
1. Firebase Console → Project settings → **Service accounts** → "Generate new private key" — একটা JSON ফাইল ডাউনলোড হবে।
2. সেই ফাইল থেকে `project_id`, `client_email`, `private_key` কপি করে `.env`-এ বসান (`FIREBASE_PRIVATE_KEY`-এর `\n` গুলো রেখে দিন, quote দিয়ে wrap করুন)।
3. **এই JSON ফাইল/keys কখনো GitHub-এ পাবলিশ করবেন না** — এটা আপনার Firebase প্রজেক্টের ফুল অ্যাক্সেস দেয়।

## ধাপ ৭: GitHub-এ push
```bash
git init
git add .
git commit -m "Initial coaching center app"
git branch -M main
git remote add origin https://github.com/<your-username>/coaching-app.git
git push -u origin main
```

## ধাপ ৮: Vercel-এ deploy (ফ্রি)
1. https://vercel.com এ GitHub দিয়ে লগইন, "Add New Project" → রিপো সিলেক্ট করুন।
2. **Environment Variables** সেকশনে `.env`-এর **সবগুলো** ভ্যারিয়েবল যোগ করুন — `VITE_...` গুলো (Firebase config + `VITE_CLOUDINARY_CLOUD_NAME` + `VITE_CLOUDINARY_UPLOAD_PRESET`) এবং `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `SSLCZ_STORE_ID`, `SSLCZ_STORE_PASSWORD`, `SSLCZ_IS_LIVE`, `PUBLIC_SITE_URL` (deploy হওয়ার পর যে URL পাবেন সেটা বসিয়ে আবার redeploy করুন)।
3. Deploy চাপুন। `/api` ফোল্ডারের ফাইলগুলো Vercel নিজে থেকেই Node.js Serverless Functions হিসেবে ডিপ্লয় করবে — আলাদা কিছু করতে হবে না।
4. Firebase Console → Authentication → Settings → Authorized domains-এ আপনার Vercel ডোমেইন যোগ করুন।
5. SSLCommerz প্যানেলে (sandbox বা live) IPN URL হিসেবে `https://<your-domain>/api/payment/ipn` বসিয়ে রাখুন যদি ওরা আলাদাভাবে জিজ্ঞেস করে (কোডেও পাঠানো হচ্ছে, তবে প্যানেলেও সেট থাকলে ভালো)।

## ব্যাকগ্রাউন্ড ছবি সেট করবেন কীভাবে
1. Google দিয়ে admin email দিয়ে লগইন করুন।
2. "অ্যাডমিন প্যানেল" বাটনে ক্লিক করুন।
3. "সাইট সেটিংস" সেকশনে "হিরো ব্যাকগ্রাউন্ড ছবি" থেকে ছবি সিলেক্ট করুন (৫MB পর্যন্ত) — সাথে সাথে আপলোড হয়ে হোমপেজে বড় করে দেখাবে।
4. Overlay স্লাইডার দিয়ে ছবির উপর কতটা অন্ধকার শেড থাকবে (লেখা স্পষ্ট রাখতে) সেটা ঠিক করুন।

## লাইভ ক্লাস কিভাবে দেবেন
1. YouTube Studio থেকে "Go Live" করুন।
2. লাইভ ভিডিওর URL থেকে ID কপি করুন।
3. Admin Panel-এ সেই কোর্সে video ID বসান এবং "এখন লাইভ চলছে" টিক দিন।
4. লাইভ শেষ হলে টিকটা উঠিয়ে দিন — YouTube একই video ID-তে রেকর্ডিং রেখে দেয়।

## পরে যোগ করার মতো জিনিস
- Cloud Functions দিয়ে সত্যিকারের role-based admin (এখন env variable দিয়ে email match — ছোট স্কেলে যথেষ্ট)
- ইমেইল/SMS নোটিফিকেশন যখন লাইভ ক্লাস শুরু হয়
- সার্টিফিকেট জেনারেশন
