import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import logger from '../utils/logger.js';

class EmailService {
  constructor() {
    this.transporter = null;
    this.initTransporter();
    this.compileTemplates();
  }

  /**
   * Initialize nodemailer transport mechanism.
   */
  async initTransporter() {
    try {
      // Graceful fallback to mock transporter for local offline development
      this.transporter = nodemailer.createTransport({
        jsonTransport: true,
      });
      logger.info('[Email Service] JSON Transport initialized successfully.');
    } catch (err) {
      logger.error(`[Email Service Init Failed]: ${err.message}`);
    }
  }

  /**
   * Pre-compile handlebars layouts templates.
   */
  compileTemplates() {
    const layoutWrapper = (title, bodyContent) => `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: sans-serif; background-color: #F4F4F5; margin: 0; padding: 20px; color: #18181B; }
            .container { max-width: 600px; background-color: #FFFFFF; border-radius: 12px; padding: 24px; border: 1px solid #E4E4E7; margin: 0 auto; }
            .header { border-bottom: 2px solid #E4E4E7; padding-bottom: 16px; margin-bottom: 16px; }
            .logo { font-size: 20px; font-weight: bold; color: #4F46E5; }
            .content { line-height: 1.6; font-size: 14px; }
            .footer { border-top: 1px solid #E4E4E7; margin-top: 24px; padding-top: 12px; font-size: 11px; color: #71717A; text-align: center; }
            .btn { display: inline-block; padding: 10px 20px; background-color: #4F46E5; color: #FFFFFF !important; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 13px; margin-top: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <span class="logo">Food Redistribution Platform</span>
            </div>
            <div class="content">
              ${bodyContent}
            </div>
            <div class="footer">
              &copy; 2026 Food Waste Redistribution Platform. Seattle, WA.
            </div>
          </div>
        </body>
      </html>
    `;

    this.templates = {
      welcome: handlebars.compile(
        layoutWrapper(
          'Welcome to the Platform',
          '<h2>Welcome {{name}}!</h2><p>Thank you for joining our mission to eliminate food waste. Your account is active. Feel free to explore our dashboard.</p>'
        )
      ),
      verification: handlebars.compile(
        layoutWrapper(
          'Email Verification Required',
          '<h2>Verify Your Email</h2><p>Please verify your email address by clicking the link below:</p><a class="btn" href="{{verificationUrl}}">Verify Email</a>'
        )
      ),
      forgotPassword: handlebars.compile(
        layoutWrapper(
          'Reset Your Password',
          '<h2>Password Reset Requested</h2><p>We received a request to reset your password. Click below to continue:</p><a class="btn" href="{{resetUrl}}">Reset Password</a>'
        )
      ),
      passwordChanged: handlebars.compile(
        layoutWrapper(
          'Password Changed Successful',
          '<h2>Password Changed Successfully</h2><p>Your password was updated successfully. If this wasn\'t you, contact support immediately.</p>'
        )
      ),
      donationCreated: handlebars.compile(
        layoutWrapper(
          'Donation Created',
          '<h2>New Surplus Donation Listed</h2><p>A new surplus listing has been created: <strong>{{foodName}}</strong> (Category: {{category}}).</p>'
        )
      ),
      donationExpired: handlebars.compile(
        layoutWrapper(
          'Donation Expired',
          '<h2>Surplus Listing Expired</h2><p>Your surplus food donation listing: <strong>{{foodName}}</strong> has reached its expiration time and is now closed.</p>'
        )
      ),
      donationRequested: handlebars.compile(
        layoutWrapper(
          'Donation Claimed',
          '<h2>Donation Claim Request</h2><p>NGO Organization <strong>{{ngoName}}</strong> has claimed your food listing: <strong>{{foodName}}</strong>.</p>'
        )
      ),
      requestApproved: handlebars.compile(
        layoutWrapper(
          'Claim Approved',
          '<h2>Request Claim Approved</h2><p>Your claim request for donation listing: <strong>{{foodName}}</strong> was approved. Distribution assignment is scheduled.</p>'
        )
      ),
      volunteerAssigned: handlebars.compile(
        layoutWrapper(
          'Volunteer Assigned',
          '<h2>New Redistribution Assignment</h2><p>You have been assigned to distribute food listing: <strong>{{foodName}}</strong> to NGO point: <strong>{{ngoName}}</strong>.</p>'
        )
      ),
      pickupReminder: handlebars.compile(
        layoutWrapper(
          'Pickup Time Reminder',
          '<h2>Surplus Food Pickup Reminder</h2><p>Friendly reminder: Please pick up food listing: <strong>{{foodName}}</strong> from donor address within next hour.</p>'
        )
      ),
      deliveryReminder: handlebars.compile(
        layoutWrapper(
          'Delivery Transit Reminder',
          '<h2>Distribution Delivery Reminder</h2><p>Please deliver items for food listing: <strong>{{foodName}}</strong> to NGO point: <strong>{{ngoName}}</strong>.</p>'
        )
      ),
      deliveryCompleted: handlebars.compile(
        layoutWrapper(
          'Delivery Completed',
          '<h2>Food Distribution Completed Successfully</h2><p>Thank you! Food surplus items for listing: <strong>{{foodName}}</strong> have been delivered successfully.</p>'
        )
      ),
      complaintResponse: handlebars.compile(
        layoutWrapper(
          'Complaint Support Response',
          '<h2>Support Ticket Update</h2><p>A support response has been posted for ticket subject: "<em>{{subject}}</em>".</p><p><strong>Response:</strong> {{responseText}}</p>'
        )
      ),
      adminAnnouncement: handlebars.compile(
        layoutWrapper(
          'System Announcement',
          '<h2>System Announcement</h2><p><strong>{{title}}</strong></p><p>{{message}}</p>'
        )
      ),
    };
  }

  /**
   * Send mail wrapper.
   */
  async sendMail(to, subject, templateName, context) {
    if (!this.transporter) {
      logger.warn('[Email Service Warning]: Transporter not initialized.');
      return;
    }

    const templateFn = this.templates[templateName];
    if (!templateFn) {
      logger.error(`[Email Service Error]: Template name ${templateName} not found.`);
      return;
    }

    const html = templateFn(context);
    try {
      const info = await this.transporter.sendMail({
        from: '"Food Waste Platform" <noreply@foodplatform.org>',
        to,
        subject,
        html,
      });
      logger.info(`[Email Sent] Message sent to ${to} (Template: ${templateName})`);
      return info;
    } catch (err) {
      logger.error(`[Email Send Error]: ${err.message}`);
    }
  }
}

const emailService = new EmailService();
export default emailService;
