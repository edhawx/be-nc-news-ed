# Northcoders News API

--- 

# Summary

This portfolio project was created as part of a Digital Skills Bootcamp in Software Engineering provided by [Northcoders](https://northcoders.com/)

This API is to do with a project called Northcoders News. Within it, you will be able to query various endpoints to retrieve the data that you need.
It was completed in week 7 of the Northcoders Software Development Bootcamp. Listed below are some general endpoints you'll find on the API.

The project was written in JavaScript on VSCode on the week beginning May 27th 2024.

---

# Endpoints:

The endpoints are as follows...

GET /api/topics
responds with a list of topics

GET /api
responds with a list of available endpoints

GET /api/articles/:article_id
responds with a single article by article_id

GET /api/articles
responds with a list of articles

GET /api/articles/:article_id/comments
responds with a list of comments by article_id

POST /api/articles/:article_id/comments
add a comment by article_id

PATCH /api/articles/:article_id
updates an article by article_id

DELETE /api/comments/:comment_id
deletes a comment by comment_id

GET /api/users
responds with a list of users

GET /api/articles (queries)
allows articles to be filtered and sorted

GET /api/articles/:article_id (comment count)
adds a comment count to the response when retrieving a single article

---

# API link

Link to HOSTED version of API: https://be-nc-news-ed.onrender.com/ <- include whichever /api/ end point you want to access at the end ie. /api/articles

---

# Minimum specs required to run this project

Node 14.0.0 and later
PostgreSQL 12.0 and later

---

# Before start

# How to use this repo for yourself and test it

1. To clone this database, find the repository and clone it from here: https://github.com/edhawx/be-nc-news-ed

2. After this, enter: git clone *https:// paste the link here* 
cd be-nc-news-ed

3. BEFORE PROCEEDING DO THE FOLLOWING...
Create a new public GitHub repo, but DO NOT initialise it with a readme, .gitignore or license.

4. Then from this cloned local version, push it to your repo like so:
git remote set-url origin YOUR_NEW_REPO_URL_HERE
git branch -M main
git push -u origin main

5. Open it with your chosen programming interface, like VSCode for example

6. We'll need two .env files for this API, one for testing, and one for development.
You can check .env-example to see how these .env files should be setup.

Please create these 2 files:
.env.test
.env.development

Place them in the root directory

Enter this into .env.test:
PGDATABASE=nc_news_test

Enter this into .env.development:
PGDATABASE=nc_news

Save both.

7. Before proceeding, check that both of the .env files you have just created are in a 
.gitignore file. 


8. Input and install the following:
npm install
The above will install all dependencies from package.json

9. Ensure that the following are in your package.json devDependencies:
jest, jest-extended, jest-sorted, supertest

10. Ensure that the following are in your package.json dependencies:
express, husky, pg-format, dotenv, pg

11. In your package.json, take a look in your "scripts" section. You'll need to check that the scripts are all in place here, which they should be:

"scripts": {
    "setup-dbs": "psql -f ./db/setup.sql",
    "seed": "node ./db/seeds/run-seed.js",
    "test": "jest",
    "prepare": "husky install",
    "start": "node listen.js",
    "seed-prod": "NODE_ENV=production npm run seed"
  }

It should look like the above. This will help us to run our seed.

12. To set-up your databases, first enter:
npm setup-dbs

13. To seed the now existing databases, enter:
npm seed

14. Now you should have all of your data set-up so that you can test it.
To run all of the tests, located within the app.models.js file enter:

npm test 

This will go through and check each of the tests inputted into the test file.

15. (Optional) If you want the server to go live, enter:
npm start







