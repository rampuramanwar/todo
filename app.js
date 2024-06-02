const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const addDays = require('date-fns/addDays')
const databasePath = path.join(__dirname, 'todoApplication.db')
const {format} = require('date-fns')
/*import { format, compareAsc } from 'date-fns'

format(new Date(2014, 1, 11), 'MM/dd/yyyy')
//=> '02/11/2014'*/
const app = express()

app.use(express.json())

let d = null
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    })

    app.listen(3000, () =>
      console.log('Server Running at http://localhost:3000/'),
    )
  } catch (error) {
    console.log(`DB Error: ${error.message}`)
    process.exit(1)
  }
}

initializeDbAndServer()
/*
{
"id": 2,
"todo": "Buy a Car",
"priority": "MEDIUM",
"status": "TO DO",
"category": "HOME",
"dueDate": "2021-09-22"
},
...*/
const find = properties => {
  //123 12 13  23 1 2 3
  if (properties.includes('status')) {
    if (properties.includes('priority')) {
      if (properties.includes('category')) {
        return 'all'
      }
    }
  } else if (properties.includes('status')) {
    if (properties.includes('priority')) {
      return 'standpri'
    }
  } else if (properties.includes('status')) {
    if (properties.includes('category')) {
      return 'standcat'
    }
  } else if (properties.includes('priority')) {
    if (properties.includes('category')) {
      return 'priandcat'
    }
  } else if (properties.includes('status')) {
    return 'st'
  } else if (properties.includes('priority')) {
    return 'pri'
  } else if (properties.includes('category')) {
    return 'cat'
  }
}

app.get('/todos/', async (request, response) => {
  let body = request.query
  let query
  let properties = Object.getOwnPropertyNames(body)
  const {status, priority, category, search_q = ''} = request.query
  const need = find(properties)
  switch (need) {
    case 'all':
      query = `
            select * from todo 
            where
            priority='${priority}' and 
            status='${status}' and 
            category='${category}' and
            todo like '%${search_q}%'
            `
      break
    case 'standpri':
      query = `
            select * from todo 
            where
            priority='${priority}' and 
            status='${status}' and 
            todo like '%${search_q}%'
            `
      break
    case 'standcat':
      // const {status, category, search_q = ''} = request.query

      query = `
            select * from todo 
            where
            status='${status}' and 
            category='${category}' and
            todo like '%${search_q}%'
            `
      break
    case 'priandcat':
      //  const {priority, category, search_q = ''} = request.query

      query = `
            select * from todo 
            where
            priority='${priority}' and 
            category='${category}' and
            todo like '%${search_q}%'
            `
      break
    case 'st':
      //  const {status, search_q = ''} = request.query

      query = `
            select * from todo 
            where
            status='${status}' and 
            todo like '%${search_q}%'
            `
      break
    case 'pri':
      //  const {priority, search_q = ''} = request.query

      query = `
            select * from todo 
            where
            priority='${priority}' and 
            todo like '%${search_q}%'
            `
      break
    case 'cat':
      //  const {category, search_q = ''} = request.query

      query = `
            select * from todo 
            where
            category='${category}' and
            todo like '%${search_q}%'
            `
      break
    default:
      query = `
            select * from todo 
            where
            todo like '%${search_q}%'
            `
      break
  }
  const result = await db.all(query)
  response.send(result)
  console.log(request.query)
})

app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  console.log(todoId)
  const query = `
select * from todo where id =${todoId};
`
  result = await db.get(query)

  response.send(result)
})
///agenda/?date=2021-12-12

app.get('/agenda/', async (request, response) => {
  const {date} = request.query
  const formatdate = format(new Date(date), 'yyyy-MM-dd')
  console.log(formatdate)
  const query = `
select * from todo
 where due_date =${formatdate};
`
  result = await db.all(query)
  //console.log('hi')
  response.send(result)
})

app.post('/todos/', async (request, response) => {
  const {id, todo, priority, status, category, dueDate} = request.body
  const formatdate = format(new Date(dueDate), 'yyyy-MM-dd')

  console.log(typeof formatdate)

  const postTodoQuery = `
  INSERT INTO
    todo (id, todo, priority, status,category,due_date)
  VALUES
    (${id}, '${todo}', '${priority}', '${status}',${category}',${formatdate});
    `
  await db.run(postTodoQuery)
  response.send('Todo Successfully Added')
})
///delete nodemon app.js
app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const deleteTodoQuery = `
  DELETE FROM
    todo
  WHERE
    id = ${todoId};`

  await db.run(deleteTodoQuery)
  response.send('Todo Deleted')
})
module.exports = app
