# 🏡 Panchayat Database Management System

## 🌾 Community Connect Project – Panchayat DBMS

This is a full-stack web application designed to manage and streamline data related to a Panchayat or Municipality. It helps office administrators manage village/area details, citizen records, and essential demographic information with ease.

---

## 🚀 Features

- 🔐 Admin login system with secure access
- 🏘️ Manage list of villages or areas under the Panchayat
- 👤 Add, edit, or remove citizen records
- 🧾 Store and update citizen details including:
  - Full Name, Gender, DOB
  - Address, Aadhar Number
  - Family/Head of Household Info
  - Occupation & Income
  - Phone, Email, Education
  - Special Notes or Schemes
- 📊 View summarized reports by area or demographic category
- 🔄 Easily update or delete outdated records

---

## ⚙️ Technologies Used

- **Supabase** – Cloud database and authentication
- **React.js** – Frontend framework
- **Tailwind CSS** – For sleek and modern styling
- **Vite** – Fast bundling and development

---

## 🙏 Special Thanks

Gratitude to **SRM Institute of Science and Technology** for providing the opportunity to work on this impactful community project under the Community Connect Initiative.

---

## 💾 How to Run This Project

### 1. 📦 Clone the Repository

```bash
git clone https://github.com/your-username/panchayat-dbms.git
cd panchayat-dbms
```

### 2. 📁 Install Dependencies

```bash
npm install
```

### 3. ⚙️ Configure Supabase

Create a new project on [Supabase](https://supabase.com) and create the required tables:

- `areas`
- `citizens`
- `admins`

Ensure proper foreign key relationships and indexing.

### 4. 🔐 Add Environment Variables

Create a `.env` file in the root and add your Supabase credentials:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 5. ▶️ Run Development Server

```bash
npm run dev
```

Visit:  
🌐 `http://localhost:5173`

---

## ✅ Admin Login (for demo)

```
Username: admin
Password: admin123
```

Update these in Supabase `admins` table if needed.

---

## 📃 License

Developed under Community Connect by me for rural governance and data management. Open for enhancement and adaptation.
