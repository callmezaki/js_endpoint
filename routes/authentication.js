import  express  from "express";
import body_parser from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import authenticateToken from "./../middleware/auth.js";
import swaggerConfig from './../swagger.js';


const prisma = new PrismaClient();
const authentication = express.Router()
authentication.use(express.json());

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user with the provided name, email, and password.
 *     parameters:
 *       - in: body
 *         name: user
 *         description: User object containing name, email, and password.
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               description: The name of the user.
 *             email:
 *               type: string
 *               format: email
 *               description: The email address of the user.
 *             password:
 *               type: string
 *               format: password
 *               description: The password of the user.
 *     responses:
 *       200:
 *         description: User registration successful
 *       400:
 *         description: Invalid input
 *       409:
 *         description: User already exists
 */
authentication.post("/register", async (req, res) => {

    const { name, email, password } = await req.body;
  
    if (name && password && email) {
      let newUser = {
        name: name,
        email: email,
        password: await bcrypt.hash(password, 10),
      };
      if (
        await prisma.user.findUnique({
          where: {
            email: newUser.email,
          },
        })
      )
        res.status(409).send("user exist");
      else {
        await prisma.user.create({
          data: {
            email: newUser.email,
            name: newUser.name,
            password: newUser.password,
          },
        });
        console.log("creted");
        res.status(200).send(`Received name: ${name}, email: ${email}`);
      }
    } else res.status(400).send("invalid input");
  });
  
/**
 * @swagger
 * /login:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user with the provided name, email, and password.
 *     parameters:
 *       - in: body
 *         name: user
 *         description: User object containing name, email, and password.
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *               format: email
 *               description: The email address of the user.
 *             password:
 *               type: string
 *               format: password
 *               description: The password of the user.
 *     responses:
 *       200:
 *         description: User login successful
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: An unexpected error occurred
 */

  authentication.post("/login", async (req, res) => {
    const { email, password } = req.body;
    
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      
      if (!user) {
        res.status(401).json({ error: "Invalid credentials" });
      } else {
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
          res.status(401).json({ error: "Invalid credentials" });
        } else {
          const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
          res.json({ token });
        }
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "An unexpected error occurred" });
    }
  });


  export default authentication