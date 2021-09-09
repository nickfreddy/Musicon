const req = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const { User } = require("../models");
const faker = require("faker");

beforeAll(async () => {
  // await User.deleteMany();
  // await User.create({
  //   username: faker.internet.userName() + Math.floor(Math.random() * 1000),
  //   fullname: faker.name.findName(),
  //   email: Math.floor(Math.random() * 1000) + faker.internet.email(),
  //   password: "Kiki123!",
  // });
});

describe("No Endpoint detected", () => {
  it("No", async () => {
    const res = await req(app).get("/noendpoint");
    expect(res.statusCode).toEqual(404);
    expect(res.body).toBeInstanceOf(Object);
  });
});

describe("Sign Up", () => {
  it("Sign Up success", async () => {
    const res = await req(app).post("/auth/signup").send({
      username: "rizkyap90s",
      fullname: "rizky ade pratama putra",
      email: "rizkyap90s@gmail.com",
      password: "Kiki123!",
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Object);
  });
  it("Sign Up empty field", async () => {
    const res = await req(app).post("/auth/signup").send({
      username: "",
      fullname: "rizky ade pratama putra",
      email: "rizkyap90sgmail.com",
      password: "Kiki123!",
    });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toBeInstanceOf(Object);
  });
  it("Sign Up email not valid", async () => {
    const res = await req(app).post("/auth/signup").send({
      username: "usernamehaha",
      fullname: "rizky ade pratama putra",
      email: "dsa.com",
      password: "Kiki123!",
    });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toBeInstanceOf(Object);
  });
  it("Sign Up duplicate user", async () => {
    const res = await req(app).post("/auth/signup").send({
      username: "rizkyap90s",
      fullname: "rizky ade pratama putra",
      email: "rizkyap90s@gmail.com",
      password: "Kiki123!",
    });
    expect(res.statusCode).toEqual(401);
    expect(res.body).toBeInstanceOf(Object);
  });
});

describe("Login", () => {
  it("Login username success", async () => {
    const res = await req(app).post("/auth/login").send({
      username: "rizkyap90s",
      password: "Kiki123!",
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Object);
  });
  it("Login email success", async () => {
    const res = await req(app).post("/auth/login").send({
      username: "rizkyap90s@gmail.com",
      password: "Kiki123!",
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Object);
  });
  it("Login google v2 success", async () => {
    const res = await req(app).post("/auth/google/v2").send({
      email: "rizkyap90@gmail.com",
      familyName: "rizkyap90@gmail.com",
      givenName: "Rezki Ade Pratama Putra",
      googleId: "032930239092309013",
      imageUri: "photo.jpeg",
      name: "kiki",
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Object);
  });
  it("Login facebook v2 success", async () => {
    const res = await req(app).post("/auth/facebook/v2").send({
      email: "rizkyap90ss@gmail.com",
      fullname: "rizkyap90ss@gmail.com",
      userID: "03293023909231309013",
      photo: "photo.jpeg",
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Object);
  });

  it("Login user not found", async () => {
    const res = await req(app).post("/auth/login").send({
      username: "rizkyap90shaha",
      password: "Kiki123!",
    });
    expect(res.statusCode).toEqual(401);
    expect(res.body).toBeInstanceOf(Object);
  });
  it("Login password not valid", async () => {
    const res = await req(app).post("/auth/login").send({
      username: "rizkyap90s",
      password: "",
    });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toBeInstanceOf(Object);
  });
  it("Login email/user not valid", async () => {
    const res = await req(app).post("/auth/login").send({
      username: "",
      password: "Kiki123!",
    });
    expect(res.statusCode).toEqual(401); //cek
    expect(res.body).toBeInstanceOf(Object);
  });
  it("Login wrong password", async () => {
    const res = await req(app).post("/auth/login").send({
      username: "rizkyap90s",
      password: "Kiki1234!",
    });
    expect(res.statusCode).toEqual(401);
    expect(res.body).toBeInstanceOf(Object);
  });
});
