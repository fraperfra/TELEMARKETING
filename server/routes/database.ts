// server/routes/database.ts
import { Request, Response, Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import config from '../config';

const router = Router();

const supabase = createClient(
  config.supabase.url!,
  config.supabase.serviceKey!
);

// ============================================
// OWNERS ENDPOINTS
// ============================================

router.get('/owners', async (req: Request, res: Response) => {
  try {
    const { data, error, count } = await supabase
      .from('owners')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data,
      count,
    });
  } catch (error: any) {
    console.error('Owners error:', error);
    res.status(500).json({ error: 'Failed to fetch owners', details: error.message });
  }
});

router.get('/owners/:id', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('owners')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Owner detail error:', error);
    res.status(500).json({ error: 'Failed to fetch owner' });
  }
});

router.post('/owners', async (req: Request, res: Response) => {
  try {
    const { name, email, phone, property_type, budget, status } = req.body;

    const { data, error } = await supabase
      .from('owners')
      .insert({
        name,
        email,
        phone,
        property_type: property_type || null,
        budget: budget || null,
        status: status || 'warm',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    console.log(`✅ Owner created: ${data.id}`);

    res.status(201).json({ success: true, data });
  } catch (error: any) {
    console.error('Create owner error:', error);
    res.status(500).json({ error: 'Failed to create owner' });
  }
});

router.put('/owners/:id', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('owners')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    console.log(`✅ Owner updated: ${data.id}`);

    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Update owner error:', error);
    res.status(500).json({ error: 'Failed to update owner' });
  }
});

router.delete('/owners/:id', async (req: Request, res: Response) => {
  try {
    const { error } = await supabase
      .from('owners')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;

    console.log(`✅ Owner deleted: ${req.params.id}`);

    res.json({ success: true, message: 'Owner deleted' });
  } catch (error: any) {
    console.error('Delete owner error:', error);
    res.status(500).json({ error: 'Failed to delete owner' });
  }
});

// ============================================
// CONTACTS ENDPOINTS
// ============================================

router.get('/contacts', async (req: Request, res: Response) => {
  try {
    const { data, error, count } = await supabase
      .from('contacts')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data, count });
  } catch (error: any) {
    console.error('Contacts error:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

router.post('/contacts', async (req: Request, res: Response) => {
  try {
    const { owner_id, name, email, phone, role } = req.body;

    const { data, error } = await supabase
      .from('contacts')
      .insert({
        owner_id,
        name,
        email,
        phone,
        role: role || 'contact',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    console.log(`✅ Contact created: ${data.id}`);

    res.status(201).json({ success: true, data });
  } catch (error: any) {
    console.error('Create contact error:', error);
    res.status(500).json({ error: 'Failed to create contact' });
  }
});

// ============================================
// APPOINTMENTS ENDPOINTS
// ============================================

router.get('/appointments', async (req: Request, res: Response) => {
  try {
    const { data, error, count } = await supabase
      .from('appointments')
      .select('*', { count: 'exact' })
      .order('scheduled_at', { ascending: true });

    if (error) throw error;

    res.json({ success: true, data, count });
  } catch (error: any) {
    console.error('Appointments error:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

router.post('/appointments', async (req: Request, res: Response) => {
  try {
    const { owner_id, contact_id, title, description, scheduled_at, location, notes } = req.body;

    const { data, error } = await supabase
      .from('appointments')
      .insert({
        owner_id,
        contact_id: contact_id || null,
        title,
        description: description || null,
        scheduled_at,
        location: location || null,
        notes: notes || null,
        status: 'scheduled',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    console.log(`✅ Appointment created: ${data.id}`);

    res.status(201).json({ success: true, data });
  } catch (error: any) {
    console.error('Create appointment error:', error);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
});

// ============================================
// CALLS ENDPOINTS
// ============================================

router.get('/calls', async (req: Request, res: Response) => {
  try {
    const { data, error, count } = await supabase
      .from('calls')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data, count });
  } catch (error: any) {
    console.error('Calls error:', error);
    res.status(500).json({ error: 'Failed to fetch calls' });
  }
});

router.post('/calls', async (req: Request, res: Response) => {
  try {
    const { owner_id, contact_id, duration, transcript, outcome, notes } = req.body;

    const { data, error } = await supabase
      .from('calls')
      .insert({
        owner_id,
        contact_id: contact_id || null,
        duration: duration || 0,
        transcript: transcript || null,
        outcome: outcome || 'completed',
        notes: notes || null,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    console.log(`✅ Call logged: ${data.id}`);

    res.status(201).json({ success: true, data });
  } catch (error: any) {
    console.error('Create call error:', error);
    res.status(500).json({ error: 'Failed to log call' });
  }
});

// ============================================
// STATISTICS ENDPOINTS
// ============================================

router.get('/stats/overview', async (req: Request, res: Response) => {
  try {
    const [ownersCount, contactsCount, appointmentsCount, callsCount] = await Promise.all([
      supabase.from('owners').select('id', { count: 'exact', head: true }),
      supabase.from('contacts').select('id', { count: 'exact', head: true }),
      supabase.from('appointments').select('id', { count: 'exact', head: true }),
      supabase.from('calls').select('id', { count: 'exact', head: true }),
    ]);

    res.json({
      success: true,
      stats: {
        owners: ownersCount.count,
        contacts: contactsCount.count,
        appointments: appointmentsCount.count,
        calls: callsCount.count,
      },
    });
  } catch (error: any) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router;
