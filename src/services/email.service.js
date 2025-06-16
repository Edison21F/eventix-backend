const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = this.createTransporter();
  }

  createTransporter() {
    // Configurar según tu proveedor de email
    return nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false, // true para 465, false para otros puertos
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendNotificationEmail(notification) {
    try {
      const mailOptions = {
        from: process.env.FROM_EMAIL || 'noreply@eventix.com',
        to: notification.user_email, // Necesitarás obtener el email del usuario
        subject: notification.title,
        html: this.generateEmailTemplate(notification)
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return result;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  generateEmailTemplate(notification) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">${notification.title}</h2>
        <p style="color: #666; line-height: 1.6;">${notification.message}</p>
        ${notification.action_url ? `
          <a href="${notification.action_url}" 
             style="display: inline-block; background: #007bff; color: white; 
                    padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            ${notification.action_text || 'Ver más'}
          </a>
        ` : ''}
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 12px;">
          Este es un email automático de EvenTix. No responda a este mensaje.
        </p>
      </div>
    `;
  }
}

module.exports = new EmailService();