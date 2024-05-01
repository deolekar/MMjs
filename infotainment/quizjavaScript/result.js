let id = (id) => document.getElementById(id);
let classes = (classes) => document.getElementsByClassName(classes);

window.addEventListener('load', () => {
    let questionAnswersGiven = sessionStorage.getItem("questionanswersGiven");
    id("result").innerHTML = `${questionAnswersGiven} / 10`;
    if (questionAnswersGiven <= 4) {
        id("feedback").innerHTML = "UGH!! Better luck next time";
    } else if (questionAnswersGiven <= 8) {
        id("feedback").innerHTML = "You are almost there try again";
    } else {
        id("feedback").innerHTML = "Congratulations. You made it";

    }
});