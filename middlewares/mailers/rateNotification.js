const nodemailer = require("nodemailer");
const { Playlist, User, Rating } = require("../../models");

exports.sendAuthorEmail = async (req, res, next) => {
  try {
    const data = await Rating.findOne({
      playlistId: req.params.playlistId,
      authorId: req.user.user,
    });

    if (!data) {
      // Only send when it's a new rating
      const playlist = await Playlist.findById(req.params.playlistId)
        .select("author playlistTitle")
        .populate({ path: "author", model: User });

      const user = await User.findById(req.user.user);
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "dev.musicon@gmail.com",
          pass: "DEVmusicon2021",
        },
      });

      const options = {
        from: "dev.musicon@gmail.com",
        to: playlist.author.email,
        subject: `${user.username} is a fan 🤩`,
        text: `
      Hey ${playlist.author.username},

      Your playlist "${playlist.playlistTitle}" is getting some tractions!
      That's cool, if you like that sort of thing...

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
    }

    next();
  } catch (error) {
    /* istanbul ignore next */
    next(error);
  }
};
