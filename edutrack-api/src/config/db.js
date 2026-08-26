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
    },

    pool:{
        max: 10, 
        min: 0,
        idleTimeoutMillis: 30000
    }
}

const poolPromise = new sql.ConnectionPool(config).connect()

.then(pool =>{
    console.log("Conexão estabelecida com sucesso!")
    return pool
})

.catch(err=>{
    console.log("Erro para se conectar!")
    throw err
})

module.exports={
    sql,
    poolPromise
}