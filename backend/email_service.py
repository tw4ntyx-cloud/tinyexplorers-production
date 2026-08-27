"""Email service for Tiny Explorers API.

Handles sending transactional emails via Resend.
Supports:
- Parent confirmation emails after enrollment/inquiry
- Admin notification emails
- Newsletter welcome emails
"""

import html
import os
import logging
from typing import Optional
import resend

logger = logging.getLogger(__name__)

# Initialize Resend client
RESEND_API_KEY = os.environ.get("RESEND_API_KEY")
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admissions@tinyexplorers.bm")
FROM_EMAIL = os.environ.get("FROM_EMAIL", "enrollment@tinyexplorers.bm")

if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY
else:
    logger.warning("RESEND_API_KEY is not configured. Email sending has been disabled.")


class EmailService:
    """Wrapper around Resend email service."""

    @staticmethod
    def send_enrollment_confirmation(parent_email: str, parent_name: str, inquiry_id: str, program: str):
        """Send enrollment confirmation email to parent."""
        if not RESEND_API_KEY:
            logger.warning(f"Email disabled: RESEND_API_KEY not set. Would send to {parent_email}")
            return

        safe_parent_name = html.escape(parent_name)
        safe_program = html.escape(program)

        subject = "Your Tiny Explorers Enrollment Inquiry"
        html_body = f"""
        <html>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1F1F1F; line-height: 1.6;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <h1 style="color: #FF6B2C; font-size: 28px; margin-bottom: 20px;">Thank you for your interest!</h1>

              <p style="font-size: 16px; margin-bottom: 20px;">Hi {safe_parent_name},</p>

              <p style="font-size: 16px; margin-bottom: 20px;">
                We've received your enrollment inquiry for our <strong>{safe_program}</strong> program.
                Your submission ID is <code style="background: #f5f5f5; padding: 4px 8px; border-radius: 4px;">{inquiry_id}</code>.
              </p>
              
              <p style="font-size: 16px; margin-bottom: 20px;">
                Our enrollment team will review your information and reach out within one business day to schedule a tour 
                or answer any questions you may have about Tiny Explorers.
              </p>
              
              <div style="background: #FFF7EE; border-left: 4px solid #FF6B2C; padding: 20px; margin: 30px 0; border-radius: 4px;">
                <p style="margin: 0; font-size: 14px;">
                  <strong>In the meantime:</strong>
                </p>
                <ul style="margin: 10px 0 0 0; padding-left: 20px; font-size: 14px;">
                  <li>Explore our <a href="https://tinyexplorers.bm/philosophy" style="color: #FF6B2C; text-decoration: none;">philosophy and approach</a></li>
                  <li>Check out our <a href="https://tinyexplorers.bm/#gallery" style="color: #FF6B2C; text-decoration: none;">photo gallery</a></li>
                  <li>Learn about our <a href="https://tinyexplorers.bm/wellness" style="color: #FF6B2C; text-decoration: none;">wellness & care practices</a></li>
                </ul>
              </div>
              
              <p style="font-size: 16px; margin-bottom: 20px;">
                If you have any urgent questions, feel free to call us at <a href="tel:+14415550100" style="color: #FF6B2C; text-decoration: none;">+1 (441) 555-0100</a> 
                or email <a href="mailto:admissions@tinyexplorers.bm" style="color: #FF6B2C; text-decoration: none;">admissions@tinyexplorers.bm</a>.
              </p>
              
              <p style="font-size: 16px; margin-bottom: 40px;">
                Looking forward to meeting your family!
              </p>
              
              <p style="border-top: 1px solid #e5e5e5; padding-top: 20px; margin-top: 40px; color: #888; font-size: 12px;">
                Tiny Explorers Bermuda Ltd.<br>
                Hamilton, Bermuda<br>
                <a href="https://tinyexplorers.bm" style="color: #FF6B2C; text-decoration: none;">tinyexplorers.bm</a>
              </p>
            </div>
          </body>
        </html>
        """

        try:
            email = resend.Emails.send(
                {
                    "from": FROM_EMAIL,
                    "to": parent_email,
                    "subject": subject,
                    "html": html_body,
                }
            )
            logger.info(f"Enrollment confirmation email sent to {parent_email} (ID: {inquiry_id})")
            return email
        except Exception as e:
            logger.error(f"Failed to send enrollment confirmation to {parent_email}: {str(e)}")
            return None

    @staticmethod
    def send_enrollment_admin_notification(parent_name: str, parent_email: str, phone: str, child_age: str, program: str, inquiry_id: str):
        """Send admin notification when new enrollment inquiry received."""
        if not RESEND_API_KEY:
            logger.warning(f"Email disabled: Would send admin notification for inquiry {inquiry_id}")
            return

        safe_parent_name = html.escape(parent_name)
        safe_parent_email = html.escape(parent_email)
        safe_phone = html.escape(phone) if phone else "Not provided"
        safe_child_age = html.escape(child_age)
        safe_program = html.escape(program)

        subject = f"New Enrollment Inquiry: {parent_name}"
        html_body = f"""
        <html>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1F1F1F; line-height: 1.6;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <h1 style="color: #22C55E; font-size: 24px; margin-bottom: 20px;">🌱 New Enrollment Inquiry</h1>

              <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <p style="margin: 0 0 15px 0;"><strong>Inquiry ID:</strong> {inquiry_id}</p>
                <p style="margin: 0 0 15px 0;"><strong>Parent Name:</strong> {safe_parent_name}</p>
                <p style="margin: 0 0 15px 0;"><strong>Email:</strong> <a href="mailto:{safe_parent_email}" style="color: #FF6B2C;">{safe_parent_email}</a></p>
                <p style="margin: 0 0 15px 0;"><strong>Phone:</strong> {safe_phone}</p>
                <p style="margin: 0 0 15px 0;"><strong>Child Age:</strong> {safe_child_age}</p>
                <p style="margin: 0;"><strong>Program Interest:</strong> {safe_program}</p>
              </div>
              
              <p style="font-size: 14px; color: #666;">
                <a href="https://admin.tinyexplorers.bm/inquiries/{inquiry_id}" style="color: #FF6B2C; text-decoration: none;">View in admin dashboard →</a>
              </p>
            </div>
          </body>
        </html>
        """

        try:
            email = resend.Emails.send(
                {
                    "from": FROM_EMAIL,
                    "to": ADMIN_EMAIL,
                    "subject": subject,
                    "html": html_body,
                }
            )
            logger.info(f"Admin notification sent for inquiry {inquiry_id}")
            return email
        except Exception as e:
            logger.error(f"Failed to send admin notification for inquiry {inquiry_id}: {str(e)}")
            return None


    @staticmethod
    def send_newsletter_welcome(email: str):
        """Send welcome email to new newsletter subscriber."""
        if not RESEND_API_KEY:
            logger.warning("Email disabled: would send newsletter welcome email (RESEND_API_KEY not set)")
            return

        subject = "Welcome to Tiny Explorers Updates"
        html_body = f"""
        <html>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1F1F1F; line-height: 1.6;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <h1 style="color: #FBC247; font-size: 28px; margin-bottom: 20px;">Welcome to Our Community! 🌟</h1>
              
              <p style="font-size: 16px; margin-bottom: 20px;">
                Thank you for subscribing to Tiny Explorers updates.
              </p>
              
              <p style="font-size: 16px; margin-bottom: 20px;">
                You'll now receive emails about:
              </p>
              
              <ul style="font-size: 16px; margin-bottom: 20px; padding-left: 20px;">
                <li>Open house dates and special events</li>
                <li>Thoughtful parenting essays and tips</li>
                <li>Insights into our philosophy and approach</li>
                <li>Community updates and milestones</li>
              </ul>
              
              <p style="font-size: 16px; margin-bottom: 40px;">
                We're thrilled to stay connected with you.
              </p>
              
              <p style="border-top: 1px solid #e5e5e5; padding-top: 20px; color: #888; font-size: 12px;">
                Tiny Explorers Bermuda Ltd. | <a href="https://tinyexplorers.bm" style="color: #FF6B2C; text-decoration: none;">tinyexplorers.bm</a>
              </p>
            </div>
          </body>
        </html>
        """

        try:
            email_result = resend.Emails.send(
                {
                    "from": FROM_EMAIL,
                    "to": email,
                    "subject": subject,
                    "html": html_body,
                }
            )
            logger.info("Newsletter welcome email sent")
            return email_result
        except Exception as e:
            logger.error(f"Failed to send newsletter welcome email: {str(e)}")
            return None

    @staticmethod
    def send_generic_confirmation(parent_email: str, parent_name: str, reference_id: str, context_label: str):
        """Send a parent confirmation for any form submission (inquiry, admissions, etc.)."""
        if not RESEND_API_KEY:
            logger.warning(f"Email disabled: RESEND_API_KEY not set. Would send to {parent_email}")
            return

        safe_parent_name = html.escape(parent_name)

        subject = f"We received your {context_label}"
        html_body = f"""
        <html>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1F1F1F; line-height: 1.6;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <h1 style="color: #FF6B2C; font-size: 28px; margin-bottom: 20px;">Thank you, {safe_parent_name}!</h1>
              <p style="font-size: 16px; margin-bottom: 20px;">
                We've received your {context_label}. Your reference ID is
                <code style="background: #f5f5f5; padding: 4px 8px; border-radius: 4px;">{reference_id}</code>.
              </p>
              <p style="font-size: 16px; margin-bottom: 20px;">
                Our team will be in touch within one business day.
              </p>
              <p style="border-top: 1px solid #e5e5e5; padding-top: 20px; margin-top: 40px; color: #888; font-size: 12px;">
                Tiny Explorers Bermuda Ltd.<br>Hamilton, Bermuda
              </p>
            </div>
          </body>
        </html>
        """

        try:
            email = resend.Emails.send(
                {
                    "from": FROM_EMAIL,
                    "to": parent_email,
                    "subject": subject,
                    "html": html_body,
                }
            )
            logger.info(f"Confirmation email sent to {parent_email} (ref: {reference_id})")
            return email
        except Exception as e:
            logger.error(f"Failed to send confirmation to {parent_email}: {str(e)}")
            return None

    @staticmethod
    def send_generic_admin_notification(subject_line: str, heading: str, fields: dict, reference_id: str):
        """Send an admin notification for any form submission, rendering `fields` as a detail table."""
        if not RESEND_API_KEY:
            logger.warning(f"Email disabled: Would send admin notification for {reference_id}")
            return

        rows = "".join(
            f'<p style="margin: 0 0 15px 0;"><strong>{html.escape(str(label))}:</strong> '
            f'{html.escape(str(value)) if value else "Not provided"}</p>'
            for label, value in fields.items()
        )
        html_body = f"""
        <html>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1F1F1F; line-height: 1.6;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <h1 style="color: #22C55E; font-size: 24px; margin-bottom: 20px;">{heading}</h1>
              <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <p style="margin: 0 0 15px 0;"><strong>Reference ID:</strong> {reference_id}</p>
                {rows}
              </div>
            </div>
          </body>
        </html>
        """

        try:
            email = resend.Emails.send(
                {
                    "from": FROM_EMAIL,
                    "to": ADMIN_EMAIL,
                    "subject": subject_line,
                    "html": html_body,
                }
            )
            logger.info(f"Admin notification sent for {reference_id}")
            return email
        except Exception as e:
            logger.error(f"Failed to send admin notification for {reference_id}: {str(e)}")
            return None


async def send_enrollment_confirmation(parent_email: str, parent_name: str, inquiry_id: str, program: str):
    return EmailService.send_enrollment_confirmation(
        parent_email=parent_email,
        parent_name=parent_name,
        inquiry_id=inquiry_id,
        program=program,
    )


async def send_enrollment_admin_notification(parent_name: str, parent_email: str, phone: str, child_age: str, program: str, inquiry_id: str):
  return EmailService.send_enrollment_admin_notification(
    parent_name=parent_name,
    parent_email=parent_email,
    phone=phone,
    child_age=child_age,
    program=program,
    inquiry_id=inquiry_id,
  )


async def send_newsletter_welcome(email: str):
  return EmailService.send_newsletter_welcome(email)


async def send_generic_confirmation(parent_email: str, parent_name: str, reference_id: str, context_label: str):
    return EmailService.send_generic_confirmation(
        parent_email=parent_email,
        parent_name=parent_name,
        reference_id=reference_id,
        context_label=context_label,
    )


async def send_generic_admin_notification(subject_line: str, heading: str, fields: dict, reference_id: str):
    return EmailService.send_generic_admin_notification(
        subject_line=subject_line,
        heading=heading,
        fields=fields,
        reference_id=reference_id,
    )
