/* eslint no-console:0 */
require('babel/register')

const chalk = require('chalk')
const server = require('./server/app')

const host = 'localhost'
const port = 3000

server.listen(port, host, function() {
  console.log(chalk.green(
    `Server is now running at ${host}:${port}.`
  ))
})
