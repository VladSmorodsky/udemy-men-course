const mailer = require('nodemailer');

exports.sendEmail = async (options) => {
  // const transport = mailer.createTransport({
  //   host: 'sandbox.smtp.mailtrap.io',
  //   port: 2525,
  //   auth: {
  //     user: '179e585a77c4a6',
  //     pass: '15b08767c2fccf'
  //   }
  // });
  const transport = mailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  await transport.sendMail({
    from: '"Vlad Foo 👻" <smorodsky.odesa@gmail.com>', // sender address
    to: options.email, // list of receivers
    subject: options.subject, // Subject line
    text: options.message
  });
};