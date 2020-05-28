require('dotenv').config();
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.API_EMAIL_KEY);

export const generate = ({to, from, subject, html, link}: any) => {
  const htmlReplace = html.replace('{link}', link)
  const replaceText = html.replace(/<[^>]*>/g, html).replace(/[\n|\n\r]/g, ' ')
  return { to, from, subject, text: replaceText, html: htmlReplace }
}

export const send = (email: any) => sgMail.send(email);

export const sendGrid = { generate, send };
