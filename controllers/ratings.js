// Adib's Code
const { Rating } = require("../models");

class RatingCtrl {
  async getRating(req, res, next) {
    try {
      const data = await Rating.findOne({
        playlistId: req.params.playlistId,
        authorId: req.user.user,
      }).select("rating");

      if (!data) {
        res.status(200).json({ rating: null });
      } else {
        res.status(200).json({ rating: data.rating });
      }
    } catch (error) {
      /* istanbul ignore next */
      next(error);
    }
  }

  async createOrUpdateRating(req, res, next) {
    try {
      const data = await Rating.findOne({
        playlistId: req.params.playlistId,
        authorId: req.user.user,
      });

      if (data) {
        const updateRating = await Rating.findOneAndUpdate(
          {
            playlistId: req.params.playlistId,
            authorId: req.user.user,
          },
          req.body,
          {
            new: true,
          }
        );
        /* istanbul ignore next */
        updateRating.save();
      } else {
        req.body.playlistId = req.params.playlistId;
        req.body.authorId = req.user.user;
        await Rating.create(req.body);
      }

      res.status(201).json({ message: "Rating is added/ updated." });
    } catch (error) {
      /* istanbul ignore next */
      next(error);
    }
  }
}

module.exports = new RatingCtrl();
