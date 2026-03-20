# 💪 FitGymSoftware® — Admin Dashboard

Complete gym management dashboard. React + Vite + Tailwind CSS frontend. Express + MongoDB backend.

---

## 🚀 Quick Start

### Step 1 — Backend (Terminal 1)

```powershell
cd backend
npm install
npm run dev
```

You should see:
```
✅ MongoDB connected
💪 FitGymSoftware® API running on http://localhost:5000
```

### Step 2 — Frontend (Terminal 2)

```powershell
cd frontend
npm install
npm run dev
```

Open: **http://localhost:5174**

---

## 🔐 Login Credentials

| Role    | Email              | Password    |
|---------|--------------------|-------------|
| Admin   | admin@gym.com      | admin123    |
| Manager | manager@gym.com    | manager123  |
| Trainer | trainer@gym.com    | trainer123  |

Or **register your own gym** at http://localhost:5174/register

---

## 📄 Pages & Features

| Page          | Features                                                    |
|---------------|-------------------------------------------------------------|
| Dashboard     | Stats, revenue chart, attendance chart, quick check-in, expiry alerts |
| Members       | Add/edit/delete, search, filter by status, renew membership, send WhatsApp |
| Attendance    | Manual check-in search, QR code display, biometric log, weekly trend chart |
| Billing       | Record payments, invoices, revenue chart, plan breakdown, WhatsApp receipt |
| Staff         | Add staff, mark present, generate payslips, send via WhatsApp |
| Leads CRM     | Kanban board (Hot/Warm/Cold/Converted), table view, call, WhatsApp, convert to member |
| Workout Plans | 6 workout templates, 3 diet charts, assign to members        |
| Reports       | Revenue & growth charts, attendance heatmap, plan pie chart, monthly summary |
| Settings      | Gym profile, notifications toggles, biometric config, SMS/WhatsApp keys, backup |

---

## ⚙️ Configuration

Edit `backend/.env`:

```env
MONGODB_URI=mongodb+srv://...    # Your MongoDB Atlas URI (already set)
JWT_SECRET=your_secret_key       # Change this!
CLIENT_URL=http://localhost:5174

# Optional — for real SMS/WhatsApp
MSG91_API_KEY=your_key
WATI_ACCESS_TOKEN=your_token
WATI_BASE_URL=https://live-mt-server.wati.io/YOUR_ID
```

---

## 🔐 Biometric Setup (eSSL devices)

Configure your eSSL device:
1. Go to device menu → **Cloud Server / ADMS**
2. Set Server Address: `http://YOUR_SERVER_IP:5000`
3. Set Push Path: `/api/biometric/push`
4. Enable push attendance

**Compatible devices:** K30, K300, X990, F22, AI-Face Magnum, AI-Face Mars, AI-Face ERI, U-Face 302

---

## 🛠️ Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Frontend  | React 18 + Vite 5 + Tailwind CSS 3     |
| Charts    | Recharts                                |
| Icons     | Lucide React                            |
| Backend   | Node.js + Express.js                    |
| Database  | MongoDB Atlas + Mongoose                |
| Auth      | JWT + bcryptjs                          |
| SMS       | MSG91 (DLT compliant)                   |
| WhatsApp  | WATI Business API                       |
| Payments  | Razorpay                                |

---

## 📞 Support

- 📞 +91 7601026686
- 📧 support@fitgymsoftware.com
- 🌐 fitgymsoftware.com

Made with ❤️ in India 🇮🇳
