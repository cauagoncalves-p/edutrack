require('dotenv').config()

// Importa o driver mssql (instalado via npm), responsável por
// toda a comunicação entre o Node e o SQL Server
const sql = require('mssql')

const config = {
    server: process.env.EDUTRACK_DB_SERVER,
    port: parseInt(process.env.EDUTRACK_DB_PORT) || 1433,
    database: process.env.EDUTRACK_DB_NAME,
    user: process.env.EDUTRACK_DB_USER,
    password: process.env.EDUTRACK_DB_PASSWORD,
    options: {
        encrypt: false,
        trustServerCertificate: true
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};
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