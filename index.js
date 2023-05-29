import express from "express";
import body_parser from "express";
import { PrismaClient } from "@prisma/client";

const app = express();
const port = 8080;

const prisma = new PrismaClient();

app.use(express.json());
var _users = [
  { name: "tobi", email: "tobi@gmail.com" },
  { name: "loki", email: "loki@gmail.com" },
  { name: "zack", email: "zack@gmail.com" },
];

_users.forEach(async (item) => {
  const _email = item.email;
  const _user = await prisma.user.findUnique({
    where: {
      email: _email,
    },
  });
  if (!_user) {
    await prisma.user.create({
      data: {
        email: item.email,
        name: item.name,
      },
    });
  }
});

app.post("/add", async (req, res) => {
  const data = await req.body;
  const { name, email } = data;

  if (name && email) {
    let newUser = { name: name, email: email };
    if (
      await prisma.user.findUnique({
        where: {
          email: newUser.email,
        },
      })
    )
      res.send("user exist");
    else {
      await prisma.user.create({
        data: {
          email: newUser.email,
          name: newUser.name,
        },
      });
      console.log("creted");
      res.send(`Received name: ${name}, email: ${email}`);
    }
  } else res.send("invalid input");
});

app.patch("/users", async (req, res) => {
  const data = await req.body;
  const { email, newemail } = data;
  const e = prisma.user.findUnique({ where: { email } });
  const e1 = prisma.user.findUnique({ where: { email: newemail } });

  if (e && !e) {
    await prisma.user.update({
      where: {
        email,
      },
      data: {
        email: newemail,
      },
    });
    res.send("updated");
  } else if (e && e1) {
    res.send("new email already exist");
  } else res.send("other error");
});

app.delete("/users", async (req, res) => {
  const _email = await req.body.email;

  if (
    _email &&
    (await prisma.user.findUnique({
      where: {
        email: _email,
      },
    }))
  ) {
    await prisma.user.delete({
      where: {
        email: _email,
      },
    });
    res.send("deleted");
  } else res.send("not deleted");
});

app.post("/todo", async (req, res) => {
  const id  = req.body.id;
  const todo = await prisma.todo.update({
    where:{ id },
    data:{done: true}
  })
  res.send(todo)
});

app.get("/todo", async (req, res) => {
  const email = req.query.email;
  const _user = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  if (_user) {
    const todos = await prisma.Todo.findMany({
      where: {
        userId: _user.id,
      },
    });
    res.send(todos);
  } else res.send("invalid user");
});

app.get("/all", async (req, res) => {
  const users = await prisma.user.findMany();
  res.send(users);
});

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
