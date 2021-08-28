const req = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const { User, Playlist, Artist, Album, Song } = require("../models");
const jwt = require("jsonwebtoken");
const faker = require("faker");
let createUser;
let userToken;
let createPlaylist;
let createSong;

beforeAll(async () => {
  createUser = await User.create({
    username: faker.internet.userName() + Math.floor(Math.random() * 1000),
    fullname: faker.name.findName(),
    email: Math.floor(Math.random() * 1000) + faker.internet.email(),
    password: "Kiki123!",
  });
  const artistTest = await Artist.create({
    name: faker.name.findName() + Math.floor(Math.random() * 1000),
  });

  const albumTest = await Album.create({
    albumTitle: faker.commerce.product(),
    artistId: artistTest._id,
    releaseDate: "2021",
  });
  artistTest.albums.push(albumTest._id);
  await artistTest.save();

  createSong = await Song.create({
    songTitle: faker.lorem.word() + "a",
    artistId: artistTest._id,
    albumId: albumTest._id,
    songDuration: "69",
    tags: "songtest, albumtest, artisttest",
  });
  createPlaylist = await Playlist.create({
    playlistTitle: "new playlist",
    playlistImage: "img.jpg",
    author: `${createUser._id}`,
    description: "LOVE IT!!",
  });
  createPlaylist.songs.push(createSong._id);
  await createPlaylist.save();

  userToken = jwt.sign({ user: createUser._id }, process.env.JWT_SECRET);
});

describe("Get User By Id", () => {
  it("get User By Id success", async () => {
    const res = await req(app)
      .get(`/users/${createUser._id}`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Object);
  });
  it("get User By Id not valid id", async () => {
    const res = await req(app)
      .get(`/users/${createUser._id}0`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.statusCode).toEqual(400);
    expect(res.body).toBeInstanceOf(Object);
  });
  it("get User By Id not authorize", async () => {
    const res = await req(app).get(`/users/${createUser._id}`);
    expect(res.statusCode).toEqual(401);
    expect(res.body).toBeInstanceOf(Object);
  });
});

describe("Update User Data By Id", () => {
  it("Update User Data By Id success", async () => {
    const res = await req(app)
      .put(`/users/updatedata/${createUser._id}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        username: faker.internet.userName() + Math.floor(Math.random() * 1000),
        fullname: faker.name.findName(),
        email: Math.floor(Math.random() * 1000) + faker.internet.email(),
        photo: faker.image.imageUrl(),
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toBeInstanceOf(Object);
  });
  it("Update User Data By Id not found id", async () => {
    const res = await req(app)
      .put(`/users/updatedata/6120e131d82b0b08921ab544`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        username: faker.internet.userName() + Math.floor(Math.random() * 1000),
        fullname: faker.name.findName(),
        email: Math.floor(Math.random() * 1000) + faker.internet.email(),
        photo: faker.image.imageUrl(),
      });
    expect(res.statusCode).toEqual(404);
    expect(res.body).toBeInstanceOf(Object);
  });
  it("Update User Data By Id not authorize", async () => {
    const res = await req(app)
      .put(`/users/updatedata/${createUser._id}0`)
      .send({
        username: faker.internet.userName() + Math.floor(Math.random() * 1000),
        fullname: faker.name.findName(),
        email: Math.floor(Math.random() * 1000) + faker.internet.email(),
        photo: faker.image.imageUrl(),
      });
    expect(res.statusCode).toEqual(401);
    expect(res.body).toBeInstanceOf(Object);
  });
});

describe("Update User Password By Id", () => {
  it("Update User Password By Id success", async () => {
    const res = await req(app)
      .put(`/users/updatepassword/${createUser._id}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        currentPassword: "Kiki123!",
        newPassword: "Kiki123!",
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toBeInstanceOf(Object);
  });
  it("Update User Password By Id not strong enough", async () => {
    const res = await req(app)
      .put(`/users/updatepassword/${createUser._id}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        currentPassword: "Kiki123!",
        newPassword: "Kik",
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toBeInstanceOf(Object);
  });
  it("Update User Password By Id not authorize", async () => {
    const res = await req(app).put(`/users/updatepassword/${createUser._id}`).send({
      newPassword: "Rezki123!",
    });
    expect(res.statusCode).toEqual(401);
    expect(res.body).toBeInstanceOf(Object);
  });
});
describe("Get User Top Song", () => {
  it("get user top song success", async () => {
    const res = await req(app)
      .get(`/users/${createUser._id}/topsongs`)
      .set("Authorization", `Bearer ${userToken}`)
      .query({ title: "a", limit: 3 });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Object);
  });
  it("get user top song not authorize", async () => {
    const res = await req(app)
      .get(`/users/${createUser._id}/topsongs`)
      .query({ title: "a", limit: 3 });
    expect(res.statusCode).toEqual(401);
    expect(res.body).toBeInstanceOf(Object);
  });
});
describe("Get User Top artist", () => {
  it("get user top artist success", async () => {
    const res = await req(app)
      .get(`/users/${createUser._id}/topartists`)
      .set("Authorization", `Bearer ${userToken}`)
      .query({ title: "a", limit: 3 });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Object);
  });
  it("get user top artist not authorize", async () => {
    const res = await req(app)
      .get(`/users/${createUser._id}/topartists`)
      .query({ title: "a", limit: 3 });
    expect(res.statusCode).toEqual(401);
    expect(res.body).toBeInstanceOf(Object);
  });
});
