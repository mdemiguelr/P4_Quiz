const  {log, biglog, errorlog, colorize} = require("./out");
const model = require('./model');
/**
* Muestra la ayuda.
*
* @param rl Objeto readLine usado para implementar el CLI.
*/
exports.helpCmd = rl => {
log("Comandos:");
log(" h|help - Muestra esta ayuda.");
log(" list - Listar los quizzes existentes. ");
log(" show <id> -Muestra la pregunta y la respuesta del quiz indicado.");
log("add - Añadir un nuevo quiz interactivamente.");
log(" delete <id> - Borrar el quiz indicado.");
log(" edit <id> - Editar el quiz indicado.");
log(" test <id> - Probar el quiz indicado.");
log(" p|play - Jugar a prehuntar aleatoriamente todos los quizzes.");
log(" credits -Créditos.");
log(" q|quit -Salir del programa.");
rl.prompt();
};

/**
* Lista todos los quizzes existentes en el modelo.
*
* @param rl Objeto readLine usado para implementar el CLI.
*/
exports.listCmd = rl =>{
model.getAll().forEach((quiz,id) => {
    log(`[${colorize(id,'magenta')}]: ${quiz.question}`);
});


rl.prompt();

} ;

/**
* Muestra el quiz indicado en el parámetro: la pregunta y la respuesta.
*
* @param rl Objeto readLine usado para implementar el CLI.
* @param id Clave del quiz a mostrar.
*/
exports.showCmd = (rl,id) =>{
if (typeof id === "undefined") {
    errorlog (`Falta el parametro id`);
} else {
    try {
        const quiz = model.getByIndex(id);
        log (` [${colorize(id, 'magenta')}]: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
    } catch (error) {
        errorlog(error.message);
    }
}

rl.prompt();
} ;


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
exports.addCmd = rl => {
    rl.question(colorize('Introduzca una pregunta: ', 'red'), question => {
        rl.question(colorize('Introduzca una respuesta ', 'red'), answer => {
        model.add(question,answer);
        log (` ${colorize('se ha añadido', 'magenta')}: ${question} ${colorize('=>', 'magenta')} ${answer}`);
        rl.prompt();
        });
    });
};

/**
* Borra un quiz del modelo.
*
* @param rl Objeto readLine usado para implementar el CLI.
* @param id Clave del quiz a borrar en el modelo.
*/
exports.deleteCmd = (rl,id) =>{
    if (typeof id === "undefined") {
        errorlog (`Falta el parametro id.`);
    } else {
        try {
            model.deleteByIndex(id);
        } catch (error) {
            errorlog(error.message);
        }
    }
    rl.prompt();
} ;
/**
* Edita un quiz del modelo.
*
* @param rl Objeto readLine usado para implementar el CLI.
* @param id Clave del quiz a editar en el modelo.
*/
exports.editCmd = (rl,id) =>{
    if (typeof id === "undefined") {
        errorlog (`Falta el parametro id`);
        rl.prompt();
    } else {
        try {
            const quiz = model.getByIndex(id);
            process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)}, 0);

            rl.question(colorize('Introduzca una pregunta: ', 'red'), question => {

                process.stdout.isTTY && setTimeout(() =>{rl.write(quiz.answer)}, 0);

            rl.question(colorize('Introduzca una respuesta ', 'red'), answer => {
                model.update(id, question, answer);
            log(` Se ha cambiado el quiz ${colorize(id, 'magenta')}: por ${question} ${colorize('=>', 'magenta')} ${answer}`);
            rl.prompt();
                });
        });
        } catch (error) {
            errorlog(error.message);
            rl.prompt();
        }
    }
};
/**
* Prueba un quiz, es decir, hace una pregunta del modelo a la que debemos contestar.
*
 * Hay que recordar que el funcionamiento de la función rl.question es asíncrono
 *
* @param rl Objeto readLine usado para implementar el CLI.
* @param id Clave del quiz a probar.
*/
exports.testCmd = (rl,id) =>
{
    if (typeof id === "undefined") {
        errorlog(`Falta el parametro id`);
        rl.prompt();
    } else {
        try {
            const quiz = model.getByIndex(id);

            rl.question(colorize(quiz.question, 'red'), resp => {

                if(resp.toLowerCase().trim() == quiz.answer.toLowerCase().trim()
        )
            {
                log('Su respuesta es :');
                log('Correcto', 'green');
                rl.prompt();

            }
        else
            {
                log('Su respuesta es :');
                log('Incorrecto', 'red');
                    rl.prompt();
                }
            })
    }
        catch (error) {
            errorlog(error.message);
            rl.prompt();
        }
    }
};

/**
* Pregunta todos los quizzes existenres en el modelo en orden aleatorio.
* Se gana si se contesta a todos satisfactoriamente.
*
* @param rl Objeto readLine usado para implementar el CLI.
*/
exports.playCmd = rl => {

    let score =0;
    let toBeResolved = []; //guardar id de todas las preguntas que existen
    for(let j =0;j<model.count();j++){
        toBeResolved[j]=model.getByIndex(j);
    }
    const playOne = () => {

        if (toBeResolved.length === 0) {
            log('FIN DEL JUEGO', 'blue');
            log('Aciertos: ');
            biglog(score, 'magenta');
            score=0;
            rl.prompt();

        } else {

            let idRandom = Math.random()*(toBeResolved.length-1);
            let id = Math.round(idRandom);
            //let quiz = model.getByIndex(id);
            rl.question(colorize(toBeResolved[id].question +"?",'red'), answer => {

                if(toBeResolved[id].answer.toLowerCase().trim() === answer.toLowerCase().trim()){

                log('CORRECTO - Lleva ' + (score+1) + ' aciertos.');
                score++;
                toBeResolved.splice(id,1);
                playOne();

            } else {

                log('INCORRECTO .');
                log('Fin del juego. Aciertos:' + score);
                biglog(score, 'magenta');
                score=0;
                rl.prompt();
            }
        });
        }
    };
    playOne();
};


/**
* Muestra los nombres de los autores de la práctica.
*
* @param rl Objeto readLine usado para implementar el CLI.
*/
exports.creditsCmd = rl =>{
log('Autores de la práctica');
log('MARTA','green');

rl.prompt();
} ;
/**
* Terminar el programa.
*
* @param rl Objeto readLine usado para implementar el CLI.
*/
exports.quitCmd = rl =>{
rl.close();
} ;










