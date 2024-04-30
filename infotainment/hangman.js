var hangManGame = window.hangManGame || {};
totalTurns = '5';
thisTheme = 'Theme'
/*
**
**  Setting up the game keypad
**
*/
hangManGame.gameSetup = (function (window, $, namespace) {

    // methods
    var init,
        _createKeyBoard,
        _createCategory,
        _hookUp,
        // properties        
        keyBoard = '#keypad',
        next = '.next',
        category = '.startWrapper .categories',
        startBtn = '.startWrapper .start',
        resetBtn = '.reset',
        //muteBtn = '.mute';

        _createKeyBoard = function (keyBoard) {
            // Creating the keyboard and pushing them inside 
            var letter,
                letterHtml = '';
            for (var i = 65; i <= 90; i++) {
                letter = String.fromCharCode(i);
                letterHtml += '<span class="letter" data-letter="' + letter + '">' + letter + '</span>';
            }
            $(keyBoard).html(letterHtml);
        };
    _createCategory = function () {
        // Creating the keyboard and pushing them inside 
        var themes = hangManGame.gameConfig.wordListType;
        var select = '<select size="' + themes.length + '" class="category"><option selected>' + "🔻 " + themes[0] + '</option>';
        for (var i = 1; i < themes.length; i++) {
            select += '<option>' + "🔻 " + themes[i] + '</option>';
        }
        select += '</section>';
        $(category).append(select);
    };

    _hookUp = function () {
        $(startBtn).on('click', function () {
            $(this).parent().hide();
            hangManGame.theGame.init();
        });
        $(next).on('click', function () {
            hangManGame.theGame.init();
        });
        $(resetBtn).on('click', function () {
            location.reload();
        });

        $(keyBoard).children().on('click', function () {
            if ($('body').hasClass('inProgress')) {
                $(this).addClass('disabled');
                var letter = $(this).data('letter');
                hangManGame.theGame.clicked(letter);
            }
        });
    };

    init = function () {
        _createKeyBoard(keyBoard);
        _createCategory();
        _hookUp();
    };

    return {
        init: init
    };
}(this, jQuery, 'hangManGame'));

/*
**
**  Game events are controlled here
**  setting up answer space, click event over letter 
*/
hangManGame.theGame = (function (window, $, namespace) {

    // methods
    var init,
        _setupSingleGame,
        _clicked,
        _isPresent,
        // Properties
        letterCounter,
        spaceCounter,
        wordNow,
        wrongPress = 0,
        hangManGraphic = '#hangMan .hangman',
        wonCount = '#scoreBoard .wonCount',
        lostCount = '#scoreBoard .lostCount',
        keyBoard = '#keypad',
        hangMan = '#hangMan'
    theme = '#hangMan .theme',
        maxTry = '#hangMan .maxTry',
        remaining = '#hangMan .remaining',
        answerSpace = '#answerSpace',
        overlay = '.overLay',
        youWon = '.overLay .youWon',
        youLost = '.overLay .youLost',
        result = '.overLay .result',
        answerWord = '.result .word',
        gSearch = '.result .gsearch',
        wait = 'Please wait';

    // This is to be called every time when a new game starts. do all setup for single game
    _setupSingleGame = function () {
        var isSpace,
            answerSpaceChild = $(answerSpace).children();


        $(hangManGraphic).attr('class', 'hangman'); // Removing the hanged part
        wordNow = hangManGame.gameConfig.returnWord().toUpperCase(); // We get the random word here
        len = wordNow.length,
            letterCounter = 0,
            rightGuessCounter = 0,
            spaceCounter = 0;
        remainingTurns = totalTurns,
            answerHtml = '';
        $(keyBoard).children().removeClass('disabled');
        wrongPress = 0;

        $(overlay).fadeOut(function () {
            $(result).removeClass('flipped').show();
        });
        $(maxTry).html(remainingTurns),
            $(theme).html(thisTheme),
            $(remaining).html(remainingTurns);

        answerSpaceChild.html(wait);
        for (var i = 0; i < len; i++) {
            if (wordNow[i] == ' ') {
                isSpace = 'space';
                spaceCounter++;
            }
            else {
                isSpace = '';
            }
            answerHtml += '<span class="letter ' + isSpace + '">&nbsp;</span>';
        }
        answerSpaceChild.html(answerHtml);
        $(hangMan).show();
        $(keyBoard).show();
        $(answerSpace).width('95%');
        setTimeout(function () {
            $(answerSpace).width(answerSpaceChild.width());
            $(answerSpace).css('visibility', 'visible');
        }, 100);

        letterCounter = 0; // Reset the letter counter, when a game begins
        rightGuessCounter = spaceCounter;
    };

    //When a letter in keypad is clicked
    _clicked = function (letter) {
        var isPresent,
            _isPresent,
            flag = 0;

        letterCounter++;
        for (var i = 0; i < wordNow.length; i++) {
            if (letter == wordNow[i]) {
                flag++; //Match found increment counter
                rightGuessCounter++;
                $('#answerSpace span span:nth-child(' + (i + 1) + ')').html(letter);
            }
        }
        if (flag == 0) { // Wrong match 
            remainingTurns--;
            $('.remaining').html(remainingTurns);
            _hangMan();
        }
        // Guessed all the words  ##### WIN ############
        if (rightGuessCounter >= wordNow.length) {
            $('body').removeClass('inProgress');
            var wonCounter = Number($(wonCount).html());
            wonCounter++;
            $(wonCount).html(wonCounter);  // +1 and show the won counter
            $(answerWord).html(wordNow);   // show the word
            $(gSearch).attr('href', $(gSearch).data('href') + wordNow); // attach google search
            $(overlay).fadeIn(function () {
                $(youLost).hide();
                $(youWon).addClass('flipped');
            });
        }


    };

    _hangMan = function () {
        wrongPress++;
        $(hangManGraphic).addClass('hang' + wrongPress);
        if (remainingTurns <= 0) { // ############ LOST #######
            $('body').removeClass('inProgress');
            var lostCounter = Number($(lostCount).html());
            lostCounter++;
            $(lostCount).html(lostCounter);
            $(answerWord).html(wordNow);
            $(gSearch).attr('href', $(gSearch).data('href') + wordNow); // attach google search
            setTimeout(function () {
                $(overlay).fadeIn(function () {
                    $(youWon).hide();
                    $(youLost).addClass('flipped');
                });
            }, 500);
        }
    };


    init = function () {
        hangManGame.gameConfig.setCurrentTheme($('.category option:selected').index());
        _setupSingleGame();
        $('body').addClass('inProgress');
    };

    return {
        init: init,
        clicked: _clicked
    };
}(this, jQuery, 'hangManGame'));



/*
**
**  Word list and player profiles are maintained here
**  
*/
hangManGame.gameConfig = (function (window, $, namespace) {

    // methods
    var init,
        setUpTheme,
        returnWord,
        self = this,
        isMute = false,
        currentTheme = 1,
        // declare the word list types here
        wordListType = ['Fort (Killa)', 'River of Maharashtra', 'Marathi Movie', 'Famous Personality'],
        // add the word list here      
        wordList = ["Sinhagad Fort, Rajgad Fort, Shivneri Fort, Tung Fort, Raigad Fort, Pratapgad Fort, Malhargad Fort, Shaniwarwada Fort, Yashwantgad Fort, Purandar Fort, Sindhudurg Fort, Korigad Fort, Lohagad Fort, Ghangad Fort, Tikona Fort, Torna Fort",
            "Bhima River, Bindusara River, Dahisar River, Gad River, Girna River, Godavari River, Indravati River, Koyna River, Krishna River, Kundalika River, Mithi River, Mahim River, Mula River, Mutha River, Oshiwara River, Painganga River, Panzara River, Patalganga River, Pavna River, Poisar River, Pranahita River, Purna River, Savitri River, Shastri River, Surya River, Tansa River,  Tapti River, Ulhas River, Vaan River, Vaitarna River, Vashishti River, Wainganga River, Wardha River",
            "The Disciple, Mulshi Pattern, Mhorkya, Nude, Muramba, Ventilator, Sairat, Natsamrat, Khwada, Double Seat, Coffee Ani Barach Kahi, Astu, Dr Prakash Baba Amte, Court, Killa, Elizabeth Ekadashi, Ek Hazarachi Note, Dhag, Fandry, Premachi Goshta, Pune 52, Narbachi Wadi, Anumati, Rege, Balak Palak, Kaksparsh, Baboo Band Baaja, Deool, Taryanche Bait, Shala, Natarang, Jogwa, Gandha, Gabhricha Paus, Harishchandrachi Factory, Valu, Tingya, Dombivali fast, Saatchya Aat Gharat, Shwas (The Breath), Dahavi Fa, Vaastupurush",
            "sachin tendulkar, sunil gavaskar, lata mangeshkar, asha bhosale, nana patekar, jayant narlikar, anna hazare, khashaba jadhav, Vinayak Damodar Savarkar, Baba Amte, Dadasaheb phalkhe, Dada Kondke, Savitribai Phule, P L Deshpande, Ahilyabai Holkar, Ramabai Ranade"]

    returnWord = function () {
        splitArray = wordList[currentTheme].split(',');
        return splitArray[Math.floor(Math.random() * splitArray.length)];
    };

    setCurrentTheme = function (theme) {
        currentTheme = theme;
        thisTheme = wordListType[currentTheme];
    };

    toggleMute = function () {
        isMute = (isMute ? false : true);
    };

    init = function () {
        returnWord();
    };


    return {
        init: init,
        returnWord: returnWord,
        wordListType: wordListType,
        setCurrentTheme: setCurrentTheme,
        toggleMute: toggleMute
    };
}(this, jQuery, 'hangManGame'));

$(document).ready(function () {
    $(hangManGame.gameConfig.init());
    $(hangManGame.gameSetup.init());
});
