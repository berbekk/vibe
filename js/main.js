document.getElementById('year').textContent = new Date().getFullYear();

const greetBtn = document.getElementById('greet-btn');
const greetMessage = document.getElementById('greet-message');

greetBtn.addEventListener('click', () => {
  const greetings = [
    'Привет! Сайт работает.',
    'Отлично! JavaScript подключён.',
    'Всё в порядке, кнопка отвечает.'
  ];
  const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
  greetMessage.textContent = randomGreeting;
  greetMessage.hidden = false;
});

const contactForm = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');

contactForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const name = document.getElementById('name').value.trim();
  formStatus.textContent = `Спасибо, ${name}! Сообщение получено (тестовый режим).`;
  formStatus.hidden = false;
  contactForm.reset();
});
