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
const wordInput = document.getElementById('wordInput');
const resultContainer = document.getElementById('resultContainer');

// ========== FUNCȚIE CAUTARE TEMPORARĂ ==========
function searchWord() {
    let word = wordInput.value.trim();
    if (word === "") {
        resultContainer.innerHTML = `<div class="info-text">⚠️ Te rog să introduci un cuvânt.</div>`;
        return;
    }
    resultContainer.innerHTML = `<div class="info-text">🔍 Ai căutat: "<strong>${word}</strong>".<br>🚀 În curând: definiții, sinonime și antonime!</div>`;
}

// ========== EVENIMENTE ==========
searchBtn.addEventListener('click', searchWord);
wordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        searchWord();
    }
});

console.log("✅ Pull Request #2: Bara de căutare funcțională");

 feature/pronunciation-audio


// ========== API DEFINITII ==========
> main
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

 feature/pronunciation-audio


// ========== AFIȘARE DEFINITII ==========
 main
function renderDefinitions(word, definitionData) {
    if (!definitionData) {
        return `<div class="info-text">⚠️ Nu am găsit definiții pentru "${word}".</div>`;
    }
    
    const phonetic = definitionData.phonetic || definitionData.phonetics?.find(p => p.text)?.text || '';
    const meanings = definitionData.meanings || [];
    
    let definitionsHtml = '';
    if (phonetic) {
        definitionsHtml += `<div class="phonetic">/${phonetic}/</div>`;
    }
    
    for (const meaning of meanings) {
        const partOfSpeech = meaning.partOfSpeech || 'cuvânt';
        const definiții = meaning.definitions || [];
        let defListHtml = '';
        for (let def of definiții.slice(0, 3)) {
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
    
    return `
        <div class="word-header">
            <div class="word-title">${word}</div>
        </div>
        ${definitionsHtml}
    `;
}

 feature/pronunciation-audio


// ========== FUNCȚIE CAUTARE COMPLETĂ ==========
 main
async function searchWord() {
    let word = wordInput.value.trim();
    if (word === "") {
        showError("Te rog să introduci un cuvânt pentru căutare.");
        return;
    }
    
    showLoading();
    
    try {
        const definitionResult = await fetchDefinitions(word.toLowerCase());
        
        if (!definitionResult) {
            resultContainer.innerHTML = `<div class="results-card"><div class="error-message">🔍 Nu am găsit definiții pentru "${word}".</div></div>`;
            return;
        }
        
        const definitionsHtml = renderDefinitions(word, definitionResult);
        resultContainer.innerHTML = `<div class="results-card">${definitionsHtml}</div>`;
    } catch (err) {
        showError("A apărut o eroare. Verifică conexiunea.");
    }
}

 feature/pronunciation-audio


// ========== FUNCȚII AJUTĂTOARE ==========
 main
function showLoading() {
    resultContainer.innerHTML = `<div class="results-card"><div class="loader"><div class="spinner"></div><span>Se încarcă definițiile...</span></div></div>`;
}

function showError(message) {
    resultContainer.innerHTML = `<div class="results-card"><div class="error-message">⚠️ ${message}</div></div>`;
}

console.log("✅ Pull Request #3: API definiții integrat");
 feature/pronunciation-audio


// ========== API SINONIME ANTONIME ==========
 main
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

 feature/pronunciation-audio


// ========== AFIȘARE SINONIME/ANTONIME ==========
 main
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

 feature/pronunciation-audio


// ========== FUNCȚIE CAUTARE ACTUALIZATĂ ==========
 main
async function searchWord() {
    let word = wordInput.value.trim();
    if (word === "") {
        showError("Te rog să introduci un cuvânt.");
        return;
    }
    
    showLoading();
    
    try {
        const [definitionResult, thesaurusResult] = await Promise.all([
            fetchDefinitions(word.toLowerCase()),
            fetchSynonymsAntonyms(word.toLowerCase())
        ]);
        
        const definitionsHtml = definitionResult ? renderDefinitions(word, definitionResult) : `<div class="info-text">⚠️ Nu există definiții pentru "${word}".</div>`;
        const synonymsAntonymsHtml = renderSynonymsAntonyms(thesaurusResult.synonyms, thesaurusResult.antonyms);
        
        resultContainer.innerHTML = `<div class="results-card">${definitionsHtml}${synonymsAntonymsHtml}</div>`;
    } catch (err) {
        showError("Eroare de rețea. Reîncearcă.");
    }
}
 feature/pronunciation-audio


// ========== CLICK PE SINONIME/ANTONIME ==========
 main
resultContainer.addEventListener('click', async (e) => {
    let target = e.target;
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
feature/pronunciation-audio
let currentAudioUrl = null;

async function fetchPronunciation(word) {
    // Folosește API-ul gratuit de la FreeDictionary (deja avem audio în definitionData)
    try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
        const data = await response.json();
        if (data && data[0] && data[0].phonetics) {
            const audio = data[0].phonetics.find(p => p.audio);
            if (audio && audio.audio) {
                return audio.audio;
            }
        }
        return null;
    } catch (err) {
        console.warn("Eroare pronunție:", err);
        return null;
    }
}
 feature/favorites-list
const suggestionsDiv = document.getElementById('suggestions');

wordInput.addEventListener('input', async (e) => {
    const query = e.target.value.trim();
    if (query.length < 2) {
        suggestionsDiv.classList.remove('show');
        return;
    }
    
    try {
        const response = await fetch(`https://api.datamuse.com/sug?s=${encodeURIComponent(query)}&max=5`);
        const data = await response.json();
        
        if (data.length > 0) {
            suggestionsDiv.innerHTML = data.map(item => 
                `<div class="suggestion-item" data-word="${item.word}">${item.word}</div>`
            ).join('');
            suggestionsDiv.classList.add('show');
            
            // Click pe sugestie
            document.querySelectorAll('.suggestion-item').forEach(el => {
                el.addEventListener('click', () => {
                    wordInput.value = el.dataset.word;
                    suggestionsDiv.classList.remove('show');
                    searchWord();
                });
            });
        } else {
            suggestionsDiv.classList.remove('show');
        }
    } catch (err) {
        console.warn("Eroare sugestii:", err);
    }
});

// Ascunde sugestiile la click în afara
document.addEventListener('click', (e) => {
    if (!wordInput.contains(e.target) && !suggestionsDiv.contains(e.target)) {
        suggestionsDiv.classList.remove('show');
    }
});
// ========== FAVORITES LIST ==========
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

function saveFavorites() {
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

function addToFavorites(word) {
    if (!favorites.includes(word)) {
        favorites.push(word);
        saveFavorites();
        showToast(`✅ "${word}" adăugat la favorite!`);
    }
}

function removeFromFavorites(word) {
    favorites = favorites.filter(fav => fav !== word);
    saveFavorites();
    showToast(`🗑️ "${word}" șters din favorite`);
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
}


=======


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
                const searchInput = document.getElementById('searchInput');
                if (searchInput) {
                    searchInput.value = word;
                }
                // Apelează funcția de căutare (personalizează după nevoile tale)
                if (typeof performSearch === 'function') {
                    performSearch(word);
                } else {
                    // Dacă nu ai funcție de căutare, poți afișa un mesaj
                    console.log('Caută:', word);
                    alert(`Caută cuvântul: ${word}`);
                }
                // Adaugă din nou în istoric (mută la început)
                addToHistory(word);
            }
        });
    });
}

// ===== INTEGRARE CU FUNCȚIA TA DE CĂUTARE =====
// Modifică funcția ta de căutare existentă să includă istoricul
// Exemplu: Când cineva caută un cuvânt, apelează addToHistory(cuvant)

// Exemplu de funcție de căutare (adapteaz-o la codul tău)
function performSearch(word) {
    // Aici vine logica ta de căutare în dicționar
    addToHistory(word); // 🔥 SALVEAZĂ ÎN ISTORIC
    
    // Restul codului tău de căutare...
    console.log('Se caută:', word);
}

// Eveniment pentru butonul "Șterge tot istoricul"
document.getElementById('clearHistoryBtn')?.addEventListener('click', clearHistory);

// Încarcă istoricul la pornire
loadHistory();

// Dacă ai un buton de căutare, adaugă evenimentul
document.getElementById('searchBtn')?.addEventListener('click', () => {
    const input = document.getElementById('searchInput');
    if (input && input.value.trim()) {
        performSearch(input.value.trim());
    }
});

// Dacă ai Enter pe input
document.getElementById('searchInput')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const input = document.getElementById('searchInput');
        if (input && input.value.trim()) {
            performSearch(input.value.trim());
        }
    }
});
 Cuvantul.zilei
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
        tag.addEventListener('click', (e) => {
            const synonymWord = tag.getAttribute('data-word');
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.value = synonymWord;
                // Dacă există funcție de căutare, apeleaz-o
                if (typeof performSearch === 'function') {
                    performSearch(synonymWord);
                } else {
                    alert(`Caută: ${synonymWord}`);
                }
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

 main
 main
 main
