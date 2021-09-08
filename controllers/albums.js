// Adib's Code
const { Album, Artist, Song, Like } = require("../models");

class AlbumCtrl {
  async getNewAlbums(req, res, next) {
    try {
      const pageSize = parseInt(req.query.limit) || 15;
      const currentPage = req.query.page;

      const albums = await Album.find({
        releaseDate: { $regex: new RegExp("^202[01].*") },
      })
        .populate({ path: "artistId", model: Artist })
        .select("albumTitle releaseDate albumImage artistId")
        .skip(pageSize * (currentPage - 1))
        .limit(pageSize)
        .sort("-releaseDate");

      res.status(200).json({ albums });
    } catch (error) {
      /* istanbul ignore next */
      next(error);
    }
  }
  async getAlbumByTitle(req, res, next) {
    try {
      const getTitle = req.query.title;
      const pageSize = parseInt(req.query.limit) || 15;
      const currentPage = req.query.page;
      const regex = new RegExp(getTitle, "i");

      const albums = await Album.find({ albumTitle: { $regex: regex } })
        .populate({ path: "artistId", model: Artist })
        .select("albumTitle albumImage artistId")
        .skip(pageSize * (currentPage - 1))
        .limit(pageSize)
        .sort("-releaseDate");

      if (albums.length === 0) {
        return next({ message: "Album not found.", statusCode: 404 });
      }
      res.status(200).json({ albums });
    } catch (error) {
      /* istanbul ignore next */
      next(error);
    }
  }

  async getDetailAlbum(req, res, next) {
    try {
      const album = await Album.findById(req.params.id)
        .populate({
          path: "songs",
          model: Song,
          select: "-artistId -albumId -__v",
        })
        .populate({
          path: "artistId",
          model: Artist,
          select: "name photo",
        });

      for (let i = 0; i < album.songs.length; i++) {
        const like = await Like.findOne({
          songId: album.songs[i]._id,
          authorId: req.user.user,
        });

        let isLiked;
        like ? (isLiked = true) : (isLiked = false);

        const getSong = await Song.findById(album.songs[i]._id)
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

        album.songs[i] = getSong;
      }

      res.status(200).json({ album });
    } catch (error) {
      /* istanbul ignore next */
      next(error);
    }
  }
}

module.exports = new AlbumCtrl();
