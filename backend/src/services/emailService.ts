import nodemailer from 'nodemailer';
import { env } from '../config/env';

// inicializa o transporte smtp apenas se as credenciais forem fornecidas
const transporter = env.SMTP_USER && env.SMTP_PASS
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    })
  : null;

export async function enviarEmailRecuperacaoSenha(emailDestino: string, linkRedefinicao: string): Promise<boolean> {
  // se houver credenciais smtp configuradas, envia via nodemailer
  if (transporter) {
    try {
      await transporter.sendMail({
        from: env.EMAIL_FROM || env.SMTP_USER,
        to: emailDestino,
        subject: 'Redefinição de Senha — ViAgenda',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8" />
              <title>Redefinição de Senha — ViAgenda</title>
            </head>
            <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
              <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 16px;">
                <tr>
                  <td align="center">
                    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 520px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                      <!-- cabecalho do email -->
                      <tr>
                        <td style="padding: 32px 32px 24px; text-align: center; border-bottom: 1px solid #f1f5f9;">
                          <div style="display: inline-block; background-color: #1D5BD8; color: #ffffff; width: 44px; height: 44px; line-height: 44px; border-radius: 12px; font-size: 20px; font-weight: bold;">
                            ✈
                          </div>
                          <h1 style="margin: 12px 0 0; font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">ViAgenda</h1>
                          <p style="margin: 2px 0 0; font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">AGT Viagens</p>
                        </td>
                      </tr>
                      
                      <!-- corpo do email -->
                      <tr>
                        <td style="padding: 32px;">
                          <h2 style="margin: 0 0 12px; font-size: 16px; font-weight: 700; color: #1e293b;">Solicitação de nova senha</h2>
                          <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.6; color: #475569;">
                            Recebemos um pedido para redefinir a senha de acesso à sua conta no <strong>ViAgenda</strong>. Clique no botão abaixo para escolher uma nova senha:
                          </p>
                          
                          <table width="100%" cellpadding="0" cellspacing="0" style="margin: 28px 0;">
                            <tr>
                              <td align="center">
                                <a href="${linkRedefinicao}" target="_blank" style="display: inline-block; background-color: #1D5BD8; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 28px; border-radius: 10px; box-shadow: 0 2px 4px rgba(29, 91, 216, 0.2);">
                                  Criar nova senha
                                </a>
                              </td>
                            </tr>
                          </table>
                          
                          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 16px; margin: 20px 0 0;">
                            <p style="margin: 0; font-size: 12px; color: #64748b; line-height: 1.5;">
                              ⏱ <strong>Atenção:</strong> Este link é de uso único e expira automaticamente em <strong>15 minutos</strong>.
                            </p>
                          </div>
                          
                          <p style="margin: 24px 0 0; font-size: 12px; line-height: 1.5; color: #94a3b8;">
                            Se você não solicitou a alteração da sua senha, desconsidere esta mensagem. Sua conta continuará segura com a senha atual.
                          </p>
                        </td>
                      </tr>
                      
                      <!-- rodape -->
                      <tr>
                        <td style="background-color: #f8fafc; padding: 16px; text-align: center; border-top: 1px solid #f1f5f9; font-size: 11px; color: #94a3b8;">
                          © ${new Date().getFullYear()} ViAgenda · AGT Viagens — Todos os direitos reservados.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
          </html>
        `,
      });

      console.log(`✉️ [Nodemailer] E-mail de recuperação enviado com sucesso para: ${emailDestino}`);
      return true;
    } catch (err) {
      console.error('❌ [Nodemailer] Falha ao enviar e-mail via SMTP:', err);
      return false;
    }
  }

  // fallback para ambiente local sem credenciais smtp
  console.log('\n=========================================');
  console.log('🔑 [ViAgenda] Link de recuperação de senha:');
  console.log(`E-mail: ${emailDestino}`);
  console.log(`Link: ${linkRedefinicao}`);
  console.log('=========================================\n');
  return true;
}
