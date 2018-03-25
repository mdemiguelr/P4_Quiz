
const Sequelize = require('sequelize');

const  {log, biglog, errorlog, colorize} = require("./out");

const {models} = require('./model');

/**
* Muestra la ayuda.
*
* @param rl Objeto readLine usado para implementar el CLI.
*/
exports.helpCmd = (socket,rl) => {
log(socket,"Comandos:");
log(socket," h|help - Muestra esta ayuda.");
log(socket," list - Listar los quizzes existentes. ");
log(socket," show <id> -Muestra la pregunta y la respuesta del quiz indicado.");
log(socket,"add - Añadir un nuevo quiz interactivamente.");
log(socket," delete <id> - Borrar el quiz indicado.");
log(socket," edit <id> - Editar el quiz indicado.");
log(socket," test <id> - Probar el quiz indicado.");
log(socket," p|play - Jugar a prehuntar aleatoriamente todos los quizzes.");
log(socket," credits -Créditos.");
log(socket," q|quit -Salir del programa.");
rl.prompt();
};

/**
* Lista todos los quizzes existentes en el modelo.
*
* @param rl Objeto readLine usado para implementar el CLI.
*/
exports.listCmd = (socket,rl) =>
{
    models.quiz.findAll() //models =modelos de la BD; findAll es una promesa
    //.then(quizzes => { : la funcion toma el parametro quizzes (array que me devuelve findAll con todos los quizzes)
        .each(quiz => { //en vez de for
        // quizzes.forEach(quiz => {
        log(socket,`[${colorize(quiz.id, 'magenta')}]: ${quiz.question}`);
})
.
    catch(error => {
        errorlog(socket,error.message
)
    ;
})
.
    then(() => { //no saco el prompt hasta que no he terminado con todas las promesas
        rl.prompt();
})
};

    /**
     * Esta función devuelve una promesa que:
     * -Valida que se ha introducido un valor para el parámetro.
     * -Convierte el parámetro en un número entero.
     * Si todo va bien, la promesa se satisface y devuelve el valor de id a usar
     *
     * @param id Parámetro con el índice a validar.
     */
const validateId = id => {
    return new Sequelize.Promise((resolve,reject) => {
        if(typeof id === "undefined") {
            reject(new Error(`Falta el parámetro <id>.`));
        } else {
            id =parseInt(id); //coger la parte entera y descartar lo demás
            if (Number.isNaN(id)){
                reject(new Error(`El valor del parámetro <id> no es un número.`));
            } else {
                resolve(id);
            }
        }
    });
};

/**
* Muestra el quiz indicado en el parámetro: la pregunta y la respuesta.
*
* @param rl Objeto readLine usado para implementar el CLI.
* @param id Clave del quiz a mostrar.
*/
exports.showCmd = (socket,rl,id) =>{
    validateId(id)
        .then(id => models.quiz.findById(id))
        .then(quiz => {
            if (!quiz) {
                throw new Error (`No existe un quiz asociado al id=${id}.`);
            }
            log(socket,`[${colorize(quiz.id,'magenta')}]; ${quiz.question} ${colorize('=>','magenta')} ${quiz.answer}`);
    })
    .catch(error => {
        errorlog(socket,error.message);
     })
    .then(() => { //sacar prompt cuando han acabado todas las promesas
        rl.prompt();
    });
};

/**
 * Esta función devuelve una promesa que cuando se cumple, proporciona el texto introducido
 * Entonces la llamada a then que hay que hacer la promesa deuvelta será:
 *      .then(answer => {...})
 *
 *      También colorea en rojo el texto de la pregunta, elimina espacios al principio y
 *
 *      @param rl Objeto readline usado para implementar el CLI.
 *      @param text Pregunta que hay que hacerle al usuario.
 */
const makeQuestion = (rl, text) => {

    return new Sequelize.Promise((resolve,reject) => {
        rl.question(colorize(text, 'red'), answer => {
            resolve(answer.trim());
        });
    });
};

/**
* Añade un nuevo quiz al modelo.
* Pregunta interactivamente por la pregunta y por la respuesta.
*
* Hay que recordar que el funcionamiento de la función rl.question es asíncrono.
* El prompt hay que sacarlo cuando ya se ha terminado la interacción con el ususario,
* es decir, la llamada a rl.prompt() se debe hacer en la callback de la segunda
* llamada a rl.question.
*
* @param rl Objeto readLine usado para implementar el CLI.
*/
exports.addCmd = (socket,rl) => {

   makeQuestion(rl,'Introduzca una pregunta: ')
       .then(q => {
           return makeQuestion(rl, 'Introduzca la respuesta ')
               .then(a => {
                   return {question: q, answer: a};
               });
       })
       .then((quiz) => {
            return models.quiz.create(quiz);
        })
        .then((quiz) => {
            log (socket,` ${colorize('Se ha añadido', 'magenta')}: ${quiz.question} ${colorize('=>', 'magenta')} ${answer}`);
        })
       .catch(Sequelize.ValidationError,error => {
           errorlog (socket,'El quiz es erróneo:');
           error.errors.forEach(({message}) => errorlog(message));
    })
    .catch(error => {
        errorlog(socket,error.message);
    })
    .then(() => {
    rl.prompt();
    });
};

/**
* Borra un quiz del modelo.
*
* @param rl Objeto readLine usado para implementar el CLI.
* @param id Clave del quiz a borrar en el modelo.
*/
exports.deleteCmd = (socket,rl,id) =>{
        validateId(id)
        .then(id => models.quiz.destroy({where: {id}}))
        .catch(error => {
        errorlog(socket,error.message);
        })
        .then(() => {
        rl.prompt();
        });
} ;

/**
* Edita un quiz del modelo.
*
* @param rl Objeto readLine usado para implementar el CLI.
* @param id Clave del quiz a editar en el modelo.
*/
exports.editCmd = (socket,rl,id) =>{
    validateId(id) //Promesa
        .then(id => models.quiz.findById(id))
        .then(quiz => {
            if (!quiz) {
                throw new Error (`No existe un quiz asociado al id=${id}.`);
            }
            process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)},0);
            return makeQuestion(rl, 'Introduzca la pregunta: ')
                .then (q => { //texto pregunta
                    process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)},0);
                    return makeQuestion(rl, 'Introduzca la respuesta: ')
                        .then(a => {
                            quiz.question = q;
                            quiz.answer = a;
                            return quiz;
                    });
            });
    })
        .then(quiz => {
        return quiz.save();

    })
    .then(quiz => {
        log(socket,`Se ha cambiado el quiz ${colorize(quiz.id,'magenta')} por: ${quiz.question} ${colorize('=>','magenta')} ${quiz.answer} `);
        })
        .catch(Sequelize.ValidationError, error => {
            errorlog(socket,'El quiz es erróneo:'
    )
        ;
        error.errors.forEach(({message}) => errorlog(socket,message)
    )
        ;
    })
        .catch(error => {
        errorlog(socket,error.message);
        })
        .then(() => {
            rl.prompt();
        });
        };


/**
* Prueba un quiz, es decir, hace una pregunta del modelo a la que debemos contestar.
*
 * Hay que recordar que el funcionamiento de la función rl.question es asíncrono
 *
* @param rl Objeto readLine usado para implementar el CLI.
* @param id Clave del quiz a probar.
*/
exports.testCmd = (socket,rl,id) => {
    validateId(id) //Promesa
        .then(id => models.quiz.findById(id)) //busco el quiz que tenga el id dado como parámetro
        .then(quiz => {
            if(!quiz){
                throw new Error(`No existe un quiz asociado al id=${id}.`); //si no tiene el quiz id metido, error
        }
        return makeQuestion(rl, `${quiz.question}:`)
    .then(answer =>{
        if(answer.toLowerCase().trim() == quiz.answer.toLowerCase().trim()){
                log(socket,`Su respuesta es correcta. `);
                biglog(socket,"Correcta","green");
                return;
} else{
    log(socket,`Su respuesta es incorrecta. `);
    biglog(socket,"Incorrecta","red");
}
return quiz;
    });
})

.catch(Sequelize.ValidationError, error => {
    errorlog(socket,"El quiz es erróneo:");
    error.errors.forEach(({message}) => errorlog(socket,message));
})
.catch(error => {
    errorlog(socket,error.message);
})

.then(() => {
    rl.prompt();
});
};


//Guardamos el número de preguntas acertadas
let score =0;
//Array con los id de los quizzes ya preguntados.
const resolved =[];

/**
* Pregunta todos los quizzes existenres en el modelo en orden aleatorio.
* Se gana si se contesta a todos satisfactoriamente.
*
* @param rl Objeto readLine usado para implementar el CLI.
*/
exports.playCmd = (socket,rl) => {
        let score = 0;
        let toBePlayed = []; //guardar id de todas las preguntas que existen
        const playOne = () =>
        { //funcion playOne , sin parámetros
            return Promise.resolve()
                .then(() => { //Quiero que devuelva el resultado de la promesa MakeQuestion
                if(toBePlayed.length === 0) {
                    log(socket,"No hay nada más que preguntar. ");
                    log(socket,`Fin del juego. Aciertos: ${score}`);
                    biglog(socket,`${score}`,"magenta");
                    rl.prompt();
                    return;
        }
        let pos = Math.floor(Math.random()*toBePlayed.length);
                let quiz = toBePlayed[pos];
                toBePlayed.splice(pos,1);
                makeQuestion(rl,`${quiz.question}: `)
                    .then(answer => {
                        if(answer.toLowerCase().trim() == quiz.answer.toLowerCase().trim()){
                            score++;
                            log(socket,`CORRECTO -Lleva ${score} aciertos`);
                            return playOne();

        } else {
                            log(socket,"INCORRECTO");
                            log(socket,`Fin del juego. Aciertos: ${score}`);
                            biglog(socket,`${score}`,"magenta");
                            rl.prompt();
        }
        })
        })
        }
        models.quiz.findAll({raw: true})
            .then(quizzes => {
            toBePlayed = quizzes;
            })
    .then(() => {
        return playOne();
    })
    .catch(error => {
        errorlog(socket,error.message);
    })
    .then(() => {
        rl.prompt();
    });
};




/**
* Muestra los nombres de los autores de la práctica.
*
* @param rl Objeto readLine usado para implementar el CLI.
*/
exports.creditsCmd = (socket,rl) =>{
log(socket,'Autores de la práctica');
log(socket,'MARTA','green');

rl.prompt();
} ;
/**
* Terminar el programa.
*
* @param rl Objeto readLine usado para implementar el CLI.
*/
exports.quitCmd = rl =>{
rl.close();
socket.end();
};