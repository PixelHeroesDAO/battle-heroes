const express = require('express')
const cors = require('cors')
const { createServer } = require('http')
const { Server } = require('socket.io')
const Moralis = require('moralis/node')
const api = require('./api')
const store = require('./store')
const { getNFTs } = require('./NFT')
const { setNFTs } = require('./NFT/actions')
const { gameManager } = require('./game')
const { FRONTEND_URL, PORT } = require('./utils/constants')

Moralis.start({
  serverUrl: process.env.MORALIS_SERVER_URL,
  appId: process.env.MORALIS_APPLICATION_ID
})

const corsOptions = {
  origin: new URL(FRONTEND_URL).origin
}

setInterval(() => {
  const state = store.getState()
  console.log(state.player.players.length)
}, 5000)

const main = async () => {
  const NFTs = await getNFTs()

  setNFTs(NFTs)

  const app = express()

  app.use(cors(corsOptions)).use(api)

  const server = createServer(app)

  const io = new Server(server, {
    cors: corsOptions
  })

  const onConnection = socket => {
    console.log('onConnection', socket.id)

    gameManager(io, socket)
  }

  io.on('connection', onConnection)

  server.listen(PORT, () => {
    console.log(`Listening on ${server.address().port}`)
  })
}

main()
