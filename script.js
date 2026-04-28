// ========== DARK MODE ==========
const darkToggle = document.getElementById('darkModeToggle');
const modeTextSpan = document.getElementById('modeText');

function initDarkMode() {
    const savedTheme = localStorage.getItem('bcDictTheme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark');
        modeTextSpan.innerText = 'Mod luminos';
    } else {
        document.body.classList.remove('dark');
        modeTextSpan.innerText = 'Mod întunecat';
    }
}

initDarkMode();

darkToggle.addEventListener('click', () => {
    if (document.body.classList.contains('dark')) {
        document.body.classList.remove('dark');
        localStorage.setItem('bcDictTheme', 'light');
        modeTextSpan.innerText = 'Mod întunecat';
    } else {
        document.body.classList.add('dark');
        localStorage.setItem('bcDictTheme', 'dark');
        modeTextSpan.innerText = 'Mod luminos';
    }
});

console.log("✅ Pull Request #1: Header + Dark Mode funcțional");
// ========== ELEMENTE SEARCH ==========
const searchBtn = document.getElementById('searchBtn');
const randomBtn = document.getElementById('randomBtn');
const wordInput = document.getElementById('wordInput');
const resultContainer = document.getElementById('resultContainer');

// ========== EVENIMENTE ==========
searchBtn.addEventListener('click', searchWord);
randomBtn?.addEventListener('click', searchRandomWord);
wordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        searchWord();
    }
});

console.log("✅ Pull Request #2: Bara de căutare funcțională");

// ========== API DEFINITII ==========
async function fetchDefinitions(word) {
    const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            if (response.status === 404) return null;
            throw new Error(`HTTP ${response.status}`);
        }
        const data = await response.json();
        if (!data || !data.length) return null;
        return data[0];
    } catch (err) {
        console.warn("Eroare API definiții:", err);
        return null;
    }
}

// ========== FUNCȚII AJUTĂTOARE ==========
function showLoading() {
    resultContainer.innerHTML = `<div class="results-card"><div class="loader"><div class="spinner"></div><span>Se încarcă definițiile...</span></div></div>`;
}

function showError(message) {
    resultContainer.innerHTML = `<div class="results-card"><div class="error-message">⚠️ ${message}</div></div>`;
}

// ========== API TRADUCERE ==========
async function fetchTranslation(word) {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=ro|en`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        const translatedText = data.responseData?.translatedText;
        if (translatedText && translatedText.toLowerCase() !== word.toLowerCase()) {
            return translatedText;
        }
        return word;
    } catch (err) {
        console.warn("Eroare API traducere:", err);
        return word;
    }
}

async function translateTextToRomanian(text) {
    if (!text || text.trim() === '') return text;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|ro`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        return data.responseData?.translatedText || text;
    } catch (err) {
        console.warn("Eroare la traducerea textului în română:", err);
        return text;
    }
}

async function translateListToRomanian(words) {
    return await Promise.all(words.map(async (word) => {
        return await translateTextToRomanian(word);
    }));
}

async function fetchSynonymsAntonyms(word) {
    const synonymsUrl = `https://api.datamuse.com/words?rel_syn=${encodeURIComponent(word)}&max=12`;
    const antonymsUrl = `https://api.datamuse.com/words?rel_ant=${encodeURIComponent(word)}&max=12`;
    try {
        const [synRes, antRes] = await Promise.all([
            fetch(synonymsUrl),
            fetch(antonymsUrl)
        ]);
        if (!synRes.ok || !antRes.ok) throw new Error("Eroare thesaurus");
        const synonymsData = await synRes.json();
        const antonymsData = await antRes.json();
        const synonyms = synonymsData.map(item => item.word);
        const antonyms = antonymsData.map(item => item.word);
        return { synonyms, antonyms };
    } catch (err) {
        console.warn("Eroare Datamuse:", err);
        return { synonyms: [], antonyms: [] };
    }
}

function renderDefinitions(word, definitionData, translation, romanianMeanings = []) {
    if (!definitionData) {
        return `<div class="info-text">⚠️ Nu am găsit definiții pentru "${word}".</div>`;
    }
    
    const phonetic = definitionData.phonetic || definitionData.phonetics?.find(p => p.text)?.text || '';
    
    let definitionsHtml = '';
    if (phonetic) {
        definitionsHtml += `<div class="phonetic">/${phonetic}/</div>`;
    }
    
    if (romanianMeanings.length === 0) {
        romanianMeanings = (definitionData.meanings || []).map(meaning => {
            return {
                partOfSpeech: meaning.partOfSpeech || 'cuvânt',
                definitions: (meaning.definitions || []).slice(0, 3).map(def => ({
                    definition: def.definition || '',
                    example: def.example || ''
                }))
            };
        });
    }
    
    for (const meaning of romanianMeanings) {
        const partOfSpeech = meaning.partOfSpeech || 'cuvânt';
        let defListHtml = '';
        for (let def of meaning.definitions.slice(0, 3)) {
            const definitionText = def.definition || '';
            const exampleText = def.example ? `<span class="example">💬 "${def.example}"</span>` : '';
            defListHtml += `<li>${definitionText} ${exampleText}</li>`;
        }
        definitionsHtml += `
            <div class="meaning-block">
                <div class="part-of-speech">📌 ${partOfSpeech}</div>
                <ul class="definitions-list">${defListHtml}</ul>
            </div>
        `;
    }
    
    const translationHtml = translation && translation !== word ? `<div class="translation">🇺🇸 Traducere în engleză: <strong>${translation}</strong></div>` : '';
    
    return `
        <div class="word-header">
            <div class="word-title">${word}</div>
            ${translationHtml}
        </div>
        ${definitionsHtml}
    `;
}

// ========== AFIȘARE SINONIME/ANTONIME ==========
function renderSynonymsAntonyms(synonyms, antonyms) {
    const synonymsHtml = synonyms.length > 0 
        ? synonyms.map(syn => `<span class="word-tag syn-tag">${syn}</span>`).join('')
        : '<span style="opacity:0.6;">Nu există sinonime</span>';
    
    const antonymsHtml = antonyms.length > 0 
        ? antonyms.map(ant => `<span class="word-tag ant-tag">${ant}</span>`).join('')
        : '<span style="opacity:0.6;">Nu există antonime</span>';

    return `
        <div class="syn-ant-section">
            <div class="synonyms-box">
                <div class="badge-title">🔄 SINONIME</div>
                <div>${synonymsHtml}</div>
            </div>
            <div class="antonyms-box">
                <div class="badge-title">⚡ ANTONIME</div>
                <div>${antonymsHtml}</div>
            </div>
        </div>
    `;
}

async function translateDefinitions(definitionData) {
    const translatedMeanings = [];
    for (const meaning of definitionData.meanings || []) {
        const translatedDefs = [];
        for (const def of (meaning.definitions || []).slice(0, 3)) {
            const definitionText = def.definition || '';
            const exampleText = def.example || '';
            const [translatedDefinition, translatedExample] = await Promise.all([
                translateTextToRomanian(definitionText),
                exampleText ? translateTextToRomanian(exampleText) : Promise.resolve('')
            ]);
            translatedDefs.push({ definition: translatedDefinition, example: translatedExample });
        }
        translatedMeanings.push({
            partOfSpeech: meaning.partOfSpeech || 'cuvânt',
            definitions: translatedDefs
        });
    }
    return translatedMeanings;
}

// ========== FUNCȚIE CAUTARE ACTUALIZATĂ ==========
async function searchWord() {
    let word = wordInput.value.trim();
    if (word === "") {
        showError("Te rog să introduci un cuvânt.");
        return;
    }
    
    showLoading();
    
    try {
        const translatedWord = await fetchTranslation(word);
        console.log(`Traducere: "${word}" -> "${translatedWord}"`);
        
        const [definitionResult, thesaurusResult] = await Promise.all([
            fetchDefinitions(translatedWord.toLowerCase()),
            fetchSynonymsAntonyms(translatedWord.toLowerCase())
        ]);
        
        if (!definitionResult) {
            resultContainer.innerHTML = `<div class="results-card"><div class="error-message">🔍 Nu am găsit definiții pentru "${word}".</div></div>`;
            return;
        }
        
        const translatedMeanings = await translateDefinitions(definitionResult);
        const translatedSynonyms = await translateListToRomanian(thesaurusResult.synonyms);
        const translatedAntonyms = await translateListToRomanian(thesaurusResult.antonyms);
        
        const definitionsHtml = renderDefinitions(word, definitionResult, translatedWord, translatedMeanings);
        const synonymsAntonymsHtml = renderSynonymsAntonyms(translatedSynonyms, translatedAntonyms);
        const copyButtonHtml = `<button class="copy-btn" type="button">📋 Copiază rezultatul</button>`;
        
        resultContainer.innerHTML = `<div class="results-card">${copyButtonHtml}${definitionsHtml}${synonymsAntonymsHtml}</div>`;
        
        addToHistory(word);
    } catch (err) {
        showError("Eroare de rețea. Reîncearcă.");
    }
}

async function copyDefinitionResult() {
    const card = resultContainer.querySelector('.results-card');
    if (!card) return;

    const title = card.querySelector('.word-title')?.innerText || '';
    const translation = card.querySelector('.translation')?.innerText || '';
    const definitions = Array.from(card.querySelectorAll('.definitions-list li')).map(li => li.innerText.trim()).join('\n');
    const synonyms = Array.from(card.querySelectorAll('.synonyms-box .word-tag')).map(tag => tag.innerText.trim()).join(', ');
    const antonyms = Array.from(card.querySelectorAll('.antonyms-box .word-tag')).map(tag => tag.innerText.trim()).join(', ');

    const clipboardText = [
        `Cuvânt: ${title}`,
        translation ? `${translation}` : '',
        definitions ? `Definiții și exemple:\n${definitions}` : '',
        synonyms ? `Sinonime: ${synonyms}` : '',
        antonyms ? `Antonime: ${antonyms}` : ''
    ].filter(Boolean).join('\n\n');

    try {
        await navigator.clipboard.writeText(clipboardText);
        alert('Rezultatul a fost copiat în clipboard!');
    } catch (err) {
        showError('Nu am putut copia rezultatul. Încearcă din nou.');
    }
}

function getRandomSearchWord() {
    const knownWords = (typeof wordsOfDay !== 'undefined' && Array.isArray(wordsOfDay))
        ? wordsOfDay.map(item => item.word)
        : [];
    if (knownWords.length === 0) return '';
    const randomIndex = Math.floor(Math.random() * knownWords.length);
    return knownWords[randomIndex];
}

async function searchRandomWord() {
    const randomWord = getRandomSearchWord();
    if (!randomWord) return;
    wordInput.value = randomWord;
    await searchWord();
}

// ========== CLICK PE SINONIME/ANTONIME ȘI COPIARE ==========
resultContainer.addEventListener('click', async (e) => {
    const target = e.target;
    if (target.classList && target.classList.contains('copy-btn')) {
        await copyDefinitionResult();
        return;
    }
    if (target.classList && target.classList.contains('word-tag')) {
        const clickedWord = target.innerText.trim();
        if (clickedWord && clickedWord.length > 0) {
            wordInput.value = clickedWord;
            await searchWord();
            const resultsCard = document.querySelector('.results-card');
            if (resultsCard) {
                resultsCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }
});

// Focus pe input la încărcare
wordInput.focus();

console.log("✅ Pull Request #5: Interactivitate completă - click pe sinonime/antonime");

// La finalul funcției searchWord()
function saveToHistory(word) {
    let history = JSON.parse(localStorage.getItem('searchHistory')) || [];
    if (!history.includes(word)) {
        history.unshift(word); // Adaugă la început
        history = history.slice(0, 5); // Păstrează doar ultimele 5
        localStorage.setItem('searchHistory', JSON.stringify(history));
        displayHistory();
    }
}

function displayHistory() {
    const historyData = JSON.parse(localStorage.getItem('searchHistory')) || [];
    // Aici creezi elemente HTML (span-uri) în header sau sub search box
}
// ========== ISTORIC CĂUTĂRI RECENTE ==========
// MAXIM 5 CUVINTE ÎN ISTORIC

// Cheia pentru localStorage
const STORAGE_KEY = 'bc_dictionary_history';

// Inițializare istoric
let searchHistory = [];

// Încarcă istoricul din localStorage la pornire
function loadHistory() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        searchHistory = JSON.parse(saved);
    } else {
        searchHistory = [];
    }
    displayHistory();
}

// Salvează istoricul în localStorage
function saveHistory() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(searchHistory));
}

// Adaugă un cuvânt nou în istoric (maxim 5)
function addToHistory(word) {
    if (!word || word.trim() === '') return;
    
    word = word.trim().toLowerCase();
    
    // Elimină dacă există deja
    const index = searchHistory.indexOf(word);
    if (index !== -1) {
        searchHistory.splice(index, 1);
    }
    
    // Adaugă la început
    searchHistory.unshift(word);
    
    // Păstrează doar ultimele 5
    if (searchHistory.length > 5) {
        searchHistory.pop();
    }
    
    saveHistory();
    displayHistory();
}

// Șterge un cuvânt specific din istoric
function removeFromHistory(word) {
    const index = searchHistory.indexOf(word);
    if (index !== -1) {
        searchHistory.splice(index, 1);
        saveHistory();
        displayHistory();
    }
}

// Șterge tot istoricul
function clearHistory() {
    searchHistory = [];
    saveHistory();
    displayHistory();
}

// Afișează istoricul în container
function displayHistory() {
    const container = document.getElementById('historyContainer');
    if (!container) return;
    
    if (searchHistory.length === 0) {
        container.innerHTML = '<div class="empty-history">📭 Niciun cuvânt căutat recent. Încearcă să cauți ceva!</div>';
        return;
    }
    
    container.innerHTML = searchHistory.map(word => `
        <div class="history-item" data-word="${word}">
            <span>🔍 ${word}</span>
            <button class="delete-history-item" data-word="${word}" title="Șterge">✕</button>
        </div>
    `).join('');
    
    // Adaugă evenimente pentru butoanele de ștergere individuale
    document.querySelectorAll('.delete-history-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const word = btn.getAttribute('data-word');
            removeFromHistory(word);
        });
    });
    
    // Adaugă evenimente pentru click pe cuvinte (re-caută)
    document.querySelectorAll('.history-item').forEach(item => {
        item.addEventListener('click', (e) => {
            // Evită dacă s-a dat click pe butonul de ștergere
            if (e.target.classList.contains('delete-history-item')) return;
            
            const word = item.getAttribute('data-word');
            if (word) {
                // Completează input-ul de căutare
                wordInput.value = word;
                // Apelează funcția de căutare
                searchWord();
            }
        });
    });
}

// Eveniment pentru butonul "Șterge tot istoricul"
document.getElementById('clearHistoryBtn')?.addEventListener('click', clearHistory);

// Încarcă istoricul la pornire
loadHistory();
// ========== CUVÂNTUL ZILEI ==========
// Dicționar cu cuvinte pentru fiecare zi
const wordsOfDay = [
    {
        word: "frumos",
        pronunciation: "/ˈfru.mos/",
        definition: "Care are însușiri plăcute văzului, auzului sau spiritului; care impresionează prin aspect, culoare, formă etc.",
        example: "A avut parte de un spectacol frumos la teatrul național.",
        synonyms: ["atrăgător", "plăcut", "minunat", "superb", "estetic"]
    },
    {
        word: "prietenie",
        pronunciation: "/pri.eˈte.ni.e/",
        definition: "Sentiment de afecțiune și stimă reciprocă dintre două sau mai multe persoane; relație bazată pe încredere și sprijin.",
        example: "Prietenia dintre ei a durat mai bine de 20 de ani.",
        synonyms: ["cameraderi", "tovărășie", "frăție", "apropiere"]
    },
    {
        word: "munte",
        pronunciation: "/ˈmun.te/",
        definition: "Formă de relief pozitivă, cu altitudine mare, ce se înalță brusc deasupra regiunii înconjurătoare.",
        example: "În fiecare vară, familia noastră merge într-o excursie la munte.",
        synonyms: ["masiv", "culme", "pisc", "vârf"]
    },
    {
        word: "călătorie",
        pronunciation: "/kə.lə.toˈri.e/",
        definition: "Acțiunea de a călători; deplasare într-un loc mai îndepărtat, de obicei cu un scop anume.",
        example: "Călătoria în Japonia i-a schimbat perspectiva asupra vieții.",
        synonyms: ["voiaj", "excursie", "expediție", "turneu"]
    },
    {
        word: "bucurie",
        pronunciation: "/buˈku.ri.e/",
        definition: "Sentiment puternic de mulțumire și fericire, generat de un eveniment plăcut.",
        example: "Bucuria de a-și revedea familia a fost copleșitoare.",
        synonyms: ["fericire", "veselie", "încântare", "deliciu"]
    },
    {
        word: "vis",
        pronunciation: "/vis/",
        definition: "Suită de imagini, senzații și idei care apar în timpul somnului; dorință puternică de a realiza ceva.",
        example: "Visul lui este să devină medic și să ajute oamenii.",
        synonyms: ["iluzie", "fantezie", "aspirație", "dorință"]
    },
    {
        word: "libertate",
        pronunciation: "/li.berˈta.te/",
        definition: "Posibilitatea de a acționa sau gândi fără constrângeri externe; stare de independență.",
        example: "Toți oamenii se nasc liberi și egali în demnitate și drepturi.",
        synonyms: ["independență", "autonomie", "eliberare", "dezlegare"]
    },
    {
        word: "cunoaștere",
        pronunciation: "/kuˈno̯aʃ.te.re/",
        definition: "Procesul de a dobândi informații, priceperi sau înțelegere prin experiență sau educație.",
        example: "Cunoașterea istoriei ne ajută să înțelegem prezentul.",
        synonyms: ["știință", "erudiție", "învățătură", "informare"]
    }
];

// Cheia pentru localStorage (salvează cuvântul de azi)
const WORD_KEY = 'bc_word_of_day';
const DATE_KEY = 'bc_word_date';

// Obține data curentă în format YYYY-MM-DD
function getTodayDate() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

// Obține data afișată în format românesc
function getFormattedDate() {
    const today = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return today.toLocaleDateString('ro-RO', options);
}

// Generează un cuvânt random din listă (folosind data ca seed)
function getWordOfDayByDate() {
    const today = getTodayDate();
    // Folosește data ca seed pentru a genera același cuvânt toată ziua
    let hash = 0;
    for (let i = 0; i < today.length; i++) {
        hash = ((hash << 5) - hash) + today.charCodeAt(i);
        hash = hash & hash;
    }
    const index = Math.abs(hash) % wordsOfDay.length;
    return wordsOfDay[index];
}

// Salvează cuvântul zilei în localStorage
function saveWordOfDay(word) {
    localStorage.setItem(WORD_KEY, JSON.stringify(word));
    localStorage.setItem(DATE_KEY, getTodayDate());
}

// Încarcă sau generează cuvântul zilei
function loadWordOfDay() {
    const savedDate = localStorage.getItem(DATE_KEY);
    const savedWord = localStorage.getItem(WORD_KEY);
    const today = getTodayDate();
    
    // Dacă există cuvânt salvat de azi, folosește-l
    if (savedDate === today && savedWord) {
        return JSON.parse(savedWord);
    }
    
    // Altfel, generează unul nou
    const newWord = getWordOfDayByDate();
    saveWordOfDay(newWord);
    return newWord;
}

// Afișează cuvântul zilei în pagină
function displayWordOfDay() {
    const container = document.getElementById('wordOfDayContent');
    if (!container) return;
    
    const word = loadWordOfDay();
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        dateElement.textContent = getFormattedDate();
    }
    
    container.innerHTML = `
        <div class="word-of-day-word">${word.word}</div>
        <div class="word-of-day-pronunciation">${word.pronunciation}</div>
        <div class="word-of-day-definition">📚 ${word.definition}</div>
        <div class="word-of-day-example">${word.example}</div>
        <div class="word-of-day-synonyms">
            <strong>Sinonime:</strong>
            ${word.synonyms.map(syn => `<span class="synonym-tag" data-word="${syn}">${syn}</span>`).join('')}
        </div>
        <button class="refresh-word-day" id="refreshWordDayBtn">🔄 Alt cuvânt (doar pentru test)</button>
    `;
    
    // Adaugă evenimente pentru sinonime (când se dă click, caută acel cuvânt)
    document.querySelectorAll('.synonym-tag').forEach(tag => {
        tag.addEventListener('click', () => {
            const synonymWord = tag.getAttribute('data-word');
            if (synonymWord) {
                wordInput.value = synonymWord;
                searchWord();
            }
        });
    });
    
    // Eveniment pentru butonul de refresh (doar pentru test - schimbă cuvântul)
    const refreshBtn = document.getElementById('refreshWordDayBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            // Generează un cuvânt random diferit
            const randomIndex = Math.floor(Math.random() * wordsOfDay.length);
            const newWord = { ...wordsOfDay[randomIndex] };
            saveWordOfDay(newWord);
            displayWordOfDay();
        });
    }
}

// Resetează cuvântul zilei (forțează generarea unuia nou la miezul nopții)
function checkAndResetWordOfDay() {
    const savedDate = localStorage.getItem(DATE_KEY);
    const today = getTodayDate();
    if (savedDate !== today) {
        const newWord = getWordOfDayByDate();
        saveWordOfDay(newWord);
        displayWordOfDay();
    }
}

// Inițializează Cuvântul zilei
function initWordOfDay() {
    displayWordOfDay();
    // Verifică la fiecare oră dacă s-a schimbat ziua
    setInterval(checkAndResetWordOfDay, 3600000);
}

// Pornește la încărcarea paginii
document.addEventListener('DOMContentLoaded', initWordOfDay);
