const Sequelize = require('sequelize');

const sequelize = new Sequelize("sqlite:quizzes.sqlite", {logging: false}); //acceder a Base de Datos

sequelize.define('quiz',{ //defino un tipo de dato (quiz)
    question:{
        type: Sequelize.STRING,
        unique: {msg: "Ya existe esta pregunta"},
        validate: {notEmpty : {msg :"La pregunta no puede estar vacía"}}

    },
    answer: {
        type: Sequelize.STRING,
        validate: {notEmpty: {msg: "La respuesta no puede estar vacía"}}
    }
});

sequelize.sync() //La sincronizacion es una promesa
.then(()=> sequelize.models.quiz.count()) //accedo al modelo Quiz y cuento cuantos hay
.then(count => {
    if(!count) { //si es 0 creo varios quizzes
        return sequelize.models.quiz.bulkCreate([ //para que la promesa del then espere a que esta promesa termine
            {question: "Capital de Italia", answer: "Roma"},
            {question: "Capital de Francia", answer: "París"},
            {question: "Capital de España", answer: "Madrid"},
            {question: "Capital de Portugal", answer: "Lisboa"}
        ]);
    }
})
.catch(error => {
    console.log(error);
});

module.exports =sequelize;