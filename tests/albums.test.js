// Adib's Code
const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../app");
const mongoose = require("mongoose");
const { Album, Artist, User } = require("../models");
const faker = require("faker");

let userToken = "";
let albumId = "";

beforeAll(async () => {
  // await Artist.deleteMany();
  // await Album.deleteMany();
  // await User.deleteMany();

  const userTest = await User.create({
    username: faker.internet.userName() + Math.floor(Math.random() * 1000),
    fullname: faker.name.findName(),
    email: Math.floor(Math.random() * 1000) + faker.internet.email(),
    password: "Kiki123!",
  });

  const artistTest = await Artist.create({
    name: faker.name.findName(),
  });

  const albumTest = await Album.create({
    albumTitle: faker.commerce.product() + "a",
    artistId: artistTest._id,
    releaseDate: "2021",
  });

  artistTest.albums.push(albumTest._id);
  await artistTest.save();

  albumId = albumTest._id;

  userToken = jwt.sign({ user: userTest._id }, process.env.JWT_SECRET);
});

afterAll(() => {
  mongoose.disconnect();
});

describe("Get New Albums", () => {
  it("Success", async () => {
    const response = await request(app)
      .get(`/albums/new`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.statusCode).toEqual(200);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("albums");
  });

  it("Missing authorization header", async () => {
    const response = await request(app).get(`/albums/new`);

    expect(response.statusCode).toEqual(401);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("errors");
  });
});

describe("Get Albums By Title", () => {
  it("Success", async () => {
    const response = await request(app)
      .get(`/albums/search`)
      .set("Authorization", `Bearer ${userToken}`)
      .query({ title: "a", limit: 3, page: 1 });

    expect(response.statusCode).toEqual(200);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("albums");
  });

  it("Missing authorization header", async () => {
    const response = await request(app).get(`/albums/search`).query({ title: "test", limit: 3 });

    expect(response.statusCode).toEqual(401);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("errors");
  });

  it("Album not found", async () => {
    const response = await request(app)
      .get(`/albums/search`)
      .set("Authorization", `Bearer ${userToken}`)
      .query({ title: "monkeywrench", limit: 3 });

    expect(response.statusCode).toEqual(404);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty("errors");
  });
});

describe("get album by id", () => {
  it("get album by id success", async () => {
    const response = await request(app)
      .get(`/albums/${albumId}`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(response.statusCode).toEqual(200);
    expect(response.body).toBeInstanceOf(Object);
  });
  it("get album by id nit valid id", async () => {
    const response = await request(app)
      .get(`/albums/${albumId}0`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(response.statusCode).toEqual(400);
    expect(response.body).toBeInstanceOf(Object);
  });
  it("get album by id not authorize", async () => {
    const response = await request(app).get(`/albums/${albumId}`);
    expect(response.statusCode).toEqual(401);
    expect(response.body).toBeInstanceOf(Object);
  });
});
