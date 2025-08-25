import nodemailer from "nodemailer";
const account = await nodemailer.createTestAccount();

const transpoter = nodemailer.createTransport({
  host: account.smtp.host,
  port: account.smtp.port,
  secure: account.smtp.secure,
  auth: {
    user: account.user,
    pass: account.pass,
  },
});

export const sendEmail = async (userId, completed, failed) => {
  try {
    const body = `Your batch processing done. Total completed records are ${completed}. There are ${failed} records`;
    const email = "niteshjjha096@gmail.com";
    const info = await transpoter.sendMail({
      from: "ScanMe",
      to: email,
      subject: "Batch processing report",
      text: body,
    });
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error(error);
  }
};
