import nodemailer, { type Transporter } from 'nodemailer';

import type { AppEnv } from '../config/env.js';

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export interface EmailProvider {
  send(message: EmailMessage): Promise<void>;
}

export class SmtpEmailProvider implements EmailProvider {
  private readonly transporter: Transporter;

  constructor(
    private readonly from: string,
    transporter: Transporter,
  ) {
    this.transporter = transporter;
  }

  static fromEnv(env: AppEnv): SmtpEmailProvider {
    if (!env.SMTP_USER || !env.SMTP_PASS || !env.SMTP_FROM) {
      throw new Error('SMTP email configuration is incomplete.');
    }

    const transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    });

    return new SmtpEmailProvider(env.SMTP_FROM, transporter);
  }

  async send(message: EmailMessage): Promise<void> {
    await this.transporter.sendMail({
      from: this.from,
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
    });
  }
}

export function createAccountEmail(
  kind: 'verification' | 'password-reset',
  link: string,
): Pick<EmailMessage, 'subject' | 'text' | 'html'> {
  const isVerification = kind === 'verification';
  const action = isVerification ? 'confirmar tu correo' : 'cambiar tu contraseña';
  const subject = isVerification ? 'Confirmá tu correo en EcoPunto' : 'Restablecé tu contraseña de EcoPunto';
  const safeLink = escapeHtml(link);

  return {
    subject,
    text: `Usá este enlace para ${action}: ${link}\n\nSi no solicitaste este mensaje, podés ignorarlo.`,
    html: `<p>Usá este enlace para ${action}:</p><p><a href="${safeLink}">${safeLink}</a></p><p>Si no solicitaste este mensaje, podés ignorarlo.</p>`,
  };
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return entities[character] ?? character;
  });
}
