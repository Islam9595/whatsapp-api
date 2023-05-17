const venom = require('venom-bot');
const fs = require('fs');
const fsAsync = require('fs/promises')

module.exports = new class {
  constructor() {
    this.connections = []
  }

  async getExistingConnections() {
    const sessions = await fsAsync.readdir('tokens')

    return sessions.map(s => s.replace('-session', ''))
  }

  getConnectionNames() {
    if (this.connections.length) {
      return this.connections.map(c => c.connectionName)
    }

    return [];
  }

  async createIfNotConnected(connectionName) {
    const isConnectedAlready = this.getConnectionNames().includes(connectionName);
    
    console.log({
      connectionName,
      isConnectedAlready,
    });

    if (!isConnectedAlready) {
      return await this.makeConnection(connectionName)
    }
  }

  async getConnection(connectionName) {
    if (typeof connectionName != 'undefined') {
      const results = await this.createIfNotConnected(connectionName);

      if (results) {
        return results
      }

      return this.connections.filter(c => c.connectionName == connectionName)[0];
    }

    return this.connections
  }

  async makeConnection(connectionName) {
    return new Promise((resolve, reject) => {
      const catchQR = (base64Qr) => {
        const matches = base64Qr.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

        const response = {};

        if (matches.length !== 3) {
          return new Error('Invalid input string');
        }

        response.type = matches[1];

        response.data = new Buffer.from(matches[2], 'base64');

        const imageBuffer = response;

        const fileName = `${connectionName}-qr.png`

        const path = `public/storage/${fileName}`

        fs.writeFile(path, imageBuffer['data'], 'binary', (err) => {
          if (err != null) {
            console.log(err);
          }
        });

        resolve({
          connectionName,
          status: "WAITING_FOR_QRSCAN",
          url: process.env.APP_URL + `/render/qr/${fileName}`,
        })
      }

      const session = {
        session: `${connectionName}-session`
      };

      const venomConfig = {
        logQR: false,
        headless: false
      }

      venom.create(session, catchQR, undefined, venomConfig)
        .then(client => {
          const connection = {
            connectionName,
            client,
            status: 'CONNECTED'
          }

          this.connections.push(connection)

          resolve(connection)
        })
        .catch(err => reject(err))
    })
  }

  async sendMessage({ connectionName, number, message ,url}) {
    return new Promise( async (resolve, reject) => {
      const connection = await this.getConnection(connectionName)

      if (connection) {
        const client = connection.client
  
        if (typeof number == 'undefined' || typeof message == 'undefined' || typeof url == 'undefined') {
          reject('Missing Params');
        }
        
        try {
          const res2 = await client.sendLinkPreview(`${number}@c.us`, url,"");
          if(!res2.erro){
            const res1 = await client.sendText(`${number}@c.us`, message);
            resolve(res1)
          }else {
            resolve(res2)
          }
        }
        catch (error){
          reject(error)
          
        }


      }
    })
  }

  async sendMessageBtn({ connectionName, number, message ,url}) {
    return new Promise( async (resolve, reject) => {
      const connection = await this.getConnection(connectionName)

      if (connection) {
        const client = connection.client

        if (typeof number == 'undefined' || typeof message == 'undefined' || typeof url == 'undefined') {
          reject('Missing Params');
        }

        try {

          const buttons = [
            {
              buttonText: {
                displayText: 'Text of Button 1',
              },
            },
            {
              buttonText: {
                displayText: 'Text of Button 2',
              },
            },
          ];

          const message = {
            content: 'Please choose an option:',
            options: {
              replyMarkup: {
                inlineKeyboard: [buttons],
              },
            },
          };

          client.sendText(chatId, message.content, message.options).then((result) => {
            console.log('Buttons sent successfully:', result);
          }).catch((err) => {
            console.error('Failed to send buttons:', err);
          });
        }
        catch (error){
          reject(error)
        }


      }
    })
  }
}