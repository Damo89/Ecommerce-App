const swaggerJSDoc = require('swagger-jsdoc');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'E-commerce API',
      version: '1.0.0',
      description: 'Comprehensive API documentation for the E-commerce platform',
    },
    servers: [
      {
        url: 'http://localhost:5000', //'http://localhost:5000/api-docs'
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'connect.sid',
        },
      },
    },
    security: [
      {
        cookieAuth: [],
      },
    ],
  },
  apis: [
    path.join(__dirname, './routes/*.js'),
    path.join(__dirname, './app.js'),
  ],
};

// Generate the Swagger specification from JSDoc comments
const swaggerSpec = swaggerJSDoc(options);

if (require.main === module) {
  // Convert JSON to YAML format
  const yamlStr = yaml.dump(swaggerSpec, { lineWidth: -1 });

  // Write the YAML string to a file
  fs.writeFileSync(path.join(__dirname, './swagger.yaml'), yamlStr, 'utf8');

  console.log('Swagger YAML successfully generated at ./swagger.yaml');
}

module.exports = swaggerSpec;