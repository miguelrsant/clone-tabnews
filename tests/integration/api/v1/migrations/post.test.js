import database from "infra/database.js";

beforeAll(cleanDatabase);

async function cleanDatabase() {
  await database.query("drop schema public cascade; create schema public;");
}

test("POST to /api/v1/migrations should return 200", async () => {
  const res1 = await fetch("http://localhost:3000/api/v1/migrations", {
    method: "POST",
  });
  expect(res1.status).toBe(201);

  const responseBody = await res1.json();

  expect(responseBody.length).toBeGreaterThan(0);
  expect(Array.isArray(responseBody)).toBe(true);

  const res2 = await fetch("http://localhost:3000/api/v1/migrations", {
    method: "POST",
  });
  expect(res2.status).toBe(200);

  const response2Body = await res2.json();

  expect(response2Body.length).toBe(0);
  expect(Array.isArray(response2Body)).toBe(true);
});
