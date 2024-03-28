var hangManGame = window.hangManGame || {};
totalTurns = '5';
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
        var select = '<select size="' + themes.length + '" class="category"><option selected>' + themes[0] + '</option>';
        for (var i = 1; i < themes.length; i++) {
            select += '<option>' + themes[i] + '</option>';
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
        /* $(muteBtn).on('click', function () {
             $(this).toggleClass('active');
             hangManGame.gameConfig.toggleMute();
         });*/

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

        // hangManGame.gameConfig.playSound('keyPress');
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
            //hangManGame.gameConfig.playSound('winMusic');
            $(overlay).fadeIn(function () {
                $(youLost).hide();
                $(youWon).addClass('flipped');
            });
        }


    };

    _hangMan = function () {
        wrongPress++;
        $(hangManGraphic).addClass('hang' + wrongPress);
        if (remainingTurns <= 0) {
            console.log('Game Over'); // ############ LOST #######
            $('body').removeClass('inProgress');
            var lostCounter = Number($(lostCount).html());
            lostCounter++;
            $(lostCount).html(lostCounter);
            $(answerWord).html(wordNow);
            $(gSearch).attr('href', $(gSearch).data('href') + wordNow); // attach google search
            //hangManGame.gameConfig.playSound('wrongMusic');
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
            "China,India,United States,Indonesia,Brazil,Pakistan,Nigeria,Bangladesh,Russia,Japan,Mexico,Philippines,Vietnam,Ethiopia,Egypt,Germany,Iran,Turkey,Democratic Republic of the Congo,France,Thailand,United Kingdom,Italy,South Africa,Burma,South Korea,Colombia,Tanzania,Kenya,Spain,Argentina,Ukraine,Algeria,Poland,Sudan,Iraq,Canada,Uganda,Morocco,Saudi Arabia,Peru,Venezuela,Malaysia,Uzbekistan,Nepal,Ghana,Afghanistan,Yemen,Mozambique,North Korea,Angola,Australia,Taiwan,Syria,Ivory Coast,Madagascar,Cameroon,Sri Lanka,Romania,Niger,Burkina Faso,Chile,Kazakhstan,Netherlands,Malawi,Mali,Ecuador,Guatemala,Zambia,Cambodia,Chad,Senegal,Zimbabwe,South Sudan,Bolivia,Belgium,Cuba,Somalia,Rwanda,Greece,Tunisia,Haiti,Guinea,Czech Republic,Portugal,Dominican Republic,Benin,Hungary,Burundi,Sweden,Azerbaijan,United Arab Emirates,Belarus,Honduras,Austria,Tajikistan,Israel,Switzerland,Papua New Guinea,Hong Kong,China,Bulgaria,Togo,Serbia,Paraguay,Laos,Eritrea,Jordan,El Salvador,Sierra Leone,Libya,Nicaragua,Kyrgyzstan,Denmark,Finland,Singapore,Slovakia,Norway,Central African Republic,Costa Rica,Turkmenistan,Republic of the Congo,Ireland,New Zealand,Palestine,Liberia,Georgia,Croatia,Oman,Lebanon,Bosnia and Herzegovina,Panama,Mauritania,Moldova,Puerto Rico,Uruguay,Kuwait,Armenia,Mongolia,Lithuania,Albania,Jamaica,Qatar,Lesotho,Namibia,Macedonia,Slovenia,Botswana,Latvia,The Gambia,Kosovo,Gabon,Equatorial Guinea,Trinidad and Tobago,Bahrain,Estonia,Mauritius,East Timor,Swaziland,Djibouti,Fiji,Cyprus,France,Comoros,Bhutan,Guyana,Macau,China,Montenegro,Western Sahara,Solomon Islands,Luxembourg,Suriname,Cape Verde,Transnistria,Malta,Guadeloupe,France,Brunei,Martinique,France,The Bahamas,Belize,Maldives,Iceland,Northern Cyprus,Barbados,New Caledonia,France,French Polynesia,France,Vanuatu,Abkhazia,French Guiana,France,Mayotte,France,Samoa,Saint Lucia,Guam,Netherlands,Saint Vincent and the Grenadines,Aruba,Netherlands,Kiribati,United States Virgin Islands,Grenada,Tonga,Federated States of Micronesia,Jersey,UK,Seychelles,Antigua and Barbuda,Isle of Man,UK,Andorra,Dominica,Bermuda,UK,Guernsey,UK,Marshall Islands,Greenland,Denmark,Cayman Islands,UK,American Samoa,Saint Kitts and Nevis,Northern Mariana Islands,South Ossetia,Faroe Islands,Denmark,Sint Maarten,Netherlands,Liechtenstein,Monaco,Collectivity of Saint Martin,France,San Marino,Turks and Caicos Islands,UK,Gibraltar,UK,Finland,British Virgin Islands,UK,Caribbean Netherlands,Netherlands,Palau,Cook Islands,New Zealand,Anguilla,UK,Wallis and Futuna,France,Tuvalu,Nauru,France,Saint Pierre and Miquelon,France,Montserrat,UK,Saint Helena, Ascension and Tristan da Cunha,UK,Falkland Islands,UK,Svalbard and Jan Mayen,Norway,Norfolk Island,Australia,Christmas Island,Australia,Niue,New Zealand,Tokelau,NZ,Vatican City,Australia,Pitcairn Islands,UK",
            "Abhimanyu ,Adhiratha ,Amba,Ambalika,Ambika,Arjuna,Ashwatthama,Bharata,Bhima,Bhisma,Devaki,Dhristadhyumna,Dhritarastra,Drona,Drupada,Durvasa ,Draupadi,Duryodhana ,Dushasana,Dushala,Gandhari,Ghatotkatcha,Jayadratha ,Kamsa or Kansa ,Karna ,Kripacharya ,Kripa and Kripi,Krishna,Kunti,Kuru,Madri,Nakula,Pandu,Parasara,Parashurama,Parikshit,Sahadeva,,Satyavati,Sanjaya,Shakuni,Shantanu or Santanu,Sishupala ,Subhadra ,Uttara,Vasudeva ,Vidura,Virata ,Vyasa ,Yudhisthira",
            "Eddard Stark,Catelyn Stark,Robb Stark,Sansa Stark,Arya Stark,Bran Stark,Rickon Stark,Jon Snow,Benjen Stark,Lyanna Stark,Brandon Stark,Rickard Stark,Hoster Tully,Minisa Tully,Catelyn Stark,Lysa Arryn,Jon Arryn,Edmure Tully,Brynden Tully,Tytos Lannister,Joanna Lannister,Tywin Lannister,Kevan Lannister,Dorna Lannister,Cersei Baratheon,Jaime Lannister,Tyrion Lannister,Lancel Lannister,Alton Lannister,Robert Baratheon,Cersei Baratheon,Joffrey Baratheon,Myrcella Baratheon,Tommen Baratheon,Stannis Baratheon,Renly Baratheon,Gendry,Barra,Edric Storm,Aegon,Aerys Targaryen,Queen Rhaella,Rhaegar Targaryen,Rhaenys Targaryen,Aegon Targaryen,Daenerys Targaryen,Viserys Targaryen,Maester Aemon,Drogon,Rhaegal,Viserion,Alannys Greyjoy,Balon Greyjoy,Euron Greyjoy,Aeron Greyjoy,Victarion Greyjoy,Rodrik Greyjoy,Maron Greyjoy,Yara Greyjoy,Theon Greyjoy,Mace Tyrell,Margaery Tyrell,Loras Tyrell,Olenna Tyrell,Jon Arryn,Lysa Arryn,Robin Arryn,Doran Nymeros Martell,Roose Bolton,Ramsay Snow,Walder Frey,Joyeuse Erenford,Jorah Mormont,Khal Drogo,Illyrio Mopatis,Xaro Xhoan Daxos,Pyat Pree,Quaithe,Doreah,Irri,Rakharo,Kovarro,Mirri Maz Duur,Mance Ryder,Ygritte,Rattleshirt,Craster,Gilly,Beric Dondarrion,Thoros of Myr,Anguy,Petyr Baelish,Varys,Grand Maester Pycelle,Bronn,Ser Barristan Selmy,Sandor Clegane,Syrio Forel,Ilyn Payne,Podrick Payne,Ser Meryn Trant,Janos Slynt,Ser Dontos the fool,Shae,Ros,Waymar Royce,Will,Gared,Samwell Tarly,Jeor Mormont,Dolorous Edd,Jon Snow,Maester Aemon,Yoren,Alliser Thorne,Benjen Stark,Grenn,Pyp,Rast,Loras Tyrell,Margaery Tyrell,Brienne of Tarth,Stannis Baratheon,Ser Davos Seaworth,Lady Melisandre,Selyse Baratheon,Shireen Baratheon,Salladhor Saan,Maester Cressen,Maester Luwin,Hodor,Osha,Ser Rodrik Cassel,Mikken,Jory Cassel,Walder Frey,Gregor Clegane,Roose Bolton,Gendry,Hot Pie,Lommy Greenhands,Waymar Royce,Daario Naharis,Jon Connington"]

    /*sound = {};
    // Add sound list here
    sound.keyPress = new Audio('http://www.javascriptkit.com/script/script2/click.mp3'),
        sound.winMusic = new Audio('http://www.freesound.org/data/previews/35/35964_78779-lq.mp3'),
        sound.wrongMusic = new Audio('http://www.freesound.org/data/previews/266/266163_4284968-lq.mp3');

*/

    returnWord = function () {
        //console.log(wordList);
        splitArray = wordList[currentTheme].split(',');
        return splitArray[Math.floor(Math.random() * splitArray.length)];
    };

    setCurrentTheme = function (theme) {
        currentTheme = theme;
    };

    playSound = function (music) {
        if (!isMute) {
            sound[music].play();
        }
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
        //playSound: playSound,
        wordListType: wordListType,
        setCurrentTheme: setCurrentTheme,
        toggleMute: toggleMute
    };
}(this, jQuery, 'hangManGame'));

$(document).ready(function () {
    $(hangManGame.gameConfig.init());
    $(hangManGame.gameSetup.init());
});
