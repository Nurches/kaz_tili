import React from "react";
import "./HomePage.css";

interface HomePageProps {
  onStartLearning: () => void;
}

const oldWords = [
  "ләззат",
  "ғибрат",
  "жәдігер",
  "бабалар аманаты",
  "көкейкесті",
  "зәру",
];

const features = [
  "Көне және сирек сөздердің мағынасын түсіндіру",
  "Жасанды интеллект арқылы кеңейтілген талдау",
  "Аударма, мысал, синоним және омоним ұсыну",
  "Сөзді контекстпен оқуға арналған қолданбалы формат",
];

const principles = [
  "Тілдік мұраны сақтап, күнделікті қолданысқа жақындату",
  "Жастарға қазақ сөзінің тереңдігін жеңіл жолмен түсіндіру",
  "Сөзді жай аудармамен шектемей, ой мен мәдениетпен беру",
];

const HomePage: React.FC<HomePageProps> = ({ onStartLearning }) => {
  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero-glow home-hero-glow-left" />
        <div className="home-hero-glow home-hero-glow-right" />

        <div className="home-hero-inner">
          <p className="home-kicker">Қазақ тіліне құрмет</p>
          <h2 className="home-title">Көне сөзді таны, тілді терең түсін</h2>
          <p className="home-subtitle">
            «Сөзім» платформасының миссиясы: адамдарға қазақ тілін көне, терең
            және сирек сөздер арқылы үйрету.
          </p>

          <div className="home-hero-actions">
            <button className="home-cta-primary" onClick={onStartLearning}>
              Үйренуді бастау
            </button>
            <a href="#home-mission" className="home-cta-secondary">
              Төмен сырғытып оқу
            </a>
          </div>
        </div>
      </section>

      <section id="home-mission" className="home-section">
        <h3 className="home-section-title">Біздің миссия</h3>
        <p className="home-section-text">
          Біз қазақ тілін тек сөздік деңгейінде емес, ұлттық ойлау, тарих және
          мәдени сана деңгейінде танытуды мақсат етеміз. Әр сөздің астарында
          дәуірдің ізі, халықтың дүниетанымы, ұрпақтың тәжірибесі бар.
        </p>
        <div className="home-grid">
          {principles.map((item) => (
            <article className="home-card" key={item}>
              <p>{item}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section home-section-alt">
        <h3 className="home-section-title">Көне сөздер неге маңызды?</h3>
        <p className="home-section-text">
          Көне сөздер тілдің байлығын ашады, ойды дәл жеткізуге көмектеседі және
          ұлттық болмысты нығайтады. Осындай сөздерді меңгеру арқылы сөйлеу
          мәдениеті де, мәтін түсіну қабілеті де артады.
        </p>
        <div className="home-pills">
          {oldWords.map((word) => (
            <span className="home-pill" key={word}>
              {word}
            </span>
          ))}
        </div>
      </section>

      <section className="home-section">
        <h3 className="home-section-title">Платформа мүмкіндіктері</h3>
        <div className="home-grid">
          {features.map((item) => (
            <article className="home-card home-card-strong" key={item}>
              <p>{item}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section home-team">
        <h3 className="home-section-title">Жобаны жасаушылар</h3>
        <p className="home-section-text">
          Бұл платформаны Қазақстан-Британ техникалық университетінің
          студенттері әзірледі. Басты мақсатымыз: қазақ тіліне технология
          арқылы жаңа дем беру.
        </p>
        <blockquote className="home-quote">
          «Бүгін үйренген көне сөз ертеңгі ұрпақтың ойын байытады».
        </blockquote>
      </section>
    </div>
  );
};

export default HomePage;
