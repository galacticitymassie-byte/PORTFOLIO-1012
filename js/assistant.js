(() => {
  const FALLBACK = "I don't have a specific answer for that. For interview preparation, use real examples and structure them with STAR (Situation, Task, Action, Result). You can ask me about interview topics, projects, skills, education, certificates, or contact details.";
  const GREETING = "Hi! I'm Angel Mark's portfolio assistant. I can answer questions about the projects, skills, education, and contact details listed here. I'm rule-based, not generative AI.";
  const panel = document.querySelector('#assistant-panel');
  const messages = document.querySelector('#chat-messages');
  const welcomeMessage = messages.firstElementChild.cloneNode(true);
  const form = document.querySelector('#chat-form');
  const input = document.querySelector('#chat-input');
  let isOpen = false;
  let conversationVersion = 0;

  const knowledge = [
    { terms: ['thank', 'thanks', 'thank you'], answer: "You're welcome! Ask me anything else about the information listed in the portfolio." },
    { terms: ['bye', 'goodbye', 'see you'], answer: 'Thanks for stopping by. Feel free to explore the portfolio or get in touch at zipzap32145@gmail.com.' },
    { terms: ['are you ai', 'using ai', 'generative ai', 'how do you work'], answer: "I'm a local, rule-based assistant. I match your question to information in this portfolio; I don't use generative AI, an API key, or an external AI service." },
    { terms: ['who is', 'who are you', 'your name', 'about them', 'about this person', 'tell me about this developer'], answer: 'Angel Mark is an IT student and developer working across Android, web, and AI-assisted applications, with a focus on usable, engaging digital experiences.' },
    { terms: ['contact', 'email', 'get in touch', 'reach angel'], answer: 'You can contact Angel Mark by email at zipzap32145@gmail.com.' },
    { terms: ['projects', 'how many project', 'completed'], answer: 'There are 2 projects featured: EduTech Mobile and Belupacito AI Pet Care Assistant.' },
    { terms: ['edutech', 'edu tech', 'project 1', 'computer literacy'], answer: 'EduTech Mobile is an offline Android learning application designed to introduce young learners to computer literacy. It includes interactive lessons, assessments, games, progress tracking, achievements, and age-appropriate learning content. The listed role is Main Developer.' },
    { terms: ['belupacito', 'pet care', 'project 2'], answer: 'Belupacito is an AI-powered pet care assistant that provides conversational assistance and accessible pet-care information. Listed capabilities include an AI assistant, conversational interface, interactive UI, responsive web interface, and AI API integration. The listed role is AI Developer.' },
    { terms: ['technolog', 'tech stack', 'tools'], answer: 'Listed technologies include Kotlin, Jetpack Compose, Android Studio, Room / SQLite, Media3, Lottie, JavaScript, HTML, CSS, VS Code, Git, GitHub, Canva, CapCut, LottieFiles, AI API integration, conversational interfaces, and prompt engineering.' },
    { terms: ['soft skill', 'interpersonal skill', 'people skills', 'personal qualities'], answer: "Based on Angel's portfolio, his soft skills include curiosity, a willingness to learn, and user-focused thinking. He describes enjoying turning ideas into working projects and finding ways to make them useful and user-friendly. For an interview, he can support these qualities with a real example from one of his projects." },
    { terms: ['skill', 'development skills'], answer: 'Development: Kotlin, JavaScript, HTML, and CSS. Tools: Android Studio, VS Code, Git, GitHub, Canva, CapCut, and LottieFiles.' },
    { terms: ['education', 'study', 'school', 'where did'], answer: 'The educational background listed is Elementary: Camp 1; High School: San Andres Academy of Maramag, Inc.; College: Torres Capitol College, Inc.' },
    { terms: ['certificate', 'certification', 'e-cert'], answer: 'The portfolio lists five certificates: Frontend Forge Workshop (DEVCON Bukidnon Chapter); B.A.S.I.C. CapCut Webinar (MinSU College of Computer Studies); Design Thinking and Mobile App Wireframing (DICT Region V); Introduction to Modern AI (DICT-ITU DTC Initiative / Cisco Networking Academy); and AI Ready ASEAN (ASEAN Foundation).' },
    { terms: ['role', 'contribution', 'main developer'], answer: 'Roles are project-specific. The portfolio highlights application development, UI and feature implementation, testing, debugging, database implementation, animation implementation, AI integration, and project maintenance.' },
    { terms: ['kind of application', 'applications do', 'what do they build'], answer: 'The portfolio features an offline Android learning application and an AI-powered pet-care assistant with a responsive web interface.' },
    { terms: ['process', 'challenge', 'learning objective'], answer: 'The project summaries describe their goals and features, but specific development processes and project challenges are not provided. EduTech Mobile is intended to introduce young learners to computer literacy.' }
  ];

  const interviewHelp = [
    {
      terms: ['tell me about yourself', 'introduce yourself', 'self introduction', 'your background'],
      answer: "Keep this answer to about a minute: present, relevant background, one or two examples, then what you're looking for. Example: \"I'm Angel Mark, an IT student interested in building useful software. My portfolio includes EduTech Mobile, an offline Android computer-literacy learning app, and Belupacito, a pet-care assistant project. I'm continuing to develop my skills in Android and web development, and I'm looking for an entry-level opportunity to learn and contribute.\" Adjust the last sentence to the role; don't claim experience you don't have."
    },
    {
      terms: ['strengths', 'greatest strength', 'strongest skill', 'what are your strengths'],
      answer: 'Choose one or two strengths relevant to the role, support each with a real example, and explain the result. Angel could point to portfolio-listed work on EduTech Mobile, an offline Android learning app, or Belupacito, a pet-care assistant project. Describe only the tasks and outcomes you personally know to be accurate.'
    },
    {
      terms: ['weakness', 'weaknesses', 'area to improve', 'what would you improve'],
      answer: 'Choose a genuine, manageable area you are actively improving. Briefly explain what you are doing to improve it, such as practicing a skill, seeking feedback, or following a learning plan. Avoid disguising a strength as a weakness, and use an example that is true for you.'
    },
    {
      terms: ['work experience', 'describe my experience', 'describe your experience', 'talk about my experience', 'talk about experience', 'discuss my experience', 'experience in an interview', 'experience question', 'tell me about my experience', 'tell me about your experience'],
      answer: 'Answer with relevant, verifiable examples from projects, coursework, volunteering, or other real activities. Explain the situation, your specific responsibility, what you did, and the result. Angel can draw on the projects described in the portfolio, including EduTech Mobile and Belupacito, without presenting project work as paid employment.'
    },
    {
      terms: ['star method', 'behavioral interview', 'behavioral question', 'tell me about a time', 'describe a challenge', 'challenging situation', 'structure an answer', 'structure my answer', 'common interview questions', 'answer interview questions', 'answer questions in an interview'],
      answer: 'For experience-based questions, use STAR: Situation (context), Task (your responsibility), Action (what you did), and Result (the outcome or lesson). Keep the setup brief, focus on your own actions, and use a real example. For other questions, answer directly, give a relevant reason or example, and stop when the question is answered.'
    },
    {
      terms: ['why should we hire you', 'why hire you', 'why are you a good fit', 'why should we choose you'],
      answer: 'Connect the role requirements to skills you can demonstrate, give a truthful example, and say how you would contribute while continuing to learn. As an IT student or entry-level candidate, it is fine to emphasize relevant study and project work rather than claim professional experience you do not have.'
    },
    {
      terms: ['why do you want this job', 'why this job', 'why this role', 'why this company', 'why do you want to work here'],
      answer: 'Show that you understand the role, connect it to a genuine interest or relevant skill, and explain what you hope to contribute and learn. Make the answer specific to the employer using information you have verified; avoid generic praise or claiming facts you have not checked.'
    },
    {
      terms: ['entry-level', 'entry level', 'it student', 'first developer job', 'no professional experience', 'no work experience', 'student interview', 'junior developer interview'],
      answer: 'For an IT-student or entry-level interview, prepare a short introduction, examples from coursework or personal projects, the tools and technologies you have actually used, and one challenge or lesson from a real project. Be clear about what you did, what you are still learning, and why the role interests you; do not imply paid work if the example was a project.'
    },
    {
      terms: ['technical interview', 'technical interview preparation', 'coding interview', 'developer interview preparation', 'prepare for a developer interview'],
      answer: 'Review fundamentals relevant to the role, practice explaining your reasoning aloud, and work through small problems without rushing. Be ready to discuss a real project: its goal, your contribution, a decision or challenge, and what you would improve. If you do not know an answer, say what you do know and how you would investigate.'
    },
    {
      terms: ['web developer interview', 'web development interview', 'frontend interview', 'front-end interview', 'html interview', 'css interview', 'javascript interview'],
      answer: 'For a web-development interview, review HTML structure and accessibility, CSS layout and responsive design, and JavaScript fundamentals such as events, arrays, functions, and debugging. Practice building or explaining a small interface, and be ready to discuss code you have actually written. These are preparation topics, not a claim that the portfolio demonstrates every one.'
    },
    {
      terms: ['android interview', 'android development interview', 'kotlin interview', 'jetpack compose interview'],
      answer: 'For an Android interview, review Kotlin fundamentals, Android app structure, UI state and lifecycle concepts, and the Android tools relevant to the role. Angel’s portfolio lists Kotlin, Jetpack Compose, Android Studio, and EduTech Mobile, an offline Android learning app. Prepare to explain only the implementation details you personally know.'
    },
    {
      terms: ['what should i wear', 'what to wear', 'interview attire', 'dress for an interview', 'clothes for an interview'],
      answer: 'Choose clean, neat attire appropriate to the employer and role. If unsure, ask the recruiter about the dress expectation or choose a slightly more formal option than the everyday workplace standard. Make sure clothes are comfortable and ready before interview day.'
    },
    {
      terms: ['punctual', 'how early', 'arrive for an interview', 'late to an interview', 'interview on time'],
      answer: 'Plan your route and connection ahead of time, check the interview location or meeting link, and aim to be ready about 10–15 minutes early. For a virtual interview, test your camera, microphone, and internet beforehand. If an unavoidable delay happens, contact the interviewer as soon as possible and give a concise update.'
    },
    {
      terms: ['professional communication', 'communicate professionally', 'speak in an interview', 'interview communication', 'nervous in an interview'],
      answer: 'Listen to the full question, pause briefly if needed, then answer clearly and respectfully. Keep examples focused, avoid jargon unless it helps, and ask for clarification when a question is unclear. It is professional to acknowledge what you do not know and explain how you would find out.'
    },
    {
      terms: ['follow-up message', 'follow up after', 'thank you after an interview', 'thank you email after', 'send a thank you', 'after an interview', 'thank-you email', 'follow up email', 'after the interview'],
      answer: 'Send a brief, polite note within a day if appropriate: thank the interviewer for their time, mention a specific topic you appreciated discussing, reaffirm your interest if genuine, and close professionally. Keep it concise, proofread it, and follow any timeline or contact instructions they gave you.'
    },
    {
      terms: ['questions to ask the interviewer', 'questions should i ask', 'ask the interviewer', 'what to ask at the end', 'questions for an interviewer'],
      answer: 'You could ask: \"What would success look like in the first few months?\"; \"How does the team support learning and feedback?\"; \"What projects or responsibilities would this role begin with?\"; or \"What are the next steps in the process?\" Choose questions that are not already answered in the job description or conversation.'
    }
  ];

  function answerQuestion(question) {
    const normalized = question.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').replace(/\s+/g, ' ').trim();
    if (/^(hi|hello|hey)( there)?$/.test(normalized)) return GREETING;
    if (normalized === 'what are you') return knowledge[2].answer;
    const interviewMatch = interviewHelp.find((entry) => entry.terms.some((term) => normalized.includes(term)));
    if (interviewMatch) return interviewMatch.answer;
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
    if (!value) {
      addMessage('Please enter a question about the portfolio.', 'assistant');
      input.focus();
      return;
    }
    addMessage(value, 'user');
    input.value = '';
    input.focus();
    const typing = document.createElement('div');
    typing.className = 'chat-message assistant-message typing-message';
    typing.setAttribute('role', 'status');
    typing.setAttribute('aria-label', 'Assistant is typing');
    typing.innerHTML = '<span class="message-avatar">✳</span><p><i></i><i></i><i></i></p>';
    messages.append(typing);
    messages.scrollTop = messages.scrollHeight;
    const version = conversationVersion;
    window.setTimeout(() => {
      if (version !== conversationVersion) return;
      typing.remove();
      let answer;
      try {
        answer = answerQuestion(value);
      } catch (error) {
        console.error('Portfolio assistant could not process the question.', error);
        answer = 'Sorry, I could not process that question. Please try again.';
      }
      addMessage(answer, 'assistant');
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
