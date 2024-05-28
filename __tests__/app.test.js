const request = require("supertest");
const app = require("../app");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
// const testData = require("../db/data/test-data/topics")
const testData = require("../db/data/test-data/index")

beforeEach(()=>{
    return seed(testData);
});

afterAll(() => {
    return db.end();
  });

describe("GET /api/topics", ()=>{
    test("GET:200 sends array of all topics to client",()=>{
        return request(app)
        .get("/api/topics")
        .expect(200)
        .then(({body})=>{
            expect(body.topics).toHaveLength(3);
            body.topics.forEach((topic)=>{
                expect(topic).toMatchObject({
                    slug: expect.any(String),
                    description: expect.any(String),
                })
            })
        })
    })

    test("GET:404 responds with 404 not found", () => {
        return request(app)
          .get("/api/endpoint-that-doesnt-exist")
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).toBe("404 - Not found");
          });
      });

      test("GET:400 responds with 400 when given invalid params", ()=>{
        return request(app)
        .get("/api/topics?nonexistantParam=Nope")
        .expect(400)
        .then(({body})=>{
            expect(body.msg).toBe("400 - Bad request")
        })
      })
})