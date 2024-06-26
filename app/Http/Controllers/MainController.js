const venomService = require('../../Services/Venom')
const { dispatcher } = require('../../Queues/Main')
const dayjs = require('dayjs')

exports.connect = async (req, res) => {
  const { connectionName, force } = req.body || {}

  if (!connectionName) {
    return res.json({
      message: "Connection name is missing",
    })
  }
  try {
    const results = await venomService[force ? "makeConnection" : "getConnection"](connectionName)
    console.log({ results });
    if (results.status == "CONNECTED") {
      return res.json({
        status: "OK",
        message: "Connected",
      })
    }

    return res.json(results)
  }
  catch (e) {
    console.log(e.message)
    return res.json(e)
  }


}

exports.renderQR = async (req, res) => {
  const imageName = req.params.name

  const baseURL = '/storage'

  const path = `${baseURL}/${imageName}`

  res.render('view', { path })
}

exports.connections = async (req, res) => {
  const connections = await venomService.getConnection();

  res.json({
    connections: connections.filter(c => c.client).map(c => c.connectionName)
  })
}

exports.sendMessage = async (req, res) => {
  // response=null
  // return res.json({
  //   response
  // })
  const { connectionName, number, message ,url } = req.body || {};
  console.log(connectionName, number, message ,url)
  if (typeof number == 'undefined' || typeof message == 'undefined' || typeof url == 'undefined') {
    return res.json({
      error: "Missing Params"
    })
  }

  try {
    await new Promise(resolve => setTimeout(resolve, 6000));
    const response = await venomService.sendMessage({ connectionName, number, message ,url })

    return res.json({
      response
    })

  } catch (error) {
    return res.json({
      error
    })
  }
}

exports.sendMessage2 = async (req, res) => {
  const { connectionName, number, message ,url } = req.body || {};
  console.log(connectionName, number, message ,url)
  if (typeof number == 'undefined' || typeof message == 'undefined' || typeof url == 'undefined') {
    return res.json({
      error: "Missing Params"
    })
  }

  try {
    const response = await venomService.sendMessage({ connectionName, number, message ,url })

    return res.json({
      response
    })

  } catch (error) {
    return res.json({
      error
    })
  }
}

exports.sendMessageBtn = async (req, res) => {
  const { connectionName, number, message ,url } = req.body || {};
  console.log(connectionName, number, message ,url)
  if (typeof number == 'undefined' || typeof message == 'undefined' || typeof url == 'undefined') {
    return res.json({
      error: "Missing Params"
    })
  }

  try {
    const response = await venomService.sendMessageBtn({ connectionName, number, message ,url })

    return res.json({
      response
    })

  } catch (error) {
    return res.json({
      error
    })
  }
}

exports.scheduleMessage = (req, res) => {
  const { connectionName, number, message, at } = req.body || {};

  const payload = {
    handler: "app/Jobs/SendWhatsappMessage",
    payload: {
      connectionName,
      number,
      message,
    }
  }

  dispatcher(payload, { delay: dayjs(at).diff(dayjs()) })

  res.json({
    message: 'Message Scheduled!'
  })
}