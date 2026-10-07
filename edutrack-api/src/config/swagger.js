const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'EduTrack AI API',
            version: '1.0.0',
            description: 'API do EduTrack AI — gestão acadêmica de disciplinas e tarefas'
        },
        servers: [
            { url: 'http://localhost:3000', description: 'Servidor local' }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        },
        security: [{ bearerAuth: [] }]
    },
    // Onde o swagger-jsdoc vai procurar os comentários de documentação (próximo passo)
    apis: ['./src/routes/*.js']
};

module.exports = swaggerJsdoc(options);