import { sendEmail } from '../util/emailer.js';
import { padZero, generateRandomString } from '../util/utilities.js';
import dotenv from 'dotenv';

dotenv.config();
const siteEmail = process.env.EMAIL_ADDRESS;

class EmailActions {

    async emailerSend(templateType, data) {
        let subject = '';
        let text = '';
        let html = '';
        let dateObj = new Date();
        let formattedDate = '';
        let formattedTime = '';
        let readableDate = '';

        try {
            switch (templateType) {
                case "newBookingSent":
                    dateObj = new Date(data.BOOKING_DATE);
                    // const formattedDate = `${dateObj.getUTCFullYear()}-${padZero(dateObj.getUTCMonth() + 1)}-${padZero(dateObj.getUTCDate())}`;
                    // const formattedTime = `${padZero(dateObj.getUTCHours())}:${padZero(dateObj.getUTCMinutes())}:${padZero(dateObj.getUTCSeconds())}`;
                    // const readableDate = `${formattedDate} ${formattedTime}`;
                    readableDate = dateObj.toString().replace('T', ' ');

                    subject = 'Booking Submitted';
                    text = `Dear ${data.BOOKING_NAME}, we have received your booking for ${readableDate}.`;
                    html = `
                    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                        <h2 style="color: #00700f;">Booking Submitted</h2>
                        <p style="font-size: 16px;">Dear ${data.BOOKING_NAME},</p>
                        <p style="font-size: 16px;">We have received your booking for ${readableDate}.</p>
                        <div style="background-color: #f9f9f9; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
                            <h3 style="color: #333; margin-top: 0;">Booking Details:</h3>
                            <p><strong>Booking Tracking Number:</strong> ${data.ID_BOOKING}</p>
                            <p><strong>Name:</strong> ${data.BOOKING_NAME}</p>
                            <p><strong>Phone Number:</strong> ${data.BOOKING_TEL}</p>
                            <p><strong>Persons:</strong> ${data.BOOKING_PAX} pax</p>
                            <p><strong>Remarks:</strong> ${data.BOOKING_REMARKS}</p>
                        </div>
                        <p style="font-size: 14px; margin-top: 20px;">An email will be sent to you upon confirmation of the booking. Thank you.</p>
                        <p style="font-size: 14px; margin-top: 20px;">Best regards,<br><strong>Seri Padi De Cabin Management</strong></p>
                    </div>`;

                    const adminSubject = 'New Booking Received';
                    const adminText = `A new booking has been received from ${data.BOOKING_NAME} for ${readableDate}.`;
                    const adminHtml = `
                    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                        <h2 style="color: #00700f;">New Booking Notification</h2>
                        <p style="font-size: 16px;">A new booking has been received from ${data.BOOKING_NAME}.</p>
                        <div style="background-color: #f9f9f9; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
                            <h3 style="color: #333; margin-top: 0;">Booking Details:</h3>
                            <p><strong>Booking Tracking Number:</strong> ${data.ID_BOOKING}</p>
                            <p><strong>Name:</strong> ${data.BOOKING_NAME}</p>
                            <p><strong>Email:</strong> ${data.BOOKING_EMAIL}</p>
                            <p><strong>Phone Number:</strong> ${data.BOOKING_TEL}</p>
                            <p><strong>Persons:</strong> ${data.BOOKING_PAX} pax</p>
                            <p><strong>Remarks:</strong> ${data.BOOKING_REMARKS}</p>
                            <p><strong>Booking Date:</strong> ${readableDate}</p>
                        </div>
                        <p style="font-size: 14px; margin-top: 20px;">Please review and process this booking as soon as possible.</p>
                        <p style="font-size: 14px; margin-top: 20px;">Best regards,<br><strong>Seri Padi De Cabin Management</strong></p>
                    </div>`;

                    await sendEmail(data.BOOKING_EMAIL, subject, text, html);
                    await sendEmail(siteEmail, adminSubject, adminText, adminHtml);
                    break;
                case "newMessageSent":
                    subject = 'A New Message Has Been Received';
                    text = ``;
                    html = `
                    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                        <h2 style="color: #f9f9f9;">Dear Admin,</h2>
                        <p style="font-size: 16px;">You have received a new message from the contact form on Seri Padi De Cabin's website.</p>
                        <div style="background-color: #f9f9f9; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
                            <h3 style="color: #333; margin-top: 0;">Message Details:</h3>
                            <p><strong>Subject:</strong> ${data.MESSAGE_SUBJECT}</p>
                            <p><strong>Content:</strong> ${data.MESSAGE_CONTENT}</p>
                        </div>
                        <p style="font-size: 14px; margin-top: 20px;">Please review and respond to this message as soon as possible.</p>
                        <p style="font-size: 14px; margin-top: 20px;">Best regards,<br><strong>Seri Padi De Cabin Management</strong></p>
                    </div>`;
                    await sendEmail(siteEmail, subject, text, html);
                    break;
                case "bookingCancelled":
                    dateObj = new Date(data.BOOKING_DATE);
                    formattedDate = `${dateObj.getUTCFullYear()}-${padZero(dateObj.getUTCMonth() + 1)}-${padZero(dateObj.getUTCDate())}`;
                    formattedTime = `${padZero(dateObj.getUTCHours())}:${padZero(dateObj.getUTCMinutes())}:${padZero(dateObj.getUTCSeconds())}`;
                    readableDate = `${formattedDate} ${formattedTime}`;
                    // readableDate = dateObj.toString().replace('T', ' ');

                    subject = 'Booking Cancelled - Seri Padi De Cabin';
                    html = `
                        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                            <h2 style="color: #ce1212;">Booking Cancelled</h2>
                            <p style="font-size: 16px;">Dear ${data.BOOKING_NAME},</p>
                            <p style="font-size: 16px;">We regret to inform you that your booking scheduled for ${readableDate} has been cancelled.</p>
                            <p style="font-size: 16px;">Reason for cancellation: ${data.BOOKING_RESPONSE}</p>
                            <p style="font-size: 14px; margin-top: 20px;">We apologize for any inconvenience caused. Please contact us at 017-324 4866 for further assistance.</p>
                            <p style="font-size: 14px; margin-top: 20px;">Best regards,<br><strong>Seri Padi De Cabin Management</strong></p>
                        </div>
                    `;
                    await sendEmail(data.BOOKING_EMAIL, subject, '', html);
                    break;
                case "bookingConfirmed":
                    dateObj = new Date(data.BOOKING_DATE);
                    formattedDate = `${dateObj.getUTCFullYear()}-${padZero(dateObj.getUTCMonth() + 1)}-${padZero(dateObj.getUTCDate())}`;
                    formattedTime = `${padZero(dateObj.getUTCHours())}:${padZero(dateObj.getUTCMinutes())}:${padZero(dateObj.getUTCSeconds())}`;
                    readableDate = `${formattedDate} ${formattedTime}`;
                    // readableDate = dateObj.toString().replace('T', ' ');
                    subject = 'Booking Confirmed - Seri Padi De Cabin';
                    html = `
                        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                            <h2 style="color: ##00700f;">Booking Confirmed</h2>
                            <p style="font-size: 16px;">Dear ${data.BOOKING_NAME},</p>
                            <p style="font-size: 16px;">We are pleased to confirm your booking scheduled for ${readableDate}.</p>
                            <p style="font-size: 14px; margin-top: 20px;">Thank you for choosing Seri Padi De Cabin. We look forward to welcoming you!</p>
                            <p style="font-size: 14px; margin-top: 20px;">Best regards,<br><strong>Seri Padi De Cabin Management</strong></p>
                        </div>
                    `;
                    await sendEmail(data.BOOKING_EMAIL, subject, '', html);
                    break;
                default:
                    break;
            }
        } catch (error) {
            console.log(error);
        }
    }
}

export default EmailActions;
