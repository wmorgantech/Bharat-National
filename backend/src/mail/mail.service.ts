import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

type ContactAckPayload = {
  to: string;
  name: string;
  phone: string;
  interestedIn?: string;
  message?: string;
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
  orderItem: Array<{
    productName: string;
    unitPrice: number;
    quantity: number;
  }>;
};

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
      throw new Error('SMTP configuration is missing');
    }

    this.transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
      connectionTimeout: 15_000,
      greetingTimeout: 15_000,
    });

    this.transporter.verify((err) => {
      if (err) {
        this.logger.error('SMTP verification failed', err);
      } else {
        this.logger.log('SMTP ready');
      }
    });
  }

  // ============================================================
  // 1) CONTACT ACK EMAIL
  // ============================================================
  async sendContactAckToUser(data: ContactAckPayload) {
    const html = this.buildUserAckTemplate(data);

    try {
      return await this.transporter.sendMail({
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
  // 2) ORDER PLACED EMAIL
  // ============================================================
  async sendOrderPlacedToUser(order: OrderEmailPayload) {
    const html = this.buildOrderPlacedTemplate(order);

    try {
      return await this.transporter.sendMail({
        from: `"Bharath National Computers" <${process.env.SMTP_USER}>`,
        to: order.email,
        replyTo: process.env.SMTP_USER,
        subject: `We received your Order Enquiry – #${order.id}`,
        html,
      });
    } catch (error) {
      this.logger.error('Order enquiry email send failed', error);
      throw new Error('Failed to send order enquiry email');
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
        Thank you for contacting <b>Bharath National Computers</b>.
        We’ve received your enquiry about order details and our team is reviewing it.
      </p>

      <table width="100%" cellpadding="0" cellspacing="0"
        style="background:#f8fafc;border-radius:10px;border:1px solid #e5e7eb;margin:14px 0 16px 0;">
        
        ${this.row('Order ID', this.esc(orderIdFormatted))}
        ${this.row('Order Date', this.esc(dateStr))}
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

  <tr>
    <td style="padding:18px;background:#f8fafc;text-align:center;font-size:12px;color:#64748b;border-top:1px solid #e5e7eb;">
      © ${year} Bharath National Computers
    </td>
  </tr>

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
