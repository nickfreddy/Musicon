const { Playlist, User } = require("../models");

/* istanbul ignore next */
exports.sendPushNotification = async (req, res, next) => {
  try {
    const playlist = await Playlist.findById(req.params.playlistId)
      .select("author playlistTitle")
      .populate({ path: "author", model: User, select: "-password" });

    const user = await User.findById(req.user.user).select("-password");
    const data = { playlist, rating: req.body.rating, ratedBy: user };

    if (process.env.NODE_ENV !== "test") {
      const io = req.app.locals.io;
      io.emit("newRating", data);
    }
    next();
  } catch (error) {
    /* istanbul ignore next */
    next(error);
  }
};
