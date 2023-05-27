
import  express  from "express"
import  body_parser  from "express"
import { PrismaClient } from '@prisma/client';

const app = express()
const port = 8080

const prisma = new PrismaClient();


app.use(express.json())
var _users = [
    { name: 'tobi' , age: 25}
    , { name: 'loki', age: 13 }
    , { name: 'zack', age: 19 }
];

_users.forEach( async (item) => {
    const _name = item.name
   const _use = await prisma.users.findUnique({
    where:{
        name : _name
    }
   })
   if (!_use){
    await prisma.users.create({data: {
        name: item.name,
        age:item.age
    }})
   }
})

app.get('/users', (req, res) => {
    var qq = req.query['name'];
    var user = users.find((user) => user.name === qq);
    
    if (user) {
        res.send(user);
    } else {
        if (!qq)
        res.send('enter a valid query');
        else
        res.send('u r not in the database');
    }
});

app.post('/add', async (req, res) => {
    
    const data = await req.body;
    const {name , age} = data;

    if ( name && age)
    {
        let newUser = {name: name, age: age};
        if ( await prisma.users.findUnique({
            where:{
                name : newUser.name
            }}))
            res.send("user exist")
        else
        {
            await prisma.users.create({data: {
                name: newUser.name,
                age:newUser.age
            }});
            console.log("creted")
            res.send(`Received name: ${name}, age: ${age}`);
        }
    }
    else
    res.send("invalid input");
});

app.patch("/users", async (req , res) => {
    const data = await req.body
    const {name , newname} = data;
    var user = users.find((user) => user.name === name);
    
    if(user ,user !== undefined ,name, newname)
    {
        users.find((user) => {user.name === name ? user.name = newname : ''})
        res.send(user) 
    }
    else
    res.send('not updated')
})

app.get("/all", async (req, res) => {

    const users = await prisma.users.findMany()
    res.send(users)
})

app.listen(port, () => {
    console.log(`app listening on port ${port}`)
})