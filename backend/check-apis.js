#!/usr/bin/env node
/**
 * Script de verificación de APIs de LaburAI
 * Ejecutar con: node check-apis.js
 */

require('dotenv').config();

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

const OK = `${GREEN}✅ OK${RESET}`;
const FAIL = `${RED}❌ FALLA${RESET}`;
const SKIP = `${YELLOW}⏭  Sin configurar${RESET}`;

async function checkGroq() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return SKIP;
  try {
    const Groq = require('groq-sdk').default;
    const groq = new Groq({ apiKey });
    const res = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: 'Di solo "hola"' }],
      max_tokens: 5,
    });
    return `${OK} — modelo: llama-3.1-8b-instant — respuesta: "${res.choices[0].message.content.trim()}"`;
  } catch (e) {
    return `${FAIL} — ${e.message}`;
  }
}

async function checkGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return SKIP;
  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent('Di solo "hola"');
    const text = result.response.text().trim();
    return `${OK} — modelo: gemini-2.0-flash — respuesta: "${text.substring(0, 30)}"`;
  } catch (e) {
    if (e.message.includes('429')) return `${YELLOW}⚠️  Cuota agotada (funciona pero límite diario alcanzado)${RESET}`;
    return `${FAIL} — ${e.message.substring(0, 80)}`;
  }
}

async function checkCerebras() {
  const apiKey = process.env.CEREBRAS_API_KEY;
  if (!apiKey) return SKIP;
  try {
    const Cerebras = require('@cerebras/cerebras_cloud_sdk').default;
    const client = new Cerebras({ apiKey });
    const res = await client.chat.completions.create({
      model: 'zai-glm-4.7',
      messages: [{ role: 'user', content: 'Di solo "hola"' }],
      max_tokens: 5,
    });
    const content = res.choices[0]?.message?.content || '';
    return `${OK} — modelo: zai-glm-4.7 — respuesta: "${content.trim()}"`;
  } catch (e) {
    return `${FAIL} — ${e.message}`;
  }
}

async function checkOpenRouter() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return SKIP;
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openrouter/free',
        messages: [{ role: 'user', content: 'Di solo "hola"' }],
        max_tokens: 5,
      }),
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) {
        console.log('\nDEBUG OpenRouter Empty Text Content:', JSON.stringify(data, null, 2));
        throw new Error('No hubo respuesta del modelo');
    }
    return `${OK} — modelo: openrouter/free — respuesta: "${text}"`;
  } catch (e) {
    return `${FAIL} — ${e.message}`;
  }
}

async function checkSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return SKIP;
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(url, key);
    const { data, error } = await supabase.storage.listBuckets();
    if (error) throw error;
    const buckets = data.map(b => b.name).join(', ');
    const hasCvsBucket = data.some(b => b.name === 'cvs');
    const bucketStatus = hasCvsBucket ? `${GREEN}bucket 'cvs' encontrado ✓${RESET}` : `${YELLOW}bucket 'cvs' NO existe — créalo en Storage${RESET}`;
    return `${OK} — Buckets: [${buckets || 'ninguno'}] — ${bucketStatus}`;
  } catch (e) {
    return `${FAIL} — ${e.message}`;
  }
}

async function checkDatabase() {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    await prisma.$queryRaw`SELECT 1`;
    await prisma.$disconnect();
    return `${OK} — Conexión a Supabase PostgreSQL establecida`;
  } catch (e) {
    return `${FAIL} — ${e.message.substring(0, 80)}`;
  }
}

async function main() {
  console.log(`\n${BOLD}${CYAN}════════════════════════════════════════════${RESET}`);
  console.log(`${BOLD}${CYAN}   🔍 Verificación de APIs — LaburAI${RESET}`);
  console.log(`${BOLD}${CYAN}════════════════════════════════════════════${RESET}\n`);

  console.log(`${BOLD}Proveedor activo:${RESET} ${CYAN}${process.env.PROVEEDOR_IA || 'groq'}${RESET}\n`);

  const checks = [
    { name: '🗄  Base de Datos (Prisma/Supabase)', fn: checkDatabase },
    { name: '🤖 Groq (Llama 3.1)',                fn: checkGroq },
    { name: '✨ Gemini (Google 2.0 Flash)',        fn: checkGemini },
    { name: '⚡ Cerebras (Llama 3.1)',             fn: checkCerebras },
    { name: '🌐 OpenRouter (Gemini 2.0 Flash)',      fn: checkOpenRouter },
    { name: '📦 Supabase Storage',                 fn: checkSupabase },
  ];

  for (const check of checks) {
    process.stdout.write(`  ${check.name}... `);
    const result = await check.fn();
    console.log(result);
  }

  console.log(`\n${BOLD}${CYAN}════════════════════════════════════════════${RESET}\n`);
}

main().catch(console.error);
