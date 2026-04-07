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
 main
 main
