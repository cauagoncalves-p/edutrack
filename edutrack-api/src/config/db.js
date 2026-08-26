// Carrega o arquivo .env e injeta suas variáveis em process.env,
// tornando DB_SERVER, DB_NAME, DB_USER, DB_PASSWORD etc. acessíveis no código
require('dotenv').config()

// Importa o driver mssql (instalado via npm), responsável por
// toda a comunicação entre o Node e o SQL Server
const sql = require('mssql')

const config = {
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,

    option: {
        encrypt: false,

        // Não valida o certificado do servidor — evita erros de
        // certificado "não confiável" comuns em ambiente local/dev
        trustServerCertificate: true
    }

    
}