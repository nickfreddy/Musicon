// Adib's Code
const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../app");
const mongoose = require("mongoose");
const { Artist, Album, User } = require("../models");
const faker = require("faker");

let userToken = "";
let artistId = "";

beforeAll(async () => {
  // await Artist.deleteMany();
  // await User.deleteMany();
  // await Album.deleteMany();

  const userTest = await User.create({
    username: faker.internet.userName() + Math.floor(Math.random() * 1000),
    fullname: faker.name.findName(),
    email: Math.floor(Math.random() * 1000) + faker.internet.email(),
    password: "Kiki123!",
  });

  const artistTest = await Artist.create({
    name: faker.name.findName() + Math.floor(Math.random() * 1000) + "a",
  });

  const albumTest = await Album.create({
    albumTitle: faker.commerce.product(),
    artistId: artistTest._id,
  });

  artistTest.albums.push(albumTest);
  await artistTest.save();

  artistId = artistTest._id;
  userToken = jwt.sign({ user: userTest._id }, process.env.JWT_SECRET);
});

afterAll(() => {
  mongoose.disconnect();
});

describe("Get Artist By ID", () => {
  it("Success", async () => {
    const response = await request(app)
      .get(`/artists/${artistId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.statusCode).toEqual(200);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("data");
  });

  it("Missing authorization header", async () => {
    const response = await request(app).get(`/artists/${artistId}`);

    expect(response.statusCode).toEqual(401);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("errors");
  });

  it("Invalid object id", async () => {
    const response = await request(app)
      .get(`/artists/${artistId}69`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.statusCode).toEqual(500);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("errors");
  });
});

describe("Get Artist By Name", () => {
  it("Success", async () => {
    const response = await request(app)
      .get(`/artists/search`)
      .query({ name: "a", limit: 3 })
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.statusCode).toEqual(200);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("artist");
  });

  it("Missing authorization header", async () => {
    const response = await request(app).get(`/artists/search`).query({ name: "test", limit: 3 });

    expect(response.statusCode).toEqual(401);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("errors");
  });

  it("Artist not found", async () => {
    const response = await request(app)
      .get(`/artists/search`)
      .query({ name: "monkeywrench", limit: 3 })
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.statusCode).toEqual(404);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("errors");
  });
});

describe("Get New Releases Artist", () => {
  it("Success", async () => {
    const response = await request(app)
      .get("/artists/new")
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.statusCode).toEqual(200);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("newRelease");
  });

  it("Missing authorization header", async () => {
    const response = await request(app).get("/artists/new");

    expect(response.statusCode).toEqual(401);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("errors");
  });
});
