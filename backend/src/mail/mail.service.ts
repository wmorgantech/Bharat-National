import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { getCompanyNotificationEmail, getMailLogoUrl } from '../config/env';

type ContactAckPayload = {
  to: string;
  name: string;
  phone: string;
  interestedIn?: string;
  message?: string;
};

/** Internal copy of an enquiry, sent to the BNC mailbox. */
type ContactNotificationPayload = ContactAckPayload & {
  contactId: number;
  submittedAt: Date;
};

type OrderEmailPayload = {
  id: number;
  cartId?: string | null;
  fullName: string;
  email: string;
  phone: string;
  place: string;
  totalAmount: number;
  isActive?: boolean;
  createdAt: Date;
  status?: string | null;
  paymentStatus?: string | null;
  paymentMethod?: string | null;
  orderItem: Array<{
    productName: string;
    unitPrice: number;
    quantity: number;
  }>;
};

/**
 * Company details shown in the footer of customer-facing mail. These are the
 * same details the storefront Contact page already publishes; nothing here is
 * new business information.
 */
const BNC_ADDRESS_LINES = [
  'Dno - 333- F2 - Geetha Building, Nehru St,',
  'Peranaidu Layout, Ram Nagar,',
  'Coimbatore, Tamil Nadu 641009',
];
const BNC_HOURS = 'Mon – Sat: 9:00 AM – 8:00 PM';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter?: nodemailer.Transporter;
  /** Validated once at startup; undefined means "render the text header only". */
  private readonly logoUrl?: string;

  constructor() {
    this.logoUrl = this.resolveLogoUrl();

    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
    const smtpHost = SMTP_HOST?.trim();
    const smtpPort = Number(SMTP_PORT?.trim());
    const smtpUser = SMTP_USER?.trim();
    // Google displays app passwords grouped with spaces. Remove whitespace so
    // either the displayed form or the compact form works in .env.
    const smtpPass = SMTP_PASS?.replace(/\s+/g, '');

    if (!smtpHost || !Number.isInteger(smtpPort) || !smtpUser || !smtpPass) {
      this.logger.warn(
        'SMTP configuration is missing. Email sending is disabled until SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS are set.',
      );
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      connectionTimeout: 15_000,
      greetingTimeout: 15_000,
    });

    this.transporter.verify((err) => {
      if (err) {
        this.logger.error(
          'SMTP verification failed. For Gmail, use the SMTP_USER account with a Google App Password (not the normal account password), and confirm 2-Step Verification is enabled.',
          err,
        );
      } else {
        this.logger.log('SMTP ready');
      }
    });
  }

  /**
   * Validates MAIL_LOGO_URL once, at startup.
   *
   * A logo hosted on localhost or a private address renders as a broken image
   * in the recipient's inbox - their mail client, not this server, fetches it.
   * That failure is invisible here and obvious to the customer, so the value is
   * rejected up front rather than shipped.
   */
  private resolveLogoUrl(): string | undefined {
    const raw = getMailLogoUrl();

    if (!raw) {
      this.logger.log(
        'MAIL_LOGO_URL is not set. Outgoing email will use the text-only header.',
      );
      return undefined;
    }

    let parsed: URL;

    try {
      parsed = new URL(raw);
    } catch {
      this.logger.error(
        'MAIL_LOGO_URL is not a valid absolute URL. Falling back to the text-only header.',
      );
      return undefined;
    }

    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      this.logger.error(
        `MAIL_LOGO_URL must use http or https (got "${parsed.protocol}"). Falling back to the text-only header.`,
      );
      return undefined;
    }

    const host = parsed.hostname.toLowerCase();

    if (host === 'localhost' || host === '127.0.0.1' || host === '::1') {
      this.logger.error(
        'MAIL_LOGO_URL points at localhost, which no recipient can load. Falling back to the text-only header.',
      );
      return undefined;
    }

    if (parsed.protocol === 'http:') {
      this.logger.warn(
        'MAIL_LOGO_URL uses http. Some mail clients refuse to load insecure images; https is recommended.',
      );
    }

    this.logger.log('MAIL_LOGO_URL configured; email header logo enabled.');
    return parsed.toString();
  }

  /**
   * Logo row for the top of an email, or an empty string when no logo is
   * configured.
   *
   * Email-safe on purpose: a table row rather than flex/grid, width and height
   * as HTML attributes as well as inline styles (Outlook ignores CSS sizing on
   * images), `display:block` to kill the inline-image baseline gap, and real
   * alt text because most clients block remote images until the reader opts in.
   */
  private logoBlock() {
    if (!this.logoUrl) {
      return '';
    }

    return `
  <tr>
    <td style="padding:24px 32px 0 32px;" align="left">
      <img src="${this.esc(this.logoUrl)}"
           alt="Bharath National Computers"
           width="150" height="auto"
           style="display:block;width:150px;max-width:150px;height:auto;border:0;outline:none;text-decoration:none;" />
    </td>
  </tr>`;
  }

  private getTransporter() {
    if (!this.transporter) {
      this.logger.warn('SMTP is not configured. Skipping email send.');
      return null;
    }

    return this.transporter;
  }

  // ============================================================
  // 1) CONTACT ACK EMAIL
  // ============================================================
  async sendContactAckToUser(data: ContactAckPayload) {
    const html = this.buildUserAckTemplate(data);
    const transporter = this.getTransporter();

    if (!transporter) {
      return undefined;
    }

    try {
      return await transporter.sendMail({
        from: `"Bharath National Computers" <${process.env.SMTP_USER}>`,
        to: data.to,
        replyTo: process.env.SMTP_USER,
        subject: 'We received your enquiry – Bharath National Computers',
        html,
      });
    } catch (error) {
      this.logger.error('Contact ack email send failed', error);
      throw new Error('Failed to send acknowledgement email');
    }
  }

  // ============================================================
  // 1b) CONTACT NOTIFICATION TO THE COMPANY
  // ============================================================
  /**
   * Forwards an enquiry to the internal BNC mailbox.
   *
   * The recipient comes from COMPANY_NOTIFICATION_EMAIL; no address is ever
   * hardcoded. When it is unset the send is skipped with a warning rather than
   * failing, because the enquiry is already saved and the customer has already
   * been acknowledged - losing the internal copy must not surface as an error.
   *
   * `replyTo` is the customer, so staff can answer straight from the inbox.
   */
  async sendContactNotificationToCompany(data: ContactNotificationPayload) {
    const recipient = getCompanyNotificationEmail();

    if (!recipient) {
      this.logger.warn(
        `COMPANY_NOTIFICATION_EMAIL is not set. Enquiry #${data.contactId} was saved but no internal notification was sent.`,
      );
      return undefined;
    }

    const transporter = this.getTransporter();

    if (!transporter) {
      return undefined;
    }

    const html = this.buildCompanyNotificationTemplate(data);

    try {
      return await transporter.sendMail({
        from: `"Bharath National Computers" <${process.env.SMTP_USER}>`,
        to: recipient,
        // Replying from the inbox goes straight back to the customer.
        replyTo: data.to,
        subject: `New enquiry #${data.contactId} – ${data.interestedIn || 'General Enquiry'}`,
        html,
      });
    } catch (error) {
      this.logger.error('Contact notification email send failed', error);
      throw new Error('Failed to send contact notification email');
    }
  }

  // ============================================================
  // 2) ORDER PLACED EMAIL
  // ============================================================
  async sendOrderPlacedToUser(order: OrderEmailPayload) {
    const html = this.buildOrderPlacedTemplate(order);
    const transporter = this.getTransporter();

    if (!transporter) {
      throw new Error('SMTP is not configured for order confirmation mail');
    }

    try {
      return await transporter.sendMail({
        from: `"Bharath National Computers" <${process.env.SMTP_USER}>`,
        to: order.email,
        replyTo: process.env.SMTP_USER,
        subject: `Your order is confirmed – #ORD-${order.id}`,
        html,
      });
    } catch (error) {
      this.logger.error('Order confirmation email send failed', error);
      throw new Error('Failed to send order confirmation email');
    }
  }

  // ============================================================
  // HELPERS
  // ============================================================
  private esc(v: any) {
    return String(v ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private money(n: number) {
    return `₹${Number(n || 0).toFixed(0)}`;
  }

  private formatDate(d: any) {
    try {
      const dt = d instanceof Date ? d : new Date(d);
      return dt.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    } catch {
      return String(d ?? '');
    }
  }

  // ============================================================
  // TEMPLATE 1: CONTACT ACK
  // ============================================================
  private buildUserAckTemplate(data: ContactAckPayload) {
    const year = new Date().getFullYear();

    return `
<!doctype html>
<html>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Inter,Arial,Helvetica,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;">
<tr>
<td align="center" style="padding:40px 12px;">

<table width="600" cellpadding="0" cellspacing="0"
  style="background:#ffffff;border-radius:14px;overflow:hidden;
         box-shadow:0 8px 28px rgba(0,0,0,0.08);">

  <tr>
    <td style="height:6px;background:#2563eb;"></td>
  </tr>
${this.logoBlock()}

  <tr>
    <td style="padding:28px 32px;">
      <div style="font-size:18px;font-weight:700;color:#0f172a;">
        Bharath National Computers
      </div>
      <div style="font-size:13px;margin-top:4px;color:#64748b;">
        Professional IT Services 
      </div>
    </td>
  </tr>

  <tr>
    <td style="padding:0 32px 24px 32px;color:#0f172a;">
      <p style="margin:0 0 14px;font-size:15px;">
        Hi <b>${this.esc(data.name)}</b>,
      </p>

      <p style="margin:0 0 16px;font-size:14px;line-height:1.7;color:#334155;">
        Thank you for contacting <b>Bharath National Computer</b>.
        We’ve received your enquiry and our team is reviewing it.
      </p>

      <p style="margin:0 0 24px;font-size:14px;color:#334155;">
        You can expect a response within <b>24 working hours</b>.
      </p>

      <table width="100%" cellpadding="0" cellspacing="0"
        style="background:#f8fafc;border-radius:10px;border:1px solid #e5e7eb;">
        ${this.row('Name', this.esc(data.name))}
        ${this.row('Email', this.esc(data.to))}
        ${this.row('Phone', this.esc(data.phone))}
        ${this.row('Service', this.esc(data.interestedIn || 'General Enquiry'))}
        ${this.row('Message', this.esc(data.message || '—'), true)}
      </table>
    </td>
  </tr>

  <tr>
    <td align="center" style="padding:28px;">
      <a href="mailto:${this.esc(process.env.SMTP_USER || '')}"
         style="display:inline-block;padding:14px 30px;background:#2563eb;color:#ffffff;
                text-decoration:none;font-size:14px;font-weight:600;border-radius:999px;">
        Reply to this email
      </a>
    </td>
  </tr>

  <tr>
    <td style="padding:0 32px 28px 32px;">
      <p style="margin:0;font-size:14px;line-height:1.7;color:#0f172a;">
        Regards,<br/>
        <b>Bharath National Computer</b><br/>
        <span style="font-size:12px;color:#64748b;">Support Team</span>
      </p>
    </td>
  </tr>

  <tr>
    <td style="padding:18px;background:#f8fafc;text-align:center;
               font-size:12px;color:#64748b;border-top:1px solid #e5e7eb;">
      © ${year} Bharath National Computers
    </td>
  </tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`;
  }

  // ============================================================
  // TEMPLATE 1b: COMPANY NOTIFICATION
  // ============================================================
  private buildCompanyNotificationTemplate(data: ContactNotificationPayload) {
    const year = new Date().getFullYear();

    return `
<!doctype html>
<html>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Inter,Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;">
<tr><td align="center" style="padding:40px 12px;">

<table width="600" cellpadding="0" cellspacing="0"
  style="background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 8px 28px rgba(0,0,0,0.08);">

  <tr><td style="height:6px;background:#0f766e;"></td></tr>
${this.logoBlock()}

  <tr>
    <td style="padding:28px 32px 8px 32px;">
      <div style="font-size:18px;font-weight:900;color:#0f172a;">New enquiry received</div>
      <div style="font-size:13px;margin-top:4px;color:#64748b;">
        Enquiry #${this.esc(data.contactId)} · ${this.esc(this.formatDate(data.submittedAt))}
      </div>
    </td>
  </tr>

  <tr>
    <td style="padding:16px 32px 24px 32px;">
      <table width="100%" cellpadding="0" cellspacing="0"
        style="background:#f8fafc;border-radius:10px;border:1px solid #e5e7eb;">
        ${this.row('Name', this.esc(data.name))}
        ${this.row('Email', this.esc(data.to))}
        ${this.row('Phone', this.esc(data.phone))}
        ${this.row('Subject', this.esc(data.interestedIn || 'General Enquiry'))}
        ${this.row('Message', this.esc(data.message || '—'), true)}
      </table>

      <p style="margin:18px 0 0;font-size:13px;color:#64748b;line-height:1.6;">
        Reply to this email to respond to ${this.esc(data.name)} directly.
      </p>
    </td>
  </tr>

  <tr>
    <td style="padding:18px;background:#f8fafc;text-align:center;font-size:12px;color:#64748b;border-top:1px solid #e5e7eb;">
      © ${year} Bharath National Computers · internal notification
    </td>
  </tr>

</table>

</td></tr></table>
</body>
</html>
`;
  }

  // ============================================================
  // COMPANY FOOTER (shared by customer-facing mail)
  // ============================================================
  private companyFooter() {
    const year = new Date().getFullYear();

    return `
  <tr>
    <td style="padding:20px 32px;background:#f8fafc;border-top:1px solid #e5e7eb;">
      <div style="font-size:13px;font-weight:700;color:#0f172a;">Bharath National Computers</div>
      <div style="font-size:12px;color:#64748b;line-height:1.7;margin-top:6px;">
        ${BNC_ADDRESS_LINES.map((line) => this.esc(line)).join('<br/>')}<br/>
        ${this.esc(BNC_HOURS)}
      </div>
      <div style="font-size:12px;color:#94a3b8;margin-top:12px;">
        © ${year} Bharath National Computers
      </div>
    </td>
  </tr>`;
  }

  // ============================================================
  // TEMPLATE 2: ORDER PLACED (NO INVOICE)
  // ============================================================
  private buildOrderPlacedTemplate(order: OrderEmailPayload) {
    const year = new Date().getFullYear();
    const dateStr = this.formatDate(order.createdAt);
    const orderIdFormatted = `#ORD-${year}-${order.id}`;

    const computedSubtotal = (order.orderItem || []).reduce(
      (sum, it) => sum + (it.unitPrice || 0) * (it.quantity || 0),
      0,
    );

    const itemsRows = (order.orderItem || [])
      .map(
        (it) => `
<tr>
  <td style="padding:10px 12px;border-top:1px solid #e5e7eb;color:#0f172a;">
    ${this.esc(it.productName)}
  </td>
  <td style="padding:10px 12px;border-top:1px solid #e5e7eb;color:#334155;text-align:center;">
    ${this.esc(it.quantity)}
  </td>
  <td style="padding:10px 12px;border-top:1px solid #e5e7eb;color:#334155;text-align:right;">
    ${this.esc(this.money(it.unitPrice))}
  </td>
  <td style="padding:10px 12px;border-top:1px solid #e5e7eb;color:#0f172a;text-align:right;font-weight:800;">
    ${this.esc(this.money(it.unitPrice * it.quantity))}
  </td>
</tr>`,
      )
      .join('');

    return `
<!doctype html>
<html>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Inter,Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;">
<tr><td align="center" style="padding:40px 12px;">

<table width="600" cellpadding="0" cellspacing="0"
  style="background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 8px 28px rgba(0,0,0,0.08);">

  <tr><td style="height:6px;background:#16a34a;"></td></tr>
${this.logoBlock()}

  <tr>
    <td style="padding:28px 32px;">
      <div style="font-size:18px;font-weight:900;color:#0f172a;">Bharath National Computers</div>
      <div style="font-size:13px;margin-top:4px;color:#64748b;">Order Confirmation</div>
    </td>
  </tr>

  <tr>
    <td style="padding:0 32px 18px 32px;">
      <p style="margin:0 0 10px;font-size:15px;color:#0f172a;">
        Hi <b>${this.esc(order.fullName)}</b>,
      </p>
<p style="margin:0 0 16px;font-size:14px;line-height:1.7;color:#334155;">
        Thank you for your order with <b>Bharath National Computers</b>.
        Your order is confirmed and our team has begun processing it.
      </p>

      <table width="100%" cellpadding="0" cellspacing="0"
        style="background:#f8fafc;border-radius:10px;border:1px solid #e5e7eb;margin:14px 0 16px 0;">

        ${this.row('Order ID', this.esc(orderIdFormatted))}
        ${this.row('Order Date', this.esc(dateStr))}
        ${this.row('Order Status', this.esc(order.status || 'PLACED'))}
        ${this.row('Payment Status', this.esc(order.paymentStatus || 'PENDING'))}
        ${order.paymentMethod ? this.row('Payment Method', this.esc(order.paymentMethod.toUpperCase())) : ''}
        ${this.row('Email', this.esc(order.email))}
        ${this.row('Phone', this.esc(order.phone))}
        ${this.row('Delivery Place', this.esc(order.place))}
      </table>

      <table width="100%" cellpadding="0" cellspacing="0"
        style="border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
        <tr style="background:#f8fafc;">
          <th align="left" style="padding:10px 12px;font-size:12px;color:#64748b;">Product</th>
          <th align="center" style="padding:10px 12px;font-size:12px;color:#64748b;">Qty</th>
          <th align="right" style="padding:10px 12px;font-size:12px;color:#64748b;">Unit Price</th>
          <th align="right" style="padding:10px 12px;font-size:12px;color:#64748b;">Line Total</th>
        </tr>

        ${
          itemsRows ||
          `
<tr>
  <td colspan="4" style="padding:14px 12px;color:#64748b;text-align:center;">
    No items found
  </td>
</tr>`
        }

      </table>

      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:14px;">
        <tr>
          <td style="color:#64748b;font-size:13px;">Calculated Subtotal</td>
          <td style="color:#0f172a;font-size:13px;text-align:right;font-weight:800;">
            ${this.esc(this.money(computedSubtotal))}
          </td>
        </tr>
        <tr>
          <td style="color:#0f172a;font-size:14px;padding-top:8px;font-weight:900;">Total Amount</td>
          <td style="color:#0f172a;font-size:14px;padding-top:8px;text-align:right;font-weight:900;">
            ${this.esc(this.money(order.totalAmount))}
          </td>
        </tr>
      </table>
    </td>
  </tr>
   <tr>
    <td align="center" style="padding:28px;">
      <a href="mailto:${this.esc(process.env.SMTP_USER || '')}"
         style="display:inline-block;padding:14px 30px;background:#2563eb;color:#ffffff;
                text-decoration:none;font-size:14px;font-weight:600;border-radius:999px;">
        Reply to this email
      </a>
    </td>
  </tr>
${this.companyFooter()}

</table>

</td></tr></table>
</body>
</html>
`;
  }

  // ============================================================
  // TABLE ROW HELPER
  // ============================================================
  private row(label: string, value: string, multiline = false) {
    return `
<tr>
  <td style="padding:12px 14px;font-size:12px;color:#64748b;font-weight:700;vertical-align:top;">
    ${label}
  </td>
  <td style="padding:12px 14px;font-size:14px;color:#0f172a;font-weight:600;${
    multiline ? 'line-height:1.6;white-space:pre-line;' : ''
  }">
    ${value}
  </td>
</tr>
`;
  }
}
