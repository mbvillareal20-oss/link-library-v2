import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { name, url, category } = req.body;
    const { data, error } = await supabase.from('links').insert([{ name, url, category }]);
    if (error) return res.status(400).json({ error: error.message });
    res.status(200).json({ message: 'Link added', data });
  } else if (req.method === 'GET') {
    const { data, error } = await supabase.from('links').select('*');
    if (error) return res.status(400).json({ error: error.message });
    res.status(200).json(data);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
