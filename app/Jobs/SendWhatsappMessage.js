const venomService = require('../Services/Venom');

const job = async ({ connectionName, number, message ,url }) => {
    await venomService.sendMessage({ connectionName, number, message , url})
}

module.exports = job