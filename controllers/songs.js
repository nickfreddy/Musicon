// Adib's Code
const { Song, Artist, Album, Like } = require("../models");
const lyricsFinder = require("lyrics-finder");

class SongCtrl {
  async getDetailSong(req, res, next) {
    try {
      let data = await Song.findById(req.params.id).populate({
        path: "artistId",
        model: Artist,
      });

      if (!data) {
        /* istanbul ignore next */
        return next({ message: "Song not found.", statusCode: 404 });
      }

      res.status(200).json({ data });
    } catch (error) {
      /* istanbul ignore next */
      next(error);
    }
  }

  async getSongByTitle(req, res, next) {
    try {
      const pageSize = parseInt(req.query.limit) || 15;
      const currentPage = req.query.page;
      const regex = new RegExp(req.query.title, "i");

      const songs = await Song.find({ songTitle: { $regex: regex } })
        .select("_id releaseDate")
        .skip(pageSize * (currentPage - 1))
        .limit(pageSize)
        .sort("-releaseDate");

      if (songs.length === 0) {
        return next({ message: "Song not found.", statusCode: 404 });
      }

      for (let i = 0; i < songs.length; i++) {
        const like = await Like.findOne({
          songId: songs[i]._id,
          authorId: req.user.user,
        });

        let isLiked;
        like ? (isLiked = true) : (isLiked = false);

        const getSong = await Song.findById(songs[i]._id)
          .populate({
            path: "artistId",
            model: Artist,
            select: { _id: 1, name: 1, photo: 1 },
          })
          .populate({
            path: "albumId",
            model: Album,
            select: { _id: 1, albumTitle: 1 },
          });
        getSong.isLiked = isLiked;

        songs[i] = getSong;
      }

      res.status(200).json({ songs });
    } catch (error) {
      /* istanbul ignore next */
      next(error);
    }
  }

  async getSongByTag(req, res, next) {
    try {
      const pageSize = parseInt(req.query.limit) || 15;
      const currentPage = req.query.page;
      const regex = new RegExp(req.query.tag, "i");

      const songs = await Song.find({ tags: { $regex: regex } })
        .populate({
          path: "artistId",
          model: Artist,
          select: { _id: 1, name: 1, photo: 1 },
        })
        .populate({
          path: "albumId",
          model: Album,
          select: { _id: 1, albumTitle: 1 },
        })
        .select("songTitle songImage songDuration artistId albumId tags audio")
        .skip(pageSize * (currentPage - 1))
        .limit(pageSize)
        .sort("-releaseDate");

      if (songs.length === 0) {
        return next({ message: "Song not found.", statusCode: 404 });
      }

      res.status(200).json({ songs });
    } catch (error) {
      /* istanbul ignore next */
      next(error);
    }
  }

  async getNewReleases(req, res, next) {
    try {
      const pageSize = parseInt(req.query.limit) || 15;
      const currentPage = req.query.page;
      const regex = new RegExp("^202[01].*");

      const songs = await Song.find({ releaseDate: { $regex: regex } })
        .populate({
          path: "artistId",
          model: Artist,
          select: { _id: 1, name: 1, photo: 1 },
        })
        .populate({
          path: "albumId",
          model: Album,
          select: { _id: 1, albumTitle: 1 },
        })
        .select("songTitle songImage songDuration artistId albumId tags audio")
        .skip(pageSize * (currentPage - 1))
        .limit(pageSize)
        .sort("-releaseDate");

      if (songs.length === 0) {
        /* istanbul ignore next */
        return next({ message: "Song not found.", statusCode: 404 });
      }

      res.status(200).json({ songs });
    } catch (error) {
      /* istanbul ignore next */
      next(error);
    }
  }

  async getRecommended(req, res, next) {
    try {
      const pageSize = parseInt(req.query.limit) || 15;
      const currentPage = req.query.page;

      const songs = await Song.find()
        .populate({
          path: "artistId",
          model: Artist,
          select: { _id: 1, name: 1, photo: 1 },
        })
        .populate({
          path: "albumId",
          model: Album,
          select: { _id: 1, albumTitle: 1 },
        })
        .select("songTitle songImage songDuration artistId albumId tags audio")
        .skip(pageSize * (currentPage - 1))
        .limit(pageSize)
        .sort("-releaseDate");

      if (songs.length === 0) {
        /* istanbul ignore next */
        return next({ message: "Song not found.", statusCode: 404 });
      }

      res.status(200).json({ songs });
    } catch (error) {
      /* istanbul ignore next */
      next(error);
    }
  }
  /* istanbul ignore next */
  async getLyrics(req, res, next) {
    try {
      const song = await Song.findById(req.params.id)
        .populate({
          path: "artistId",
          model: Artist,
          select: "name",
        })
        .select("songTitle");
      const lyrics = await lyricsFinder(song.artistId.name, song.songTitle);
      if (!lyrics) {
        return next({ message: "Lyrics not found.", statusCode: 404 });
      }
      res.status(200).json({ lyrics });
    } catch (error) {
      /* istanbul ignore next */
      next(error);
    }
  }
}

module.exports = new SongCtrl();
