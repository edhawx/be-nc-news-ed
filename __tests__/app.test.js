const request = require("supertest");
const app = require("../app");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
// const testData = require("../db/data/test-data/topics")
const testData = require("../db/data/test-data/index");
require('jest-sorted')

beforeEach(() => {
  return seed(testData);
});

afterAll(() => {
  return db.end();
});

describe("GET /api/topics", () => {
  test("GET:200 sends array of all topics to client", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        expect(body.topics).toHaveLength(3);
        body.topics.forEach((topic) => {
          expect(topic).toMatchObject({
            slug: expect.any(String),
            description: expect.any(String),
          });
        });
      });
  });

  test("GET:404 responds with 404 not found", () => {
    return request(app)
      .get("/api/endpoint-that-doesnt-exist")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("404 - Not found");
      });
  });

  test("GET:400 responds with 400 when given invalid params", () => {
    return request(app)
      .get("/api/topics?nonexistantParam=Nope")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("400 - Bad request");
      });
  });
});

describe("GET /api", () => {
  test("200: responds with 200 and retrieves all endpoints of api", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body }) => {
        expect(body).toHaveProperty("endpoints");
        expect(body.endpoints).toHaveProperty("GET /api");
        expect(body.endpoints).toHaveProperty("GET /api/topics");
        expect(body.endpoints).toHaveProperty("GET /api/articles");
        expect(body.endpoints).toHaveProperty("GET /api/articles/:article_id");

        const endpointShape = {
          "GET /api": {
            description:
              "serves up a json representation of all the available endpoints of the api",
          },
          "GET /api/topics": {
            description: "serves an array of all topics",
            queries: [],
            exampleResponse: {
              topics: [{ slug: "football", description: "Footie!" }],
            },
          },
          "GET /api/articles": {
            description: "serves an array of all articles",
            queries: ["author", "topic", "sort_by", "order"],
            exampleResponse: {
              articles: [
                {
                  title: "UNCOVERED: catspiracy to bring down democracy",
                  topic: "cats",
                  author: "rogersop",
                  created_at: "2020-08-03T13:14:00.000Z",
                  article_img_url:
                    "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
                  votes: 0,
                  article_id: 5,
                  comment_count: 2,
                },
              ],
            },
          },
          "GET /api/articles/:article_id": {
            description: "fetches an object of inputted article_id",
            queries: [],
            exampleResponse: {
              article: {
                article_id: 1,
                title: "Living in the shadow of a great man",
                topic: "mitch",
                author: "butter_bridge",
                body: "I find this existence challenging",
                created_at: "2020-07-09T20:11:00.000Z",
                votes: 100,
                article_img_url:
                  "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
              },
            },
          },
        };

        expect(body.endpoints).toMatchObject(endpointShape);
      });
  });
});

describe("GET /articles/:article_id", () => {
  test("200: Responds with correct article object and a 200 status code", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toMatchObject({
          article_id: 1,
          title: "Living in the shadow of a great man",
          topic: "mitch",
          author: "butter_bridge",
          body: "I find this existence challenging",
          created_at: "2020-07-09T20:11:00.000Z",
          votes: 100,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        });
      });
  });

  test("404: Responds with 404 Not found if ID doesnt exist", () => {
    return request(app)
      .get("/api/articles/99999")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("404 - No article found for article_id 99999");
      });
  });

  test("400: Responds with 400 Bad request if given string for ID", () => {
    return request(app)
      .get("/api/articles/banana")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("400 - Bad request");
      });
  });
});

describe("GET /api/articles", () => {
  test("200: Responds with 200 with all articles of correct shape sorted in descending order", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toHaveLength(13);
        body.articles.forEach((article) => {
          expect(article).toMatchObject({
            article_id: expect.any(Number),
            title: expect.any(String),
            topic: expect.any(String),
            author: expect.any(String),
            comment_count: expect.any(Number),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
          });
          expect(body.articles).toBeSortedBy("created_at", {descending: true});
        });
      });
  });

  test("GET:400 responds with 400 when given invalid params", () => {
    return request(app)
      .get("/api/articles?nonexistantParam=Nope")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("400 - Bad request");
      });
  });
});
