// 1 INVOCAMOS EXPRESS
const express = require('express');
const app = express();

// 2 SETEAMOS URL ENCODED PARA CAPTURAR DATOS DE FORM
app.use(express.urlencoded({extended:false}));
app.use(express.json());

// 3 INVOCAMOS DOTENV
const dotenv = require('dotenv');
dotenv.config();//{path:'./env/.env'});// EN CASO DE USAR CARPETA .ENV

// 4 CARPETA PUBLIC
//app.use(express.static(path.join(__dirname, 'public')));//APP.JS
app.use('/resources', express.static('public'));
app.use('/resources', express.static(__dirname + '/public'));
//console.log(__dirname);

// 5 ESTABLECER MOTOR DE PLANTILLA EJS
//app.set('views', path.join(__dirname, 'views'));// HBS
//app.set('view engine', 'hbs');
app.set('view engine', 'ejs');

// 6 INVOCAMOS BCRYPTJS
const bcryptjs = require('bcryptjs');

// 7 VARIABLE DE SESION
const session = require('express-session');
app.use(session({
	secret: 'empanada',
	resave: true,
	saveUninitialized: true,
	}));

// 8 INVOCAMOS AL MODULO DE CONEXION A LA BDD
const connection = require('./database/bd');

// 9 ESTABLECEMOS LAS RUTAS
	// LOGIN
	app.get('/login', (req, res) => {
		res.render('login');
		})
	// REGISTER
	app.get('/register',(req, res)=>{
		res.render('register');
		})

// 10 Método para la REGISTRACIÓN
app.post('/register', async (req, res)=>{
	const user = req.body.username;
	const name = req.body.name;
    const rol = req.body.rol;
	const pass = req.body.password;
	let passwordHaash = await bcryptjs.hash(pass, 8);
    connection.query('INSERT INTO hUsers SET ?',{username:user, rol:rol, password:passwordHaash}, async (error, results)=>{
        if(error){
            console.log(error);
        }else{            
//        	res.send('ALTA EXITOSA');
			res.render('register', {
				alert: true,
				alertTitle: "Registration",
				alertMessage: "¡Successful Registration!",
				alertIcon:'success',
				showConfirmButton: false,
				timer: 1500,
				ruta: ''
            	});
        	};	
			res.redirect('/');         
        	
         });
	})

// 11 Método para la AUTENTICACIÓN
app.post('/auth', async (req, res)=>{
	const user = req.body.username;//USERNAME
	const pass = req.body.password;//PASSWORD
	let passwordHaash = await bcryptjs.hash(pass, 8);
		if(user && pass){
   			connection.query('SELECT * FROM hUsers WHERE username = ?',[user], async (error, results)=>{
    			if(results.lenght == 0 || !(await bcryptjs.compare(pass, results[0].password))){ //PASS
                	res.render('login', {
                        alert: true,
                        alertTitle: "Error",
                        alertMessage: "usuario y/o password incorrectas",
                        alertIcon:'error',
                        showConfirmButton: true,
                        timer: false,
                        ruta: 'login'    
                    });
				//Mensaje simple y poco vistoso
                //res.send('Incorrect Username and/or Password!');				
				} else {         
					//creamos una var de session y le asignamos true si INICIO SESSION       
					req.session.loggedin = true;                
					req.session.username = results[0].username;//USERNAME
					res.render('login', {
						alert: true,
						alertTitle: "Conexión exitosa",
						alertMessage: "¡LOGIN CORRECTO!",
						alertIcon:'success',
						showConfirmButton: false,
						timer: 1500,
						ruta: ''
						});        			
			}			
			res.end();
		});
	} else {	
		res.send('Please enter Username and Password!');
		res.end();
	}
});
// 12 AUTENTICAR en las demas paginas
app.get('/', (req, res)=> {
	if (req.session.loggedin) {
		res.render('index',{
			login: true,
			name: req.session.username//USERNAME			
		});		
	} else {
		res.render('index',{
			login:false,
			name:'Debe iniciar sesión',			
		});				
	}
	res.end();
});

// 13 LOGOUT
 //Logout
//Destruye la sesión.
app.get('/logout', function (req, res) {
	req.session.destroy(() => {
	  res.redirect('/') // siempre se ejecutará después de que se destruya la sesión
	})
});

//función para limpiar la caché luego del logout
app.use(function(req, res, next) {
    if (!req.user)
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    next();
});
 
// LISTEN PORT
app.listen(3000, (req, res) => {
	console.log('SERVER RUNNING in localhost:3000');
});