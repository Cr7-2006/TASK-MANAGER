const nodemailer = require('nodemailer');

// Create a reusable transporter
const createTransporter = () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });
};

// ─── Task Notification Email ─────────────────────────────────────
const sendTaskEmail = async (recipientEmail, username, subject, title, status, description) => {
  const transporter = createTransporter();
  if (!transporter) {
    console.log(`[Email Service] Skipped sending email to ${recipientEmail} because EMAIL_USER or EMAIL_PASS is not configured in server/.env`);
    return;
  }

  try {
    const statusColors = {
      todo: '#3b82f6',
      'in-progress': '#eab308',
      completed: '#10b981',
    };
    const statusColor = statusColors[status] || '#8b5cf6';

    const mailOptions = {
      from: `"TaskMaster App" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: `TaskMaster Alert: ${subject}`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #0f172a; padding: 2rem; color: #f3f4f6; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid rgba(255,255,255,0.08);">
          <div style="text-align: center; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 1.5rem; margin-bottom: 1.5rem;">
            <h1 style="color: #ffffff; font-size: 1.8rem; margin: 0;">TaskMaster Notification</h1>
            <p style="color: #94a3b8; font-size: 0.9rem; margin: 5px 0 0 0;">Keeping you organized and productive</p>
          </div>
          <p style="font-size: 1rem; line-height: 1.5; color: #cbd5e1;">Hi ${username},</p>
          <p style="font-size: 1.1rem; font-weight: 600; color: #ffffff; margin-bottom: 1.25rem;">${subject}</p>
          <div style="background-color: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 10px; margin-bottom: 1.5rem;">
            <h3 style="margin: 0 0 0.5rem 0; color: #ffffff; font-size: 1.2rem;">${title}</h3>
            <div style="margin-bottom: 1rem;">
              <span style="display: inline-block; padding: 0.25rem 0.75rem; border-radius: 20px; background-color: ${statusColor}20; border: 1px solid ${statusColor}50; color: ${statusColor}; font-size: 0.8rem; font-weight: 700; text-transform: uppercase;">
                ${status === 'in-progress' ? 'In Progress' : status}
              </span>
            </div>
            <p style="margin: 0; font-size: 0.95rem; color: #94a3b8; line-height: 1.5; white-space: pre-wrap;">${description || 'No description provided.'}</p>
          </div>
          <p style="font-size: 0.85rem; color: #64748b; text-align: center; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 1.5rem; margin-top: 2rem;">
            This is an automated notification from your TaskMaster application.
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Service] Notification email sent successfully: ${info.messageId}`);
  } catch (error) {
    console.error('[Email Service] Failed to send notification email:', error);
  }
};

// ─── Welcome / Registration Email ────────────────────────────────
const sendWelcomeEmail = async (recipientEmail, username) => {
  const transporter = createTransporter();
  if (!transporter) {
    console.log(`[Email Service] Skipped welcome email to ${recipientEmail} — SMTP not configured.`);
    return;
  }

  try {
    const mailOptions = {
      from: `"TaskMaster App" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: '🎉 Welcome to TaskMaster — Registration Successful!',
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #0f172a; padding: 2rem; color: #f3f4f6; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid rgba(255,255,255,0.08);">
          <div style="text-align: center; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 1.5rem; margin-bottom: 1.5rem;">
            <div style="display: inline-block; width: 60px; height: 60px; background: linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%); border-radius: 14px; line-height: 60px; font-size: 1.8rem; margin-bottom: 0.75rem;">✓</div>
            <h1 style="color: #ffffff; font-size: 1.8rem; margin: 0;">Welcome to TaskMaster!</h1>
            <p style="color: #94a3b8; font-size: 0.9rem; margin: 5px 0 0 0;">Your account has been created successfully</p>
          </div>
          
          <p style="font-size: 1.05rem; line-height: 1.6; color: #cbd5e1;">Hi <strong style="color: #ffffff;">${username}</strong>,</p>
          <p style="font-size: 1rem; line-height: 1.6; color: #cbd5e1;">
            Thank you for joining <strong style="color: #a78bfa;">TaskMaster</strong>! Your account is now fully activated and ready to use.
          </p>

          <div style="background: linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(6,182,212,0.08) 100%); border: 1px solid rgba(124,58,237,0.15); padding: 1.5rem; border-radius: 10px; margin: 1.5rem 0;">
            <h3 style="margin: 0 0 1rem 0; color: #ffffff; font-size: 1rem;">🚀 Here's what you can do:</h3>
            <ul style="margin: 0; padding: 0 0 0 1.2rem; color: #94a3b8; font-size: 0.95rem; line-height: 2;">
              <li>Create and organize tasks with priorities & due dates</li>
              <li>Drag-and-drop tasks across Kanban board columns</li>
              <li>Track progress with subtask checklists & analytics</li>
              <li>Use AI Auto-Fill to generate task details instantly</li>
              <li>Export your task data as CSV spreadsheets</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 2rem 0 1.5rem 0;">
            <p style="font-size: 0.95rem; color: #94a3b8;">Your registered email:</p>
            <p style="font-size: 1.1rem; font-weight: 700; color: #a78bfa;">${recipientEmail}</p>
          </div>

          <p style="font-size: 0.85rem; color: #64748b; text-align: center; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 1.5rem; margin-top: 2rem;">
            This is an automated welcome email from TaskMaster. If you did not register, please ignore this email.
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Service] Welcome email sent to ${recipientEmail}: ${info.messageId}`);
  } catch (error) {
    console.error('[Email Service] Failed to send welcome email:', error);
  }
};

// ─── OTP / Password Reset Email ──────────────────────────────────
const sendOtpEmail = async (recipientEmail, username, otp) => {
  const transporter = createTransporter();
  if (!transporter) {
    console.log(`[Email Service] Skipped OTP email to ${recipientEmail} — SMTP not configured.`);
    return;
  }

  try {
    const mailOptions = {
      from: `"TaskMaster App" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: '🔐 TaskMaster — Password Reset OTP',
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #0f172a; padding: 2rem; color: #f3f4f6; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid rgba(255,255,255,0.08);">
          <div style="text-align: center; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 1.5rem; margin-bottom: 1.5rem;">
            <div style="display: inline-block; width: 60px; height: 60px; background: linear-gradient(135deg, #ef4444 0%, #f97316 100%); border-radius: 14px; line-height: 60px; font-size: 1.8rem; margin-bottom: 0.75rem;">🔐</div>
            <h1 style="color: #ffffff; font-size: 1.8rem; margin: 0;">Password Reset</h1>
            <p style="color: #94a3b8; font-size: 0.9rem; margin: 5px 0 0 0;">Use the OTP below to reset your password</p>
          </div>
          
          <p style="font-size: 1rem; line-height: 1.6; color: #cbd5e1;">Hi <strong style="color: #ffffff;">${username}</strong>,</p>
          <p style="font-size: 1rem; line-height: 1.6; color: #cbd5e1;">
            We received a request to reset your password. Use the following One-Time Password (OTP) to proceed:
          </p>

          <div style="text-align: center; margin: 2rem 0;">
            <div style="display: inline-block; background: linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(6,182,212,0.12) 100%); border: 2px solid rgba(124,58,237,0.3); padding: 1.25rem 3rem; border-radius: 12px;">
              <span style="font-size: 2.5rem; font-weight: 800; letter-spacing: 0.75rem; color: #ffffff; font-family: 'Courier New', monospace;">${otp}</span>
            </div>
          </div>

          <div style="background-color: rgba(239,68,68,0.06); border: 1px solid rgba(239,68,68,0.12); padding: 1rem 1.25rem; border-radius: 8px; margin: 1.5rem 0;">
            <p style="margin: 0; font-size: 0.9rem; color: #f87171; font-weight: 600;">⚠️ Important:</p>
            <ul style="margin: 0.5rem 0 0 0; padding: 0 0 0 1.2rem; color: #94a3b8; font-size: 0.85rem; line-height: 1.8;">
              <li>This OTP is valid for <strong style="color: #f87171;">10 minutes</strong> only.</li>
              <li>Do not share this code with anyone.</li>
              <li>If you didn't request this, you can safely ignore this email.</li>
            </ul>
          </div>

          <p style="font-size: 0.85rem; color: #64748b; text-align: center; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 1.5rem; margin-top: 2rem;">
            This is an automated email from TaskMaster. Never share your OTP with anyone.
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Service] OTP email sent to ${recipientEmail}: ${info.messageId}`);
  } catch (error) {
    console.error('[Email Service] Failed to send OTP email:', error);
  }
};

module.exports = { sendTaskEmail, sendWelcomeEmail, sendOtpEmail };
