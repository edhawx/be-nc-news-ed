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
            comment_id: expect.any(Number),
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
        expect(res.body.msg).toBe(
          `400 - Bad request, invalid type: ${fakeArticleId}`
        );
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

  test("400: Responds with a 400 when there is no body", () => {
    const newComment = {
      username: "rogersop",
    };
    return request(app)
      .post(`/api/articles/1/comments`)
      .send(newComment)
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe(
          "400 - Bad request, you haven't typed a comment!"
        );
      });
  });

  test("201: Responds with a 201 when there are more than two key-value pairs, posts comment and ignores additional pair", () => {
    const newComment = {
      username: "rogersop",
      body: "AHHHHHHHH test banana grapefruit AHHHH!!!",
      additionalKey: "additionalValue",
    };
    return request(app)
    .post("/api/articles/1/comments")
    .send(newComment)
    .expect(201)
    .then((res) => {
      expect(res.body.comment).toEqual(
        expect.objectContaining({
          comment_id: expect.any(Number),
          body: "AHHHHHHHH test banana grapefruit AHHHH!!!",
          votes: 0,
          author: "rogersop",
          article_id: 1,
          created_at: expect.any(String),
        })
      );
    })
      
  });
});

describe("PATCH /api/articles/:article_id", () => {
  test("200: Responds with 200 and updated votes by 1", () => {
    const newVotes = {
      inc_votes: 1,
    };
    return request(app)
      .patch("/api/articles/1")
      .send(newVotes)
      .expect(200)
      .then((res) => {
        expect(res.body.article).toEqual(
          expect.objectContaining({
            title: "Living in the shadow of a great man",
            article_id: 1,
            topic: "mitch",
            author: "butter_bridge",
            body: "I find this existence challenging",
            created_at: "2020-07-09T20:11:00.000Z",
            votes: 101,
            article_img_url:
              "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          })
        );
      });
  });

  test("200: Responds with 200 and updated votes by -101", () => {
    const newVotes = {
      inc_votes: -101,
    };
    return request(app)
      .patch("/api/articles/1")
      .send(newVotes)
      .expect(200)
      .then((res) => {
        expect(res.body.article).toEqual(
          expect.objectContaining({
            title: "Living in the shadow of a great man",
            article_id: 1,
            topic: "mitch",
            author: "butter_bridge",
            body: "I find this existence challenging",
            created_at: "2020-07-09T20:11:00.000Z",
            votes: -1,
            article_img_url:
              "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          })
        );
      });
  });

  test("404: Responds with 404 if article doesn't exist",()=>{
    const newVotes = {
      inc_votes: 1,
    };
    return request(app)
    .patch("/api/articles/12345")
    .send(newVotes)
    .expect(404)
    .then((res)=>{
      expect(res.body.msg).toBe(`404 - No article found for article_id 12345`)
    })
  })

  test("400: Responds with 400 if inc_vote is not a number",()=>{
    const newVotes = {
      inc_votes: "banana",
    };
    return request(app)
    .patch("/api/articles/1")
    .send(newVotes)
    .expect(400)
    .then((res)=>{
      expect(res.body.msg).toBe(`400 - Bad request, inc_votes MUST be number`)
    })
  })

  test("400: Responds with 400 if inc_vote is not a number",()=>{
    const newVotes = {
      inc_votes: {},
    };
    return request(app)
    .patch("/api/articles/1")
    .send(newVotes)
    .expect(400)
    .then((res)=>{
      expect(res.body.msg).toBe(`400 - Bad request, inc_votes MUST be number`)
    })
  })

  test("400: Responds with 400 if nothing entered",()=>{
    const newVotes = {};
    return request(app)
    .patch("/api/articles/1")
    .send(newVotes)
    .expect(400)
    .then((res)=>{
      expect(res.body.msg).toBe(`400 - Bad request, must enter inc_votes: Number`)
    })
  })
});

describe("DELETE /api/comments/:comment_id",()=>{
  test("204: Responds with 204 and deletes given comment on the comment_id and returns no content back",()=>{
    return request(app)
    .delete("/api/comments/1")
    .expect(204)
  })

  test("404: Responds with 404 not found if comment with that ID doesn't exist before deletion",()=>{
    return request(app)
    .delete("/api/comments/99999")
    .expect(404)
    .then((res)=>{
      expect(res.body.msg).toBe(`404 - Not found, that comment doesn't exist`)
    })
  })

  test("400: Responds with 400 bad request if comment_id given is not an umber",()=>{
    return request(app)
    .delete("/api/comments/banana")
    .expect(400)
    .then((res)=>{
      expect(res.body.msg).toBe(`400 - Bad request, comment_id must be a number`)
    })
  })

  
})