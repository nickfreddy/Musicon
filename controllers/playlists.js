const { Playlist, User, Song, Artist, Album, Like } = require("../models");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

class Playlists {
  async addNewPlaylist(req, res, next) {
    try {
      if (req.files) {
        /* istanbul ignore next */
        req.body.playlistImage = "playlists/" + req.files.playlistImage.nameCompress;
      }
      req.body.author = ObjectId(req.user.user);
      await Playlist.create(req.body);
      res.status(201).json({ message: "Playlist created." });
    } catch (error) {
      /* istanbul ignore next */
      next(error);
    }
  }

  async addSong(req, res, next) {
    try {
      const findPlaylist = await Playlist.findById(req.params.playlistid);
      findPlaylist.songs.push(req.params.songid);
      findPlaylist.save();

      res.status(201).json({ data: findPlaylist });
    } catch (error) {
      /* istanbul ignore next */
      next(error);
    }
  }

  async removeSong(req, res, next) {
    try {
      const findPlaylist = await Playlist.findById(req.params.playlistid);
      const getIndexSong = findPlaylist.songs.indexOf(req.params.songid);
      findPlaylist.songs.splice(getIndexSong, 1);

      const data = await Playlist.findOneAndUpdate(
        { _id: req.params.playlistid },
        { songs: findPlaylist.songs },
        { new: true }
      );

      res.status(201).json({ data });
    } catch (error) {
      /* istanbul ignore next */
      next(error);
    }
  }

  async getAllPlaylists(req, res, next) {
    try {
      const data = await Playlist.find().populate({
        path: "author",
        model: User,
        select: "-password",
      });
      res.status(200).json({ data });
    } catch (error) {
      /* istanbul ignore next */
      next(error);
    }
  }

  async getUserPlaylists(req, res, next) {
    try {
      const getAllPlaylist = await Playlist.find({ author: req.params.id });
      res.status(200).json({ data: getAllPlaylist });
    } catch (error) {
      /* istanbul ignore next */
      next(error);
    }
  }

  async getPlaylistById(req, res, next) {
    try {
      const data = await Playlist.findOne({ _id: req.params.id })
        .populate({
          path: "songs",
          model: Song,
          select: {
            _id: 1,
            songTitle: 1,
            songDuration: 1,
            songImage: 1,
            audio: 1,
            artistId: 1,
            albumId: 1,
          },
          populate: [
            {
              path: "artistId",
              model: Artist,
              select: { _id: 1, name: 1 },
            },
            {
              path: "albumId",
              model: Album,
              select: { _id: 1, albumTitle: 1 },
            },
          ],
        })
        .populate({
          path: "author",
          model: User,
          select: { _id: 1, username: 1, fullname: 1 },
        });

      if (!data) {
        /* istanbul ignore next */
        return next({ message: "Playlist not found", statusCode: 404 });
      }

      data.playlistDuration = data.songs
        .map((song) => song.songDuration)
        .reduce((total, index) => total + index, 0);

      data.songs.forEach(async (song, index) => {
        const like = await Like.findOne({
          songId: song._id,
          authorId: req.user.user,
          like: true,
        });

        like ? (data.songs[index].isLiked = true) : (data.songs[index].isLiked = false);
      });
      await data.save();

      res.status(200).json({ data });
    } catch (error) {
      /* istanbul ignore next */
      next(error);
    }
  }
  async getPlaylistByTitle(req, res, next) {
    try {
      const getTitle = req.query.title;
      const pageSize = parseInt(req.query.limit) || 15;
      const currentPage = req.query.page;
      const regex = new RegExp(getTitle, "i");

      const playlist = await Playlist.find({ playlistTitle: { $regex: regex } })
        .select("playlistTitle playlistImage author")
        .skip(pageSize * (currentPage - 1))
        .limit(pageSize)
        .sort("-releaseDate");

      if (playlist.length === 0) {
        return next({ message: "Playlist not found", statusCode: 404 });
      }

      res.status(200).json({ playlist });
    } catch (error) {
      /* istanbul ignore next */
      next(error);
    }
  }

  async updatePlaylistById(req, res, next) {
    try {
      if (req.files) {
        /* istanbul ignore next */
        req.body.playlistImage = "playlists/" + req.files.playlistImage.nameCompress;
      }
      req.body.author = ObjectId(req.user.user);
      await Playlist.findOneAndUpdate({ _id: req.params.id }, req.body, {
        new: true,
      });
      res.status(201).json({ message: "Playlist updated." });
    } catch (error) {
      /* istanbul ignore next */
      next(error);
    }
  }

  async deletePlaylistById(req, res, next) {
    try {
      const getPlaylist = await Playlist.findOne({ _id: req.params.id });
      if (!getPlaylist)
        /* istanbul ignore next */
        return next({ statusCode: 404, message: "Playlist not found." });
      if (getPlaylist.author != req.user.user) {
        /* istanbul ignore next */
        return next({ statusCode: 403, message: "Access denied." });
      }
      await Playlist.deleteOne({ _id: req.params.id });
      res.status(201).json({ message: "Playlist deleted." });
    } catch (error) {
      /* istanbul ignore next */
      next(error);
    }
  }
}

module.exports = new Playlists();
