const express = require('express')
const app = express()

app.use(express.static('public'))

app.get('/', (request, response) => {
    response.render(__dirname+'index.html')
})

const server = app.listen(7000, () => {
    console.log(`Express running -> PORT ${server.address().port}`)
})