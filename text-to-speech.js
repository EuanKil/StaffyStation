// Text-to-Speech functionality for blog textboxes
let currentSpeech = null;
let isPlaying = false;

// Initialize text-to-speech functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeTextToSpeech();
});

function initializeTextToSpeech() {
    // Check if browser supports speech synthesis
    if (!('speechSynthesis' in window)) {
        console.warn('Text-to-speech not supported in this browser');
        return;
    }

    // Add text-to-speech buttons to blog textboxes
    addTextToSpeechButtons();
    
    // Load voices when they become available
    speechSynthesis.onvoiceschanged = function() {
        console.log('Speech synthesis voices loaded');
    };
}

function addTextToSpeechButtons() {
    const blog1Containers = document.querySelectorAll('.blog1-button-container');
    const blog2Containers = document.querySelectorAll('.blog2-button-container');
    const aboutUsContainer = document.querySelector('.about-us-container');
    
    // Add buttons to all blog1 containers
    if (blog1Containers && blog1Containers.length) {
        blog1Containers.forEach((container, idx) => {
            const id = `blog1-text-${idx+1}`;
            addButtonToContainer(container, id);
        });
    }

    // Add buttons to all blog2 containers
    if (blog2Containers && blog2Containers.length) {
        blog2Containers.forEach((container, idx) => {
            const id = `blog2-text-${idx+1}`;
            addButtonToContainer(container, id);
        });
    }
    
    if (aboutUsContainer) {
        addButtonToAboutContainer(aboutUsContainer, 'about-text');
    }
}

function addButtonToContainer(buttonContainer, textId) {
    // Add ID to the paragraph for reference
    const textbox = buttonContainer.parentElement.querySelector('.blog1-textbox, .blog2-textbox');
    const paragraph = textbox ? textbox.querySelector('p') : null;
    if (paragraph) {
        paragraph.id = textId;
    }
    
    // Create the text-to-speech button
    const button = document.createElement('button');
    button.className = 'tts-button';
    button.innerHTML = '🔊';
    button.title = 'Listen to this story';
    button.setAttribute('aria-label', 'Read story aloud');
    button.onclick = function() {
        toggleSpeech(textId);
    };
    
    // Insert button before the existing "Share your story" button
    buttonContainer.insertBefore(button, buttonContainer.firstChild);
}

function addButtonToAboutContainer(aboutContainer, textId) {
    // Add ID to the about text content for reference
    const aboutTextContent = aboutContainer.querySelector('.about-text-content');
    if (aboutTextContent) {
        aboutTextContent.id = textId;
    }
    
    // Create button container
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'about-tts-button-container';
    
    // Create the text-to-speech button
    const button = document.createElement('button');
    button.className = 'tts-button about-tts-button';
    button.innerHTML = '🔊';
    button.title = 'Listen to about us content';
    button.setAttribute('aria-label', 'Read about us content aloud');
    button.onclick = function() {
        toggleSpeech(textId);
    };
    
    buttonContainer.appendChild(button);
    
    // Insert button after the h2 title but before the text container
    const title = aboutContainer.querySelector('h2');
    const textContainer = aboutContainer.querySelector('.about-text-container');
    if (title && textContainer) {
        aboutContainer.insertBefore(buttonContainer, textContainer);
    }
}

function toggleSpeech(textId) {
    // If currently playing, stop the speech
    if (currentSpeech && isPlaying) {
        stopSpeech();
        return;
    }
    
    // Start new speech
    startSpeech(textId);
}

function startSpeech(textId) {
    // Stop any existing speech first
    if (currentSpeech) {
        speechSynthesis.cancel();
    }
    
    // Get the text content
    const textElement = document.getElementById(textId);
    if (!textElement) {
        console.error('Text element not found:', textId);
        return;
    }
    
    const textContent = textElement.textContent || textElement.innerText;
    
    // Create speech synthesis utterance
    currentSpeech = new SpeechSynthesisUtterance(textContent);
    
    // Configure speech settings
    currentSpeech.rate = 0.85; // Slightly slower for better comprehension
    currentSpeech.pitch = 1.0;
    currentSpeech.volume = 1.0;
    
    // Try to use a more natural voice if available
    const voices = speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
        voice.lang.startsWith('en') && 
        (voice.name.includes('Natural') || 
         voice.name.includes('Enhanced') || 
         voice.name.includes('Google') ||
         voice.name.includes('Microsoft'))
    ) || voices.find(voice => voice.lang.startsWith('en'));
    
    if (preferredVoice) {
        currentSpeech.voice = preferredVoice;
    }
    
    // Event handlers
    currentSpeech.onstart = function() {
        isPlaying = true;
        updateAllButtonStates(true);
        console.log('Started reading text');
    };
    
    currentSpeech.onend = function() {
        isPlaying = false;
        currentSpeech = null;
        updateAllButtonStates(false);
        console.log('Finished reading text');
    };
    
    currentSpeech.onerror = function(event) {
        console.error('Speech synthesis error:', event.error);
        isPlaying = false;
        currentSpeech = null;
        updateAllButtonStates(false);
        
        // Show user-friendly error message
        const errorMessages = {
            'not-allowed': 'Permission denied. Please allow audio in your browser settings.',
            'network': 'Network error. Please check your internet connection.',
            'synthesis-failed': 'Speech synthesis failed. Please try again.'
        };
        
        const userMessage = errorMessages[event.error] || 'An error occurred while reading the text. Please try again.';
        alert(userMessage);
    };
    
    // Start speaking
    speechSynthesis.speak(currentSpeech);
}

function stopSpeech() {
    if (currentSpeech) {
        speechSynthesis.cancel();
        currentSpeech = null;
        isPlaying = false;
        updateAllButtonStates(false);
        console.log('Speech stopped');
    }
}

function updateAllButtonStates(playing) {
    const buttons = document.querySelectorAll('.tts-button');
    buttons.forEach(button => {
        if (playing) {
            button.innerHTML = '⏸️';
            button.title = 'Stop reading';
            button.setAttribute('aria-label', 'Stop reading story');
            button.classList.add('playing');
        } else {
            button.innerHTML = '🔊';
            button.title = 'Listen to this story';
            button.setAttribute('aria-label', 'Read story aloud');
            button.classList.remove('playing');
        }
    });
}

// Clean up function for page unload
window.addEventListener('beforeunload', function() {
    if (currentSpeech) {
        speechSynthesis.cancel();
    }
});

// Pause speech when page loses focus (optional)
document.addEventListener('visibilitychange', function() {
    if (document.hidden && currentSpeech && isPlaying) {
        // Optionally pause when tab becomes hidden
        // speechSynthesis.pause();
    } else if (!document.hidden && currentSpeech) {
        // Resume when tab becomes visible again
        // speechSynthesis.resume();
    }
});