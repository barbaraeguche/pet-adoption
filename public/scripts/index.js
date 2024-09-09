
function localTime() {
    function formatTime(time) {
        return (time < 10)? `0${time}` : time;
    }

    const now = new Date();
    const date = `${now.toDateString().substring(0, 3)}, ${now.toDateString().substring(4)}`;
    const time = `${formatTime(now.getHours())}:${formatTime(now.getMinutes())}:${formatTime(now.getSeconds())}`;

    document.getElementById('local-time').innerHTML = `${date}, ${time}`;
    setTimeout(localTime, 1000);
}
function redirectCountdown() {
    let seconds = 5;
    setInterval(() => {
        document.getElementById('countdown').innerHTML = String(seconds--);
        (seconds === 0) ? window.location.href = '/home' : null;
    }, 1000);
}

function validateFindPet(event) {
    event.preventDefault(); //prevent default form submission behavior

    const input = document.querySelector('input[name="breed"]')
    const radioBtn = document.querySelectorAll('input[type="radio"]:checked');
    const checkBox = document.querySelectorAll('input[name="symbiosis"]:checked');

    //check if all radio buttons are filled out
    if(radioBtn.length !== 3) {
        alert('Please select all radio buttons.');
        return;
    }
    //check if all checkboxes are filled out
    if(checkBox.length < 1) {
        alert('Please select checkbox fields.');
        return;
    }
    //check if the text field is filled out
    if(!input.value.trim()) {
        return;
    }

    //if validation passes, allow form submission
    document.getElementById('petForm').submit();
}

function validateRehomePet(event) {
    const petImage = document.querySelector('input[type="file"]');
    const textInputs = ['name', 'breed', 'text', 'own-fname', 'own-lname', 'own-email'];
    const radioBtn = document.querySelectorAll('input[type="radio"]:checked');
    const checkBox = document.querySelectorAll('input[name="symbiosis"]:checked')

    //check if all radio buttons are filled out
    if(radioBtn.length !== 3) {
        alert('Please select all radio buttons.');
        return;
    }
    //check if all checkboxes are filled out
    if(checkBox.length < 1) {
        alert('Please select checkbox fields.');
        return;
    }
    //check if image has been uploaded
    if(petImage.files.length === 0) {
        alert("Please upload an image of your pet.");
        return;
    }
    //check if all text fields are filled out
    for(let i = 0; i < textInputs.length; i++) {
        const input = document.getElementById(textInputs[i]).value.trim();
        const regex = new RegExp(input.getAttribute('pattern')); //create a regular expression from the pattern attribute

        if(!(input && regex.test(input))) {
            event.preventDefault(); //prevent default form submission behavior
            return;
        }
    }

    //if validation passes, allow form submission
    document.getElementById('petForm').submit();
}

function giveCredit() {
    alert("All images were sourced from Pinterest and the logo was obtained from a website. \n\nIf you are the creator or owner of any image used on this website and wish to be credited or have it removed, please contact us. \n\nThank you!");
}
function privacyPolicy() {
    alert("We are committed to protecting your privacy and ensuring the security of your personal information. We promise that we will not sell or misuse any information you provide to us. \n\nWhile we strive to provide accurate and reliable information, please note that any content posted by pet owners or users may not always reflect accurate details. Therefore, we cannot be held responsible for any inaccuracies or misinformation. \n\nThank you!");
}