const nodemailer = require("nodemailer");

exports.sendWelcomeEmail = async (req, res, next) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "dev.musicon@gmail.com",
        pass: "DEVmusicon2021",
      },
    });

    const options = {
      from: "dev.musicon@gmail.com",
      to: req.body.email,
      subject: "Welcome to Musicon 🎵",
      text: `
      Hey there! 
      
      Thank you for signing up to our service. We are a group of motivated individuals that aims to bring you the best music experience online. Feel free to leave any feedback at rezki.ade@gmail.com and hope you enjoy your stay!
      
      Best regards,
      Musicon Dev Team
      `,
    };

    /* istanbul ignore next */
    transporter.sendMail(options, function (err, info) {
      if (error) {
        next(error);
        return;
      }
    });
    next();
  } catch (error) {
    next(error);
  }
};
