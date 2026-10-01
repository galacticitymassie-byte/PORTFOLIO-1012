(() => {
  const FALLBACK = "I don't have that information in the portfolio.";
  const panel = document.querySelector('#assistant-panel');
  const messages = document.querySelector('#chat-messages');
  const welcomeMessage = messages.firstElementChild.cloneNode(true);
  const form = document.querySelector('#chat-form');
  const input = document.querySelector('#chat-input');
  let isOpen = false;
  let conversationVersion = 0;

  const knowledge = [
    { terms: ['who is', 'about them', 'about this person', 'tell me about this developer'], answer: 'This portfolio describes a developer working across Android, web, and AI-assisted applications, with a focus on usable, engaging digital experiences. A personal name was not provided.' },
    { terms: ['projects', 'how many project', 'completed'], answer: 'There are 2 projects featured: EduTech Mobile and Belupacito AI Pet Care Assistant.' },
    { terms: ['edutech', 'edu tech', 'project 1', 'computer literacy'], answer: 'EduTech Mobile is an offline Android learning application designed to introduce young learners to computer literacy. It includes interactive lessons, assessments, games, progress tracking, achievements, and age-appropriate learning content. The listed role is Main Developer.' },
    { terms: ['belupacito', 'pet care', 'project 2'], answer: 'Belupacito is an AI-powered pet care assistant that provides conversational assistance and accessible pet-care information. Listed capabilities include an AI assistant, conversational interface, interactive UI, responsive web interface, and AI API integration. The listed role is AI Developer.' },
    { terms: ['technolog', 'tech stack', 'tools'], answer: 'Listed technologies include Kotlin, Jetpack Compose, Android Studio, Room / SQLite, Media3, Lottie, JavaScript, HTML, CSS, VS Code, Git, GitHub, Canva, CapCut, LottieFiles, AI API integration, conversational interfaces, and prompt engineering.' },
    { terms: ['skill', 'development skills'], answer: 'Development: Kotlin, JavaScript, HTML, CSS, and Jetpack Compose. Tools: Android Studio, VS Code, Git, GitHub, Canva, CapCut, and LottieFiles. AI / technology: AI API integration, AI-assisted development, conversational interfaces, and prompt engineering.' },
    { terms: ['education', 'study', 'school', 'where did'], answer: 'The educational background listed is Elementary: Camp 1; High School: San Andres Academy of Maramag, Inc.; College: Torres Capitol College, Inc.' },
    { terms: ['certificate', 'certification', 'e-cert'], answer: 'The portfolio lists 5+ e-certificates. Individual certificate titles, issuers, dates, and descriptions have not been provided.' },
    { terms: ['role', 'contribution', 'main developer'], answer: 'Roles are project-specific. The portfolio highlights application development, UI and feature implementation, testing, debugging, database implementation, animation implementation, AI integration, and project maintenance.' },
    { terms: ['kind of application', 'applications do', 'what do they build'], answer: 'The portfolio features an offline Android learning application and an AI-powered pet-care assistant with a responsive web interface.' },
    { terms: ['process', 'challenge', 'learning objective'], answer: 'The project summaries describe their goals and features, but specific development processes and project challenges are not provided. EduTech Mobile is intended to introduce young learners to computer literacy.' }
  ];

  function answerQuestion(question) {
    const normalized = question.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').replace(/\s+/g, ' ').trim();
    const match = knowledge.find((entry) => entry.terms.some((term) => normalized.includes(term)));
    return match ? match.answer : FALLBACK;
  }

  function setOpen(open) {
    isOpen = open;
    panel.hidden = !open;
    document.querySelector('.assistant-launcher').setAttribute('aria-expanded', String(open));
    if (open) input.focus();
    else document.querySelector('.assistant-launcher').focus();
  }

  function addMessage(text, type) {
    const message = document.createElement('div');
    message.className = `chat-message ${type === 'assistant' ? 'assistant-message' : 'user-message'}`;
    if (type === 'assistant') {
      const avatar = document.createElement('span');
      avatar.className = 'message-avatar';
      avatar.textContent = '✳';
      message.append(avatar);
    }
    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    message.append(paragraph);
    messages.append(message);
    messages.scrollTop = messages.scrollHeight;
    return message;
  }

  function sendQuestion(question) {
    const value = question.trim();
    if (!value) return;
    addMessage(value, 'user');
    input.value = '';
    const typing = document.createElement('div');
    typing.className = 'chat-message assistant-message typing-message';
    typing.setAttribute('aria-label', 'Assistant is typing');
    typing.innerHTML = '<span class="message-avatar">✳</span><p><i></i><i></i><i></i></p>';
    messages.append(typing);
    messages.scrollTop = messages.scrollHeight;
    const version = conversationVersion;
    window.setTimeout(() => {
      if (version !== conversationVersion) return;
      typing.remove();
      addMessage(answerQuestion(value), 'assistant');
    }, document.documentElement.classList.contains('motion-disabled') ? 0 : 850);
  }

  document.addEventListener('open-portfolio-assistant', () => setOpen(true));
  document.querySelector('.chat-clear').addEventListener('click', () => {
    conversationVersion += 1;
    messages.replaceChildren(welcomeMessage.cloneNode(true));
    input.value = '';
    input.focus();
  });
  document.querySelector('.chat-minimize').addEventListener('click', () => setOpen(false));
  document.querySelector('.assistant-launcher').addEventListener('click', () => setOpen(!isOpen));
  form.addEventListener('submit', (event) => { event.preventDefault(); sendQuestion(input.value); });
  document.querySelectorAll('.suggested-questions button').forEach((button) => button.addEventListener('click', () => sendQuestion(button.textContent)));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && isOpen) setOpen(false); });
})();
