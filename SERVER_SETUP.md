# 🚀 Server Configuration Guide

Guida completa per configurare il backend dell'applicazione TELEMARKETING.

## 📋 Indice

1. [Installazione Dipendenze](#installazione-dipendenze)
2. [Variabili di Ambiente](#variabili-di-ambiente)
3. [Configurazione Server](#configurazione-server)
4. [Avvio Locale](#avvio-locale)
5. [Testing Endpoints](#testing-endpoints)
6. [Deployment](#deployment)

---

## 1. Installazione Dipendenze

### Step 1: Installare dipendenze richieste

```bash
npm install
```

### Step 2: Installare dipendenze aggiuntive (se mancanti)

```bash
npm install express cors dotenv
npm install openai @supabase/supabase-js twilio stripe resend web-push
npm install --save-dev @types/express @types/cors @types/node tsx
```

### Step 3: Verificare installazione

```bash
npm list express cors dotenv openai
```

---

## 2. Variabili di Ambiente

### Configurare .env.local

```bash
# Copiare il template
cp .env.example .env.local
```

### Sezione 1: Supabase (OBBLIGATORIO)

```env
# Frontend (public)
VITE_SUPABASE_URL=https://mfjchrbwfdvyxzfbgryq.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Backend (secret - service key)
SUPABASE_URL=https://mfjchrbwfdvyxzfbgryq.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Come ottenere le chiavi:**
1. Vai a https://app.supabase.com
2. Seleziona il progetto TELEMARKETING
3. Vai su Settings > API
4. Copia `Project URL` e `Service Role Key`

### Sezione 2: OpenAI (Per AI features)

```env
OPENAI_API_KEY=sk-proj-your-key-here
VITE_OPENAI_API_KEY=sk-proj-your-key-here
```

**Come ottenere:**
1. Vai a https://platform.openai.com/api-keys
2. Crea una nuova API key
3. Incolla il valore in .env.local

### Sezione 3: Twilio (Per SMS/Calls)

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
VITE_TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Come ottenere:**
1. Vai a https://www.twilio.com/console
2. Copia Account SID e Auth Token dalla dashboard
3. Acquista un numero Twilio (se non lo hai)

### Sezione 4: Stripe (Per pagamenti)

```env
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_test_your_secret_here
```

**Come ottenere:**
1. Vai a https://dashboard.stripe.com/apikeys
2. Copia le chiavi in test mode
3. Per webhook: https://dashboard.stripe.com/webhooks

### Sezione 5: Resend (Email)

```env
RESEND_API_KEY=re_your_api_key_here
```

**Come ottenere:**
1. Vai a https://resend.com/api-keys
2. Crea una nuova API key
3. Incolla il valore

### Sezione 6: Server Configuration

```env
PORT=3001
NODE_ENV=development
SERVER_URL=http://localhost:3001
API_URL=http://localhost:3001/api
FRONTEND_URL=http://localhost:3004
CORS_ORIGIN=http://localhost:3004
```

### Sezione 7: Web Push (Notifiche push)

```env
# Genera con: npm run generate:vapid
VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key
```

**Come generare:**
```bash
# Installa web-push CLI
npm install -g web-push

# Genera le chiavi
web-push generate-vapid-keys

# Salva i valori in .env.local
```

---

## 3. Configurazione Server

### File: server/config.ts

Il file `server/config.ts` carica e valida tutte le variabili di ambiente:

```typescript
// Viene caricato automaticamente all'avvio
// Valida tutte le variabili obbligatorie
// Mostra warning per variabili opzionali mancanti
// Espone feature flags automatici
```

**Feature Flags (calcolati automaticamente):**
- `features.emailNotifications` - Abilitato se RESEND_API_KEY esiste
- `features.smsNotifications` - Abilitato se TWILIO_ACCOUNT_SID esiste
- `features.pushNotifications` - Abilitato se VAPID_PUBLIC_KEY esiste
- `features.aiAnalysis` - Abilitato se OPENAI_API_KEY esiste
- `features.payments` - Abilitato se STRIPE_SECRET_KEY esiste

### File: server/index.ts

Server Express con i seguenti moduli:
- ✅ Health check endpoints
- ✅ Notification endpoints (email, SMS, push)
- ✅ AI analysis endpoints
- ✅ Alerts e reminders
- ✅ Database operations (CRUD)
- ✅ Request logging e error handling

### File: server/middleware.ts

Middleware per:
- Request logging
- Error handling
- Rate limiting
- CORS
- Body validation

### File: server/routes/database.ts

Router con endpoint CRUD per:
- Owners
- Contacts
- Appointments
- Calls
- Statistics

---

## 4. Avvio Locale

### Opzione 1: Avvio parallelo (Frontend + Backend)

**Terminal 1 - Frontend:**
```bash
npm run dev
# Apri http://localhost:3004
```

**Terminal 2 - Backend:**
```bash
npm run dev:server
# Server su http://localhost:3001
```

### Opzione 2: Avvio separato

```bash
# Terminale 1: Frontend
npm run dev

# Terminale 2: Backend
npx tsx watch server/index.ts
```

### Output atteso:

```
📋 Configuration Summary:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔧 Environment: DEVELOPMENT
🚀 Server: http://localhost:3001
🎨 Frontend: http://localhost:3004
🗄️  Supabase: ✅ Configured
📧 Email: ✅ Enabled
💬 SMS: ✅ Enabled
🔔 Push: ✅ Disabled
🤖 AI: ✅ Enabled
💳 Stripe: ✅ Enabled
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 5. Testing Endpoints

### Health Check

```bash
# Basic health check
curl http://localhost:3001/api/health

# Response:
{
  "status": "ok",
  "timestamp": "2024-02-04T10:30:45.123Z",
  "environment": "development",
  "features": {
    "emailNotifications": true,
    "smsNotifications": true,
    "pushNotifications": false,
    "aiAnalysis": true,
    "payments": true
  }
}
```

### Detailed Health Check

```bash
curl http://localhost:3001/api/health/detailed

# Response:
{
  "server": { "status": "ok" },
  "supabase": { "status": "ok" },
  "openai": { "status": "configured" },
  "twilio": { "status": "configured" },
  "stripe": { "status": "configured" }
}
```

### Test Email Notification

```bash
curl -X POST http://localhost:3001/api/notifications/email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "template": "welcome",
    "data": {"name": "John"}
  }'
```

### Test SMS Notification

```bash
curl -X POST http://localhost:3001/api/notifications/sms \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+1234567890",
    "message": "Test SMS message"
  }'
```

### Test AI Analysis

```bash
curl -X POST http://localhost:3001/api/ai/analyze-call \
  -H "Content-Type: application/json" \
  -d '{
    "transcript": "Cliente: Buongiorno, sono interessato a una casa. Venditore: Perfetto! Quando possiamo vederla?",
    "language": "it"
  }'
```

### Test Database Operations

```bash
# Get owners
curl http://localhost:3001/api/owners

# Create owner
curl -X POST http://localhost:3001/api/owners \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Marco Rossi",
    "email": "marco@example.com",
    "phone": "+39123456789",
    "status": "hot"
  }'

# Get statistics
curl http://localhost:3001/api/stats/overview
```

---

## 6. Troubleshooting

### Problema: "SUPABASE_URL is required"

**Soluzione:**
```bash
# Verifica che .env.local esista
ls -la .env.local

# Verifica che contenga SUPABASE_URL
grep SUPABASE_URL .env.local

# Se manca, copia da .env.example
cp .env.example .env.local
# Quindi edita con i tuoi valori
```

### Problema: "Cannot find module 'express'"

**Soluzione:**
```bash
# Reinstalla dipendenze
rm -rf node_modules package-lock.json
npm install

# Installa dipendenze server specifiche
npm install express cors dotenv openai
```

### Problema: "Port 3001 already in use"

**Soluzione:**
```bash
# Cambia il port in .env.local
PORT=3002

# Oppure killer il processo
# Su Windows:
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Su Mac/Linux:
lsof -i :3001
kill -9 <PID>
```

### Problema: "CORS error from frontend"

**Soluzione:**
```bash
# Verifica che CORS_ORIGIN sia corretto in .env.local
CORS_ORIGIN=http://localhost:3004

# Se il frontend è su porta diversa, aggiorna:
CORS_ORIGIN=http://localhost:3000
```

---

## 📚 Endpoint Reference

### Health Check
- `GET /api/health` - Basic health check
- `GET /api/health/detailed` - Detailed service status

### Notifications
- `POST /api/notifications/email` - Send email
- `POST /api/notifications/sms` - Send SMS
- `POST /api/notifications/push` - Send push notification

### AI
- `POST /api/ai/analyze-call` - Analyze call transcript
- `POST /api/ai/score-lead` - Score leads

### Database (CRUD)
- `GET /api/owners` - List all owners
- `POST /api/owners` - Create owner
- `GET /api/contacts` - List contacts
- `POST /api/contacts` - Create contact
- `GET /api/appointments` - List appointments
- `POST /api/appointments` - Create appointment
- `GET /api/calls` - List calls
- `POST /api/calls` - Log call

### Statistics
- `GET /api/stats/overview` - Get overview statistics

---

## 🔄 Next Steps

1. ✅ Installa dipendenze
2. ✅ Configura .env.local
3. ✅ Avvia il server: `npm run dev:server`
4. ✅ Testa health check: `curl http://localhost:3001/api/health`
5. ✅ Testa gli endpoint
6. ✅ Integra con il frontend

---

## 📞 Support

Se hai problemi:
1. Controlla i log del server
2. Verifica le variabili di ambiente
3. Apri un issue su GitHub
4. Contatta support@immocrm.dev
