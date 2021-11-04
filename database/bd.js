const mysql = require('mysql');

//let pool = mysql.createConnection( para una conexion
//let pool = mysql.createPool({ // crea un pool de conexiones
const connection = mysql.createConnection({
	host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
	//port: process.env.DB_PORT || 3306,
    //pool: {min : 1, max : 10},
    //connectionLimit: 10, // limite de conexiones simultaneas
	});

connection.connect((error) => {
	if(error){
    	console.log('El error de conexion es :'+error);
    	return;
	    }
		console.log('CONECTADO A LA BDD!');
	});

//pool.query = util.promisify(pool.query); //convierte a pool en QUERY
//module.exports = pool;

module.exports = connection;

