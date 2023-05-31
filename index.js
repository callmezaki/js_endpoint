import express from "express";
import body_parser from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import authenticateToken from "./middleware/auth.js";
import swaggerConfig from './swagger.js';
import authentication from "./routes/authentication.js";

const app = express();
const port = 8080;

const prisma = new PrismaClient();

swaggerConfig(app);
app.use(authentication)

app.use(express.json());
var _users = [
  { name: "zack", email: "zack@gmail.com", password: "zack" },
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
        password: await bcrypt.hash(item.password, 10),
      },
    });
  }
});

app.patch("/users", authenticateToken, async (req, res) => {
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

app.delete("/users", authenticateToken, async (req, res) => {
  await prisma.user.delete({
    where: {
      id: req.user.id,
    },
  });
  res.send("deleted");
});


/**
 * @swagger
 * /todo:
 *   put:
 *     summary: Update a todo
 *     description: Updates the status of a todo item to mark it as done.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: query
 *         description: The ID of the todo item.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful operation
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: No token
 *       500:
 *         description: An unexpected error occurred
 */
app.put("/todo", authenticateToken, async (req, res) => {

    const id = req.query.id === '' && parseInt(req.query.id)

    if (id) {
      const todo = await prisma.todo.update({
        where: { id: id },
        data: { done: true },
      });

      res.send(todo);
    } else {
      res.send("Invalid task id");
    }
});


/** 
* @swagger
 * /todo:
 *   post:
 *     summary: Create a new todo
 *     description: Creates a new todo for the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: task
 *         in: body
 *         description: The task description for the todo.
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             task:
 *               type: string
 *     responses:
 *       200:
 *         description: Successful operation
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: An unexpected error occurred
 */
app.post("/todo", authenticateToken, async (req, res) => {
  const task = await req.body.task;

  const todo = await prisma.todo.create({
    data: {
      userId: req.user.id,
      task: task,
    },
  });
  res.send(todo);
});

/**
 * @swagger
 * /todo:
 *   get:
 *     summary: Get user's todos
 *     description: Retrieves the todos associated with the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful operation
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: An unexpected error occurred
 */

app.get("/todo", authenticateToken, async (req, res) => {
  const todos = await prisma.Todo.findMany({
    where: {
      userId: req.user.id,
    },
  });
  res.send(todos);
});


app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
