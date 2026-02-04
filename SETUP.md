# 📱 ImmoCRM Telemarketing - Setup Completo

## 🚀 Configurazione Iniziale

### 1. Clonare il Repository
```bash
git clone https://github.com/fraperfra/TELEMARKETING.git
cd TELEMARKETING
npm install
```

### 2. Configurare Variabili d'Ambiente

Crea un file `.env.local` nella root del progetto con:

```env
# 🔐 Supabase Configuration (REQUIRED)
VITE_SUPABASE_URL=https://mfjchrbwfdvyxzfbgryq.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mamNocmJ3ZmR2eXh6ZmJncnlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgyNzQ5NzgsImV4cCI6MTc1MzkyNjk3OH0.xK3dZfCUZz5yG2x3mK9pLqRt8uVwA4bC6dEfGhIjKlM

# 🤖 OpenAI Configuration (Optional - for AI features)
VITE_OPENAI_API_KEY=sk-proj-your-key-here

# 💳 Stripe Configuration (Optional - for payments)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your-key

# ☎️ Twilio Configuration (Optional - for calls)
VITE_TWILIO_ACCOUNT_SID=your-account-sid

# 🎨 Gemini API (Optional - alternative to OpenAI)
VITE_GEMINI_API_KEY=your-gemini-key

# 🖥️ Server Configuration
SERVER_URL=http://localhost:3001
API_URL=http://localhost:3001/api
```

### 3. Avviare l'Applicazione

```bash
# Terminal 1: Frontend (Vite Dev Server)
npm run dev
# Accedi su http://localhost:3004

# Terminal 2: Backend API (Node/Express)
npm run dev:server
```

## 🗄️ Database Schema (Supabase)

### Tables Necessarie:

1. **users** - Profili utente
   ```sql
   id, email, name, avatar_url, role, is_active, created_at
   ```

2. **organizations** - Aziende
   ```sql
   id, name, slug, plan, seats_total, seats_used, created_at
   ```

3. **owners** - Proprietari/Contatti
   ```sql
   id, organization_id, firstName, lastName, email, phone, 
   taxCode, birthDate, temperature, score, address, notes, created_at
   ```

4. **calls** - Registrazione chiamate
   ```sql
   id, organization_id, agent_id, contact_id, started_at, 
   ended_at, duration, outcome, final_score, notes, transcript, created_at
   ```

5. **appointments** - Appuntamenti
   ```sql
   id, organization_id, agent_id, contact_id, scheduled_for, 
   status, notes, created_at, updated_at
   ```

6. **teams** - Team di agenti
   ```sql
   id, organization_id, name, color, leader_id, created_at
   ```

7. **daily_stats** - Statistiche giornaliere
   ```sql
   id, organization_id, agent_id, date, calls_made, leads_qualified, 
   appointments_booked, created_at
   ```

## 🔄 Sincronizzazione GitHub & Supabase

### Push Automatico
```bash
# Aggiungi il remoto
git remote add origin https://github.com/fraperfra/TELEMARKETING.git

# Push iniziale
git push -u origin master

# Push successivi
git push origin master
```

### Struttura Cartelle
```
TELEMARKETING/
├── src/
│   ├── components/       # Componenti React
│   ├── pages/           # Pagine applicazione
│   ├── contexts/        # React Contexts (Auth, Notifications)
│   ├── hooks/           # Custom hooks
│   ├── lib/
│   │   ├── supabase.ts  # Client Supabase
│   │   ├── api.ts       # API calls
│   │   └── utils.ts     # Utility functions
│   └── types/           # TypeScript types
├── server/              # Backend Express
├── public/              # Static files
├── .env.local          # Variabili d'ambiente (NON committare!)
└── package.json
```

## 🧪 Test della Connessione

### Verifica Supabase
```typescript
// src/lib/supabase.ts è già configurato
// Testa con:
import { supabase } from '@/lib/supabase';

// Test di lettura
const { data, error } = await supabase
  .from('users')
  .select('*')
  .limit(1);
```

### Verifica Backend
```bash
curl http://localhost:3001/api/health
# Dovrebbe rispondere con status 200
```

## 📊 Features Implementate

✅ **Dashboard Completo**
- Dashboard Proprietario (Owner Dashboard)
- Dashboard Team Leader
- Dashboard Agente (Agent Dashboard)
- Real-time Statistics

✅ **Gestione Proprietari (CRUD)**
- Creazione/Modifica/Eliminazione
- Bulk operations
- Filtri avanzati
- Export CSV

✅ **Gestione Appuntamenti**
- Calendar view
- Booking system
- Notifications

✅ **Dialer Telefonico**
- AI Call Assistant
- Call History
- Call Recording (pronto)

✅ **Authentication**
- Login/Register
- Role-based access
- Session management

✅ **Real-time Sync**
- Supabase subscriptions
- Live notifications
- Multi-user coordination

## 🔐 Sicurezza

### Row Level Security (RLS)
Tutti le tabelle hanno RLS policies configurate in Supabase:
- Users vedono solo i dati della loro organizzazione
- Agenti vedono solo i propri dati
- Owner vede tutto

### Environment Variables
Mantieni le chiavi API private:
- ✅ `.env.local` è in `.gitignore`
- ✅ Usa variabili `VITE_` per il frontend
- ✅ Usa variabili standard per il backend

## 📞 Supporto

Contatti disponibili nel sistema:
- Email: support@immocrm.dev
- Documentation: `/docs`
- Issues: GitHub Issues

## 🚢 Deploy

### Vercel (Consigliato per Frontend)
```bash
npm run build
vercel deploy
```

### Supabase (Database & Auth)
✅ Già configurato e live
- URL: https://mfjchrbwfdvyxzfbgryq.supabase.co
- Dashboard: https://app.supabase.com

### Backend (Heroku/Railway/Render)
```bash
npm run build:server
# Deploy server/dist
```

---

**Versione**: 1.0.0  
**Ultimo aggiornamento**: 4 Febbraio 2026  
**Status**: 🟢 Production Ready
