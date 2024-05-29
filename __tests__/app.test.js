const request = require("supertest");
const app = require("../app");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
// const testData = require("../db/data/test-data/topics")
const testData = require("../db/data/test-data/index");
const comments = require("../db/data/test-data/comments");
const endpointsFile = require("../endpoints.json");
require("jest-sorted");

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

        expect(body.endpoints).toMatchObject(endpointsFile);
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
          expect(body.articles).toBeSortedBy("created_at", {
            descending: true,
          });
        });
      });
  });

  test("GET:400 responds with 400 when given invalid params", () => {
    return request(app)
      .get("/api/articles?nonexistantParam=Nope")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("400 - Bad request, invalid parameters");
      });
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  test("200: Responds with all comments for an article", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body }) => {
        expect(body.comments).toHaveLength(11);
        body.comments.forEach((comment) => {
          expect(comment).toMatchObject({
            body: expect.any(String),
            comment_id: expect.any(Number),
            votes: expect.any(Number),
            created_at: expect.any(String),
            author: expect.any(String),
            article_id: expect.any(Number),
          });
        });
        expect(body.comments).toBeSortedBy("created_at", { descending: true });
      });
  });

  test("404: article ID not found", () => {
    return request(app)
      .get("/api/articles/9999/comments")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("404 - No comments found for article ID of 9999");
      });
  });

  test("400: bad request if banana entered!", () => {
    return request(app)
      .get("/api/articles/banana/comments")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("400 - Bad request");
      });
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  test("201: Responds with 201 code and the posted comment", () => {
    const newComment = {
      username: "rogersop",
      body: "AHHHHHHHH test banana grapefruit AHHHH!!!",
    };
    return request(app)
      .post("/api/articles/1/comments")
      .send(newComment)
      .expect(201)
      .then((res) => {
        expect(res.body.comment).toEqual(
          expect.objectContaining({
            body: "AHHHHHHHH test banana grapefruit AHHHH!!!",
            votes: 0,
            author: "rogersop",
            article_id: 1,
            created_at: expect.any(String),
          })
        );
      });
  });

  test("404: Responds with 404 when user not found", () => {
    const newComment = {
      username: "jimbob",
      body: "test",
    };
    return request(app)
      .post("/api/articles/1/comments")
      .send(newComment)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("404 - Not found, user doesn't exist!");
      });
  });

  test("404: Responds with a 404 when article not found", () => {
    const newComment = {
      username: "rogersop",
      body: "AHHHHHHHH test banana grapefruit AHHHH!!!",
    };
    const fakeArticleId = 99999;
    return request(app)
      .post(`/api/articles/${fakeArticleId}/comments`)
      .send(newComment)
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe(
          `404 - No article found for article_id ${fakeArticleId}`
        );
      });
  });

  test("400: Responds with a 400 when banana/string input as ID", () => {
    const newComment = {
      username: "rogersop",
      body: "AHHHHHHHH test banana grapefruit AHHHH!!!",
    };
    const fakeArticleId = "banana";
    return request(app)
      .post(`/api/articles/${fakeArticleId}/comments`)
      .send(newComment)
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe(`400 - Bad request, invalid type`);
      });
  });

  test("400: Responds with 400 when no BODY entered", () => {
    const newComment = {
      username: "rogersop",
      body: "",
    };
    return request(app)
      .post(`/api/articles/1/comments`)
      .send(newComment)
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe(
          `400 - Bad request, you haven't typed a comment!`
        );
      });
  });

  test("400: Responds with a 400 when body is all white spaces", () => {
    const newComment = {
      username: "rogersop",
      body: "                                          ",
    };
    return request(app)
      .post(`/api/articles/1/comments`)
      .send(newComment)
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe(
          `400 - Bad request, you haven't typed a comment!`
        );
      });
  });
});
