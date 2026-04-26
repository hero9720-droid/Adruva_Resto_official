import 'dotenv/config';
import { db } from '../src/lib/db';

async function run() {
  console.log('Creating training and certification tables...');
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS training_modules (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        chain_id UUID NOT NULL REFERENCES chains(id),
        title TEXT NOT NULL,
        description TEXT,
        content_url TEXT, -- Link to video/PDF
        type TEXT DEFAULT 'text', -- text, video, pdf
        min_passing_score INT DEFAULT 70,
        estimated_minutes INT DEFAULT 15,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS training_exams (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        module_id UUID NOT NULL REFERENCES training_modules(id) ON DELETE CASCADE,
        questions JSONB NOT NULL, -- Array of {question, options[], correct_index}
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS staff_certifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        staff_id UUID NOT NULL REFERENCES staff(id),
        module_id UUID NOT NULL REFERENCES training_modules(id),
        score INT NOT NULL,
        passed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        expires_at TIMESTAMP WITH TIME ZONE,
        certificate_url TEXT,
        UNIQUE(staff_id, module_id)
      );

      CREATE INDEX IF NOT EXISTS idx_training_chain ON training_modules(chain_id);
      CREATE INDEX IF NOT EXISTS idx_certs_staff ON staff_certifications(staff_id);
    `);
    console.log('✅ Training and Certification tables created.');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    process.exit();
  }
}

run();
