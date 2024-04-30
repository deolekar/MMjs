let id = (id) => document.getElementById(id);
let classes = (classes) => document.getElementsByClassName(classes);
let queryselector = (query) => document.querySelector(query);

let questionArray = [];
let questionNumber = 0, quiztimer, questionTimer, qLkp;
let noOfQuestions = 10;
let QCnt = -1;
let questionAnswersGiven = 0;

// for converting b64 to utf8
function b64_to_utf8(str) {
    return decodeURIComponent(escape(window.atob(str)));
}

// to check answer
let checkAnswer = (answerGiven, rightAnswer, options) => {
    //console.log(answerGiven, rightAnswer, options);

    if (answerGiven === rightAnswer) {
        id(answerGiven).style.background = "#228B22";
        id(answerGiven).style.color = "#fff";
        questionAnswersGiven++;
    } else {
        if (answerGiven) {
            id(answerGiven).style.background = "#FA8072";
            id(answerGiven).style.color = "#fff";

        }

        options.map(option => {
            if (option === rightAnswer) {
                try {

                    id(option).style.background = "#32CD32";
                    id(option).style.color = "#fff";
                }
                catch (err) {
                    console.log(err);
                }
            }
        });
    }
}


// redering data of question
let renderQuestion = (questionDetail) => {
    //console.log("questionDetail:", questionDetail)
    id("question").innerHTML = questionDetail.question;
    let radioOption = id("radio-options");
    radioOption.innerHTML = "";

    // rendering radio option
    questionDetail.options.map((option) => {
        let Div = document.createElement("div")
        Div.setAttribute("id", option);
        let RadioButton = document.createElement("input");
        RadioButton.setAttribute("type", "radio");
        RadioButton.setAttribute("name", "answer");
        RadioButton.setAttribute("value", option);
        RadioButton.setAttribute("class", "form-check-input");

        let Label = document.createElement("label");
        Label.innerHTML = option;
        Label.setAttribute("class", "form-check-label");

        Div.appendChild(RadioButton);
        Div.appendChild(Label);

        radioOption.appendChild(Div);

    });

}

// displaying initial data
let displayInitialData = (quizChosen) => {
    id("quiz-title").innerHTML = quizChosen.title;
    let date = new Date(quizChosen.createdAt);
    date = new Date(date.getTime());

    id("quiz-time").innerHTML = `1. Max time to solve quiz is ${quizChosen.totalTime} sec`;
    id("question-time").innerHTML = `2. Max time to solve one question is ${quizChosen.timePerQuestion} sec`;

    classes("container-box")[0].style.display = "flex";

    generate = function (length) {
        var upto = quizChosen.data.length;
        var arr = [];
        var n;
        for (var i = 0; i < length; i++) {
            do
                n = Math.floor(Math.random() * upto + 1);
            while (arr.indexOf(n) !== -1)

            arr[i] = n;
        }

        return arr;
    }



    qArray = generate(noOfQuestions)
    //console.log("qArray", qArray)
    //console.log("qArray[QCnt], QCnt", qArray[QCnt], QCnt)

    let remainingtimeForQuiz = quizChosen.totalTime;

    // timmer for quiz
    let checkTimeForQuiz = () => {
        if (remainingtimeForQuiz === 0) {

            if (questionNumber < quizChosen.data.length) {

                let answerGiven = queryselector("input[name='answer']:checked");
                if (answerGiven) {
                    answerGiven = answerGiven.value;
                }
                qLkp = qArray[QCnt];
                checkAnswer(answerGiven, quizChosen.data[qLkp].answer, quizChosen.data[qLkp].options);

            }

            //console.log(questionAnswersGiven);
            sessionStorage.setItem("questionanswersGiven", questionAnswersGiven);
            window.location = "quizresult.html";
        } else {
            remainingtimeForQuiz--;
            id("quiz-time-left").innerHTML = remainingtimeForQuiz;
            quiztimer = setTimeout(checkTimeForQuiz, 1000);
        }
    }

    let remainingTimeForQuestion = quizChosen.timePerQuestion;

    // timmer for question
    let checkTimeforQuestion = () => {
        if (remainingTimeForQuestion === 0) {
            let answerGiven = queryselector("input[name='answer']:checked");
            if (answerGiven) {
                answerGiven = answerGiven.value;
            }
            if (questionNumber < quizChosen.data.length - 1) {
                remainingTimeForQuestion = quizChosen.timePerQuestion;
            }

            qLkp = qArray[QCnt] - 1;
            checkAnswer(answerGiven, quizChosen.data[qLkp].answer, quizChosen.data[qLkp].options);
            classes("submit")[0].classList.add("disabled");
            classes("next")[0].classList.remove("disabled");
            questionNumber++;

        } else {

            id("questions-done").innerHTML = QCnt + 1;
            id("questions-total").innerHTML = noOfQuestions;
            id("question-time-left").innerHTML = remainingTimeForQuestion;
            remainingTimeForQuestion--;
            id("question-time-left").innerHTML = remainingTimeForQuestion;
            questionTimer = setTimeout(checkTimeforQuestion, 1000);
        }
    }

    classes("start-quiz")[0].addEventListener("click", () => {

        QCnt++;
        qLkp = qArray[QCnt] - 1;
        //console.log("quizChosen.data[qLkp], qLkp: ", quizChosen.data[qLkp], qLkp)
        renderQuestion(quizChosen.data[qLkp]);
        id("rules-box").style.display = "none";
        id("question-box").style.display = "block";

        id("quiz-time-left").innerHTML = remainingtimeForQuiz;
        quiztimer = setTimeout(checkTimeForQuiz, 1000);

        id("question-time-left").innerHTML = remainingTimeForQuestion;
        questionTimer = setTimeout(checkTimeforQuestion, 1000);
    });


    classes("next")[0].addEventListener("click", () => {
        //console.log("questionNumber , noOfQuestions", questionNumber, noOfQuestions)
        if (questionNumber >= noOfQuestions) {
            clearInterval(quiztimer);
            //console.log(questionAnswersGiven);
            sessionStorage.setItem("questionanswersGiven", questionAnswersGiven);
            window.location = "quizresult.html";
        } else if (questionNumber === (noOfQuestions - 1)) {
            classes("next")[0].innerHTML = "Show Result";
            QCnt++;
            qLkp = qArray[QCnt] - 1;
            //console.log("quizChosen.data[qLkp], qLkp: ", quizChosen.data[qLkp], qLkp)
            renderQuestion(quizChosen.data[qLkp]);
            id("question-time-left").innerHTML = remainingTimeForQuestion;
            quiztimer = setTimeout(checkTimeforQuestion, 1000);
            classes("next")[0].classList.add("disabled");
            classes("submit")[0].classList.remove("disabled");

        } else {
            QCnt++;
            qLkp = qArray[QCnt] - 1;
            //console.log("quizChosen.data[qLkp],qLkp: ", quizChosen.data[qLkp], qLkp)
            renderQuestion(quizChosen.data[qLkp]);
            id("question-time-left").innerHTML = remainingTimeForQuestion;
            quiztimer = setTimeout(checkTimeforQuestion, 1000);
            classes("next")[0].classList.add("disabled");
            classes("submit")[0].classList.remove("disabled");

        }
    });

    classes("submit")[0].addEventListener("click", () => {
        let answerGiven = queryselector("input[name='answer']:checked");
        if (answerGiven) {
            answerGiven = answerGiven.value;
        }
        clearInterval(questionTimer);
        remainingTimeForQuestion = quizChosen.timePerQuestion;
        qLkp = qArray[QCnt] - 1;
        checkAnswer(answerGiven, quizChosen.data[qLkp].answer, quizChosen.data[qLkp].options);
        questionNumber++;
        //console.log("questionNumber:", questionNumber)


        classes("submit")[0].classList.add("disabled");
        classes("next")[0].classList.remove("disabled");

    });

}

window.addEventListener('load', () => {
    // reading parameters
    const params = (new URL(document.location)).searchParams;
    const quizChosen = params.get('quiz');
    // eval --> converting string to variable
    displayInitialData(eval(quizChosen));

});