#!/usr/bin/env node
const process = require('process')

const consola = require('consola')
const logger = consola.withScope('Event')
const prettyjson = require('prettyjson')

const args = process.argv.slice(2)
const server = args[0]

if (!server) {
  consola.error('Usage: socketio-debugger <host>:<port>')
  process.exit(1)
}

const socket = require('socket.io-client')(server)

const log = (event, data) => {
  if (typeof data !== 'object') {
    logger.log(event, data)
  } else {
    logger.log(event, prettyjson.render(data))
  }
}

const onevent = socket.onevent

socket.onevent = function(packet) {
  const args = packet.data || []
  onevent.call(this, packet)
  packet.data = ['*'].concat(args)
  onevent.call(this, packet)
}

socket.on('connect', () => {
  logger.start('connect', `Connected to ${server}`)
})

socket.on('connect_error', () => {
  logger.error('connect_error', `Cannot connect to ${server}`)
})

socket.on('reconnect', attempt => {
  logger.info('reconnect', `Reconnected to ${server} (Attempt: ${attempt})`)
})

socket.on('disconnect', () => {
  logger.error('disconnect', `Disconnected from ${server}`)
})

socket.on('*', (event, data) => {
  log(event, data)
})
