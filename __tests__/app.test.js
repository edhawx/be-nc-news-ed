const request = require("supertest");
const app = require("../app");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const testData = require("../db/data/test-data/index");
const endpointsFile = require("../endpoints.json");
require("jest-sorted");

beforeEach(() => {
  return seed(testData);
});

afterAll(() => {
  return db.end();
});

const sortColumns = [
  "created_at",
  "votes",
  "comment_count",
  "title",
  "topic",
  "author",
];

const invalidSortColumns = ["quiche"];

const orders = ["ASC", "DESC"];

const validLimit = ["limit"];
const validPage = ["p"];

const invalidLimit = ["banana"];
const invalidPage = ["pear"];

const invalidColumns = ["bob_the"];
const invalidOrders = ["banana"];

const sqlInjectionInputs = [
  "1; SELECT * FROM users;",
  "DROP DATABASE IF EXISTS nc_news_test;",
];

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
        expect(body.msg).toBe("400 - Bad request, invalid topic parameters");
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
        expect(body.msg).toBe(
          `404 - Not found, username: "jimbob" doesn't exist!`
        );
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
      });
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

  test("404: Responds with 404 if article doesn't exist", () => {
    const newVotes = {
      inc_votes: 1,
    };
    return request(app)
      .patch("/api/articles/12345")
      .send(newVotes)
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe(
          `404 - No article found for article_id 12345`
        );
      });
  });

  test("400: Responds with 400 if inc_vote is not a number", () => {
    const newVotes = {
      inc_votes: "banana",
    };
    return request(app)
      .patch("/api/articles/1")
      .send(newVotes)
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe(
          `400 - Bad request, inc_votes MUST be number`
        );
      });
  });

  test("400: Responds with 400 if inc_vote is not a number", () => {
    const newVotes = {
      inc_votes: {},
    };
    return request(app)
      .patch("/api/articles/1")
      .send(newVotes)
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe(
          `400 - Bad request, inc_votes MUST be number`
        );
      });
  });

  test("400: Responds with 400 if nothing entered", () => {
    const newVotes = {};
    return request(app)
      .patch("/api/articles/1")
      .send(newVotes)
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe(
          `400 - Bad request, must enter inc_votes: Number`
        );
      });
  });
});

describe("DELETE /api/comments/:comment_id", () => {
  test("204: Responds with 204 and deletes given comment on the comment_id and returns no content back", () => {
    return request(app).delete("/api/comments/1").expect(204);
  });

  test("404: Responds with 404 not found if comment with that ID doesn't exist before deletion", () => {
    return request(app)
      .delete("/api/comments/99999")
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe(
          `404 - Not found, that comment doesn't exist`
        );
      });
  });

  test("400: Responds with 400 bad request if comment_id given is not an umber", () => {
    return request(app)
      .delete("/api/comments/banana")
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe(
          `400 - Bad request, comment_id must be a number`
        );
      });
  });
});

describe("GET /api/users", () => {
  test("200: Will get all users", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body }) => {
        expect(body.users).toHaveLength(4);
        body.users.forEach((user) => {
          expect(user).toMatchObject({
            username: expect.any(String),
            name: expect.any(String),
            avatar_url: expect.any(String),
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
});

describe("GET /api/articles (topic query)", () => {
  test("200: Responds with articles filtered by topic query", () => {
    return request(app)
      .get("/api/articles?topic=cats")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles.length).toBeGreaterThan(0);
        body.articles.forEach((article) => {
          expect(article.topic).toBe("cats");
          expect(article).toMatchObject({
            title: expect.any(String),
            author: expect.any(String),
            created_at: expect.any(String),
            article_img_url: expect.any(String),
            votes: expect.any(Number),
            article_id: expect.any(Number),
            comment_count: expect.any(Number),
          });
        });
      });
  });

  test("200: Responds with 200 & empty array when topic doesn't exist", () => {
    return request(app)
      .get("/api/articles?topic=bananas")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toEqual([]);
      });
  });

  test("GET:400 responds with 400 when given wrong query", () => {
    return request(app)
      .get("/api/articles?banana=cats")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("400 - Bad request, invalid parameters");
      });
  });
});

describe("PATCH /api/articles/:article_id with comment count", () => {
  test("200: gives 200 with comment count included", () => {
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
            comment_count: 11,
          })
        );
      });
  });
});

describe("GET /api/articles (sorting queries)", () => {
  test("200: gives 200 and responds with created_at but ascending", () => {
    return request(app)
      .get("/api/articles?sort_by=created_at&order=ASC")
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
            ascending: true,
          });
        });
      });
  });

  sortColumns.forEach((sort_by) => {
    orders.forEach((order) => {
      const isDescending = order === "DESC";
      test("200: gives 200 and responds with every sort column both ascending and descending", () => {
        return request(app)
          .get(`/api/articles?sort_by=${sort_by}&order=${order}`)
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
            });
            expect(body.articles).toBeSortedBy(sort_by, {
              descending: isDescending,
              ascending: !isDescending,
            });
          });
      });
    });
  });

  invalidColumns.forEach((sort_by) => {
    invalidOrders.forEach((order) => {
      test("400: Responds with a bad request, invalid params if either or both are false", () => {
        return request(app)
          .get(`/api/articles?sort_by=${sort_by}&order=${order}`)
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).toBe(
              "400 - Bad request, invalid sort_by and/or order"
            );
          });
      });
    });
  });

  sqlInjectionInputs.forEach((input) => {
    test("400: Responds with a bad request for suspicious sql injection inputs", () => {
      return request(app)
        .get(`/api/articles?sort_by=${input}&order=ASC`)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe(
            "400 - Bad request, invalid sort_by and/or order"
          );
        });
    });

    test("400: Responds with a bad request for suspicious sql injection inputs", () => {
      return request(app)
        .get(`/api/articles?sort_by=created_at&order=${input}`)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe(
            "400 - Bad request, invalid sort_by and/or order"
          );
        });
    });
  });
});

const correctFormatFakeUsername = ["iwillneverexistever", "2", "bobbob"];
const invalidFormatFakeUsername = ["$()*$£", "h ello", "%_Lhello"];

describe("GET /api/users/:username", () => {
  test("200: Responds with a user object with username, avatar_url and name by entering username", () => {
    return request(app)
      .get(`/api/users/butter_bridge`)
      .expect(200)
      .then(({ body }) => {
        expect(body.user).toMatchObject({
          username: "butter_bridge",
          name: "jonny",
          avatar_url:
            "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg",
        });
      });
  });

  correctFormatFakeUsername.forEach((fakeUser) => {
    test(`404: Responds with an error message saying that user "${encodeURIComponent(
      fakeUser
    )}" is not found`, () => {
      return request(app)
        .get(`/api/users/${fakeUser}`)
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe(
            `404 - Not found, username: "${encodeURIComponent(
              fakeUser
            )}" doesn't exist!`
          );
        });
    });
  });

  invalidFormatFakeUsername.forEach((fakeInvalidFormatUser) => {
    test(`400: Responds with an error message saying that username " ${fakeInvalidFormatUser}" is wrong format`, () => {
      return request(app)
        .get(`/api/users/${encodeURIComponent(fakeInvalidFormatUser)}`)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe(
            `400 - Bad request, this username is invalid format!`
          );
        });
    });
  });
});

describe("PATCH /api/comments/:comment_id", () => {
  test("200: Responds with updated comment on given comment_id", () => {
    const newVote = {
      inc_votes: 1,
    };
    return request(app)
      .patch(`/api/comments/1`)
      .send(newVote)
      .expect(200)
      .then((res) => {
        expect(res.body.updatedComment).toEqual(
          expect.objectContaining({
            article_id: 9,
            author: "butter_bridge",
            body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
            comment_id: 1,
            created_at: "2020-04-06T12:17:00.000Z",
            votes: 17,
          })
        );
      });
  });

  test("200: Responds with updated comment on given comment_id", () => {
    const newVote = {
      inc_votes: -17,
    };
    return request(app)
      .patch(`/api/comments/1`)
      .send(newVote)
      .expect(200)
      .then((res) => {
        expect(res.body.updatedComment).toEqual(
          expect.objectContaining({
            article_id: 9,
            author: "butter_bridge",
            body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
            comment_id: 1,
            created_at: "2020-04-06T12:17:00.000Z",
            votes: -1,
          })
        );
      });
  });

  test("404: Responds with comment doesn't exist if wrong id input", () => {
    const newVote = {
      inc_votes: 1,
    };
    return request(app)
      .patch(`/api/comments/999999`)
      .send(newVote)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("404 - Not found, that comment doesn't exist");
      });
  });

  test("400: Responds with bad request if wrong type", () => {
    const newVote = {
      inc_votes: "banana",
    };
    return request(app)
      .patch(`/api/comments/1`)
      .send(newVote)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("400 - Bad request, inc_votes MUST be a number");
      });
  });

  test("400: Responds with bad request if nothing entered", () => {
    const newVote = {};
    return request(app)
      .patch(`/api/comments/1`)
      .send(newVote)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe(
          "400 - Bad request, must enter inc_votes: number"
        );
      });
  });
});

describe("POST /api/articles", () => {
  test("201: posts a new article, responds with said article", () => {
    const newArticle = {
      author: "rogersop",
      title: "199 AHHHHHh etc etc",
      body: "loads of NUMBERS and apples",
      topic: "cats",
      article_img_url:
        "https://sallysbakingaddiction.com/wp-content/uploads/2019/04/quiche.jpg",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(201)
      .then((res) => {
        expect(res.body.article).toEqual(
          expect.objectContaining({
            body: "loads of NUMBERS and apples",
            title: "199 AHHHHHh etc etc",
            topic: "cats",
            votes: 0,
            author: "rogersop",
            article_id: 14,
            created_at: expect.any(String),
            article_img_url:
              "https://sallysbakingaddiction.com/wp-content/uploads/2019/04/quiche.jpg",
            comment_count: 0,
          })
        );
      });
  });

  test("400: Responds with 400 when no BODY entered in article", () => {
    const newArticle = {
      author: "rogersop",
      title: "199 AHHHHHh etc etc",
      body: "",
      topic: "cats",
      article_img_url:
        "https://sallysbakingaddiction.com/wp-content/uploads/2019/04/quiche.jpg",
    };
    return request(app)
      .post(`/api/articles`)
      .send(newArticle)
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe(
          "400 - Bad request, you haven't typed an article!"
        );
      });
  });

  test("400: Responds with 400 when no AUTHOR entered in article", () => {
    const newArticle = {
      author: "",
      title: "199 AHHHHHh etc etc",
      body: "fdfdgfdhfggfj",
      topic: "cats",
      article_img_url:
        "https://sallysbakingaddiction.com/wp-content/uploads/2019/04/quiche.jpg",
    };
    return request(app)
      .post(`/api/articles`)
      .send(newArticle)
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe(
          "400 - Bad request, you haven't entered an author!"
        );
      });
  });

  test("400: Responds with 400 when no TITLE entered in article", () => {
    const newArticle = {
      author: "rogersop",
      title: "",
      body: "fdfdgfdhfggfj",
      topic: "cats",
      article_img_url:
        "https://sallysbakingaddiction.com/wp-content/uploads/2019/04/quiche.jpg",
    };
    return request(app)
      .post(`/api/articles`)
      .send(newArticle)
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe(
          "400 - Bad request, you haven't entered a title!"
        );
      });
  });

  test("400: Responds with 400 when no TOPIC entered in article", () => {
    const newArticle = {
      author: "rogersop",
      title: "i am great",
      body: "fdfdgfdhfggfj",
      topic: "",
      article_img_url:
        "https://sallysbakingaddiction.com/wp-content/uploads/2019/04/quiche.jpg",
    };
    return request(app)
      .post(`/api/articles`)
      .send(newArticle)
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe(
          "400 - Bad request, you haven't entered a topic!"
        );
      });
  });

  test("404: Responds with 404 when no USER is found with author name", () => {
    const newArticle = {
      author: "bobmcbob",
      title: "i am great",
      body: "fdfdgfdhfggfj",
      topic: "i love topics",
      article_img_url:
        "https://sallysbakingaddiction.com/wp-content/uploads/2019/04/quiche.jpg",
    };
    return request(app)
      .post(`/api/articles`)
      .send(newArticle)
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe(
          `404 - Not found, username: "bobmcbob" doesn't exist!`
        );
      });
  });
});

describe("GET /api/articles (pagination)", () => {
  test("200: responds with all articles when no limit or p are given", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((res) => {
        expect(res.body.articles.length).toBeGreaterThan(0);
        expect(res.body).toHaveProperty("total_count");
        res.body.articles.forEach((article) => {
          expect(article).toEqual(
            expect.objectContaining({
              article_id: expect.any(Number),
              title: expect.any(String),
              topic: expect.any(String),
              author: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
              article_img_url: expect.any(String),
              comment_count: expect.any(Number),
            })
          );
        });
      });
  });

  test("200: responds with the number of articles defined by LIMIT and P (page) number", () => {
    return request(app)
      .get("/api/articles?limit=5&p=2")
      .expect(200)
      .then((res) => {
        expect(res.body.articles).toHaveLength(5);
        expect(res.body).toHaveProperty("total_count");
        res.body.articles.forEach((article) => {
          expect(article).toEqual(
            expect.objectContaining({
              article_id: expect.any(Number),
              title: expect.any(String),
              topic: expect.any(String),
              author: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
              article_img_url: expect.any(String),
              comment_count: expect.any(Number),
            })
          );
        });
      });
  });

  test("200: responds with the number of articles defined by LIMIT and P (page) number, sorted by topic in descending order", () => {
    return request(app)
      .get("/api/articles?sort_by=topic&order=DESC&limit=5&p=2")
      .expect(200)
      .then((res) => {
        expect(res.body).toHaveProperty("total_count", expect.any(Number));
        expect(res.body.articles).toHaveLength(5);
        res.body.articles.forEach((article) => {
          expect(article).toEqual(
            expect.objectContaining({
              article_id: expect.any(Number),
              title: expect.any(String),
              topic: expect.any(String),
              author: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
              article_img_url: expect.any(String),
              comment_count: expect.any(Number),
            })
          );
        });
      });
  });

  invalidLimit.forEach((limit) => {
    invalidPage.forEach((page) => {
      test(`400: responds with a bad request if invalid limit and/or page given`, () => {
        return request(app)
          .get(`/api/articles?${limit}=5&${page}=1`)
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).toBe(`400 - Bad request, invalid parameters`);
          });
      });
    });
  });

  invalidSortColumns.forEach((sort_by) => {
    invalidOrders.forEach((order) => {
      invalidLimit.forEach((limit) => {
        invalidPage.forEach((page) => {
          test(`400: responds with a bad request if all 4 queries are are invalid`, () => {
            return request(app)
              .get(
                `/api/articles?${sort_by}=topic&order=${order}&${limit}=5&${page}=2`
              )
              .expect(400)
              .then(({ body }) => {
                expect(body.msg).toBe(`400 - Bad request, invalid parameters`);
              });
          });
        });
      });
    });
  });

  sqlInjectionInputs.forEach((input) => {
    test("400: Responds with a bad request for suspicious sql injection inputs", () => {
      return request(app)
        .get(`/api/articles?sort_by=topic&order=ASC&${input}=5&p=3`)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe(
            "400 - Bad request, invalid parameters"
          );
        });
    });

    test("400: Responds with a bad request for suspicious sql injection inputs", () => {
      return request(app)
        .get(`/api/articles?sort_by=created_at&order=ASC&limit=5&${input}=2`)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe(
            "400 - Bad request, invalid parameters"
          );
        });
    });
  });
});
