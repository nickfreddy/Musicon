// Adib's Code
const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../app");
const mongoose = require("mongoose");
const { User, Playlist, Rating } = require("../models");
const faker = require("faker");

let userToken = "";
let otherUserToken = "";
let playlistId = "";

beforeAll(async () => {
  // await Rating.deleteMany();
  // await Playlist.deleteMany();
  // await User.deleteMany();

  const userTest = await User.create({
    username: faker.internet.userName() + Math.floor(Math.random() * 1000),
    fullname: faker.name.findName(),
    email: Math.floor(Math.random() * 1000) + faker.internet.email(),
    password: "Kiki123!",
  });

  const otherUserTest = await User.create({
    username: faker.internet.userName() + Math.floor(Math.random() * 1000),
    fullname: faker.name.findName(),
    email: Math.floor(Math.random() * 1000) + faker.internet.email(),
    password: "Kiki123!",
  });

  const authorTest = await User.create({
    username: faker.internet.userName() + Math.floor(Math.random() * 1000),
    fullname: faker.name.findName(),
    email: Math.floor(Math.random() * 1000) + faker.internet.email(),
    password: "Kiki123!",
  });

  const playlistTest = await Playlist.create({
    playlistTitle: "playlisttest",
    author: authorTest._id,
  });

  const ratingTest = await Rating.create({
    rating: "3",
    authorId: otherUserTest._id,
    playlistId: playlistTest._id,
  });

  playlistId = playlistTest._id;

  userToken = jwt.sign({ user: userTest._id }, process.env.JWT_SECRET);
  otherUserToken = jwt.sign({ user: otherUserTest._id }, process.env.JWT_SECRET);
});

afterAll(() => {
  mongoose.disconnect();
});

describe("Get Rating", () => {
  it("User has not rated the playlist", async () => {
    const response = await request(app)
      .get(`/playlists/${playlistId}/rating`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.statusCode).toEqual(200);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("rating");
    expect(response.body.rating).toEqual(null);
  });

  it("User has rated the playlist", async () => {
    const response = await request(app)
      .get(`/playlists/${playlistId}/rating`)
      .set("Authorization", `Bearer ${otherUserToken}`);

    expect(response.statusCode).toEqual(200);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("rating");
    expect(response.body.rating).toEqual(3);
  });

  it("Invalid playlist id", async () => {
    const response = await request(app)
      .get(`/playlists/${playlistId}69/rating`)
      .set("Authorization", `Bearer ${otherUserToken}`);

    expect(response.statusCode).toEqual(400);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("errors");
  });

  it("Missing authorization header", async () => {
    const response = await request(app).get(`/playlists/${playlistId}/rating`);

    expect(response.statusCode).toEqual(401);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("errors");
  });
});

describe("Set Rating", () => {
  it("Success", async () => {
    const response = await request(app)
      .post(`/playlists/${playlistId}/rating`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        rating: "3",
      });

    console.log(response.body);
    expect(response.statusCode).toEqual(201);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("message");
  });

  it("Invalid playlist Id", async () => {
    const response = await request(app)
      .post(`/playlists/${playlistId}69/rating`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        rating: "3",
      });

    expect(response.statusCode).toEqual(400);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("errors");
  });

  it("Missing authorization header", async () => {
    const response = await request(app).post(`/playlists/${playlistId}/rating`).send({
      rating: "3",
    });

    expect(response.statusCode).toEqual(401);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("errors");
  });

  it("Invalid rating value", async () => {
    const response = await request(app)
      .post(`/playlists/${playlistId}/rating`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        rating: "6.9",
      });

    expect(response.statusCode).toEqual(400);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("errors");
  });

  it("Invalid rating value", async () => {
    const response = await request(app)
      .post(`/playlists/${playlistId}/rating`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        rating: "monkeywrench",
      });

    expect(response.statusCode).toEqual(500);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("errors");
  });
});
