import 'dotenv/config';
import bcrypt from 'bcryptjs';
import fs from 'node:fs';
import path from 'node:path';

async function main() {
  const [nome, email, senha] = process.argv.slice(2);
  if (!nome || !email || !senha || senha.length < 8) {
    throw new Error('Uso: npm run admin:create -- "Nome" email senha-com-8-caracteres');
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error('Informe um e-mail válido.');

  // O administrador fica configurado no .env do backend, sem exigir tabela nova no Supabase.
  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) throw new Error('Arquivo .env não encontrado. Crie-o a partir de .env.example antes.');
  const hash = await bcrypt.hash(senha, 12);
  let content = fs.readFileSync(envPath, 'utf8');
  const values: Record<string, string> = {
    ADMIN_NAME: nome,
    ADMIN_EMAIL: email.toLowerCase(),
    ADMIN_PASSWORD_HASH: hash,
  };
  for (const [key, value] of Object.entries(values)) {
    const line = `${key}=${value}`;
    const re = new RegExp(`^${key}=.*$`, 'm');
    content = re.test(content) ? content.replace(re, line) : `${content.trimEnd()}\n${line}\n`;
  }
  fs.writeFileSync(envPath, content, 'utf8');
  console.log(`Administrador configurado com sucesso: ${nome} (${email}).`);
  console.log('A conta foi salva no .env local do backend; nenhuma tabela ou configuração do Supabase foi alterada.');
  console.log('Reinicie o backend para carregar as novas credenciais.');
}

main().catch((error) => { console.error(error.message ?? error); process.exit(1); });
