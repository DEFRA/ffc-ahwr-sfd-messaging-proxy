const health = require('../routes/health.js')

const plugin = {
  plugin: {
    name: 'router',
    register: (server, options) => {
      server.route([].concat(
        health
      ))
    }
  }
}

module.exports = plugin
