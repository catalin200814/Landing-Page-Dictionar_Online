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

// ========== AFIȘARE DEFINITII ==========
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

// ========== FUNCȚIE CAUTARE COMPLETĂ ==========
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

// ========== FUNCȚII AJUTĂTOARE ==========
function showLoading() {
    resultContainer.innerHTML = `<div class="results-card"><div class="loader"><div class="spinner"></div><span>Se încarcă definițiile...</span></div></div>`;
}

function showError(message) {
    resultContainer.innerHTML = `<div class="results-card"><div class="error-message">⚠️ ${message}</div></div>`;
}

console.log("✅ Pull Request #3: API definiții integrat");