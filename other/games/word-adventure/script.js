import React, {
  useState,
  useEffect,
  useCallback,
} from 'https://cdn.skypack.dev/react';
import { render } from 'https://cdn.skypack.dev/react-dom';

// Minimal icon replacements for lucide-react icons
const Icon = ({ label }) => (
  <span className={'icon icon-' + label.toLowerCase()}>{label}</span>
);

const WordsIKAdventure = () => {
  const [gameState, setGameState] = useState('menu');
  const [player, setPlayer] = useState({
    level: 1,
    experience: 0,
    health: 100,
    maxHealth: 100,
    mana: 50,
    maxMana: 50,
    coins: 0,
    streak: 0,
    achievements: [],
  });
  const [currentWorld, setCurrentWorld] = useState({
    language: 'en',
    grade: 1,
  });
  const [questProgress, setQuestProgress] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [enemy, setEnemy] = useState(null);
  const [battlePhase, setBattlePhase] = useState('question');
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [combo, setCombo] = useState(0);
  const [loading, setLoading] = useState(false);
  const [availableContent, setAvailableContent] = useState([]);
  const [lastQuestion, setLastQuestion] = useState(null);

  const gameWorlds = [
    {
      name: 'English Kingdom',
      code: 'en',
      flag: '🏰',
      color: 'blue',
      description: 'Master the realm of English words!',
    },
    {
      name: 'Spanish Empire',
      code: 'es',
      flag: '🏛️',
      color: 'red',
      description: 'Conquer the Spanish territories!',
    },
    {
      name: 'French Château',
      code: 'fr',
      flag: '🗼',
      color: 'purple',
      description: 'Explore the elegant French lands!',
    },
    {
      name: 'Arabic Oasis',
      code: 'ar',
      flag: '🕌',
      color: 'orange',
      description: 'Journey through Arabic wisdom!',
    },
    {
      name: 'Korean Temple',
      code: 'ko',
      flag: '⛩️',
      color: 'green',
      description: 'Discover Korean knowledge!',
    },
  ];

  const enemyTypes = [
    {
      name: 'Vocabulary Goblin',
      type: 'vocabulary',
      health: 30,
      attack: 10,
      emoji: '👹',
      description: 'Tests your word knowledge!',
      loot: { coins: 10, exp: 25 },
    },
    {
      name: 'Grammar Dragon',
      type: 'grammar',
      health: 50,
      attack: 15,
      emoji: '🐲',
      description: 'Breathes grammatical fire!',
      loot: { coins: 20, exp: 40 },
    },
    {
      name: 'Spelling Witch',
      type: 'spelling',
      health: 40,
      attack: 12,
      emoji: '🧙‍♀️',
      description: 'Casts spelling curses!',
      loot: { coins: 15, exp: 30 },
    },
    {
      name: 'Letter Beast',
      type: 'letters',
      health: 25,
      attack: 8,
      emoji: '🦁',
      description: 'Roars with alphabetic fury!',
      loot: { coins: 8, exp: 20 },
    },
  ];

  const loadGameContent = useCallback(
    async (contentType, language, grade, week = 1) => {
      setLoading(true);
      const typeFolder = contentType.toLowerCase();
      const url = `https://raw.githubusercontent.com/Philip-Walsh/wordsIK/main/data/${typeFolder}/${language}/grade-${grade}/week-${week}.json`;
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Content not found');
        const data = await response.json();
        return data;
      } catch {
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const generateFallbackQuestion = () => {
    const fallbackQuestions = [
      {
        question: "What does 'adventure' mean?",
        options: [
          'A boring day',
          'An exciting journey',
          'A type of food',
          'A math problem',
        ],
        correct: 1,
        type: 'vocabulary',
      },
      {
        question: 'Which is the correct spelling?',
        options: ['Recieve', 'Receive', 'Recive', 'Receeve'],
        correct: 1,
        type: 'spelling',
      },
      {
        question: 'What is a noun?',
        options: [
          'An action word',
          'A describing word',
          'A person, place or thing',
          'A connecting word',
        ],
        correct: 2,
        type: 'grammar',
      },
      {
        question: "Which letter comes after 'M'?",
        options: ['L', 'N', 'O', 'P'],
        correct: 1,
        type: 'letters',
      },
    ];
    return fallbackQuestions[
      Math.floor(Math.random() * fallbackQuestions.length)
    ];
  };

  const generateQuestionFromContent = content => {
    if (!content)
      return {
        question: 'Oops! No content for this question type. Moving on!',
        options: ['OK'],
        correct: 0,
        type: 'oops',
      };
    switch (content.type) {
      case 'vocabulary':
        if (content.vocabulary?.words?.length > 0) {
          const word =
            content.vocabulary.words[
              Math.floor(Math.random() * content.vocabulary.words.length)
            ];
          const otherWords = content.vocabulary.words.filter(w => w !== word);
          const wrongAnswers = otherWords.slice(0, 3).map(w => w.definition);
          const options = [word.definition, ...wrongAnswers].slice(0, 4);
          const shuffled = options.sort(() => Math.random() - 0.5);
          return {
            question: 'What does "' + word.word + '" mean?',
            options: shuffled,
            correct: shuffled.indexOf(word.definition),
            type: 'vocabulary',
            word: word.word,
          };
        }
        break;
      case 'spelling':
        if (content.words?.length > 0) {
          const correctWord =
            content.words[Math.floor(Math.random() * content.words.length)];
          const otherWords = content.words.filter(
            w => w.word !== correctWord.word
          );
          const wrongOptions = otherWords.slice(0, 3).map(w => w.word);
          while (wrongOptions.length < 3) {
            const fake = correctWord.word.split('').reverse().join('');
            if (!wrongOptions.includes(fake) && fake !== correctWord.word)
              wrongOptions.push(fake);
            else break;
          }
          const options = [correctWord.word, ...wrongOptions].slice(0, 4);
          const uniqueOptions = Array.from(new Set(options));
          const shuffled = uniqueOptions.sort(() => Math.random() - 0.5);
          return {
            question:
              'How do you spell this word? (Hint: ' +
              (correctWord.definition || 'no hint, a common word') +
              ')',
            options: shuffled,
            correct: shuffled.indexOf(correctWord.word),
            type: 'spelling',
          };
        }
        break;
      case 'grammar':
        if (content.grammar?.rules?.length > 0) {
          // Filter rules to only those with at least one valid practice pair
          const validRules = content.grammar.rules.filter(
            rule =>
              Array.isArray(rule.practice) &&
              rule.practice.some(prac => {
                const [incorrect, correct] = (prac || '')
                  .split('→')
                  .map(s => (s || '').trim());
                return (
                  incorrect &&
                  correct &&
                  incorrect.replace(/\s+/g, '') !== correct.replace(/\s+/g, '')
                );
              })
          );
          if (validRules.length > 0) {
            const rule =
              validRules[Math.floor(Math.random() * validRules.length)];
            // Pick a valid practice pair
            const validPractices = rule.practice.filter(prac => {
              const [incorrect, correct] = (prac || '')
                .split('→')
                .map(s => (s || '').trim());
              return (
                incorrect &&
                correct &&
                incorrect.replace(/\s+/g, '') !== correct.replace(/\s+/g, '')
              );
            });
            if (validPractices.length > 0) {
              const practice =
                validPractices[
                  Math.floor(Math.random() * validPractices.length)
                ];
              const [incorrect, correct] = practice
                .split('→')
                .map(s => s.trim());
              const options = [
                correct,
                incorrect,
                incorrect.charAt(0).toUpperCase() + incorrect.slice(1),
                correct.toLowerCase(),
              ]
                .filter((opt, idx, arr) => arr.indexOf(opt) === idx) // unique
                .sort(() => Math.random() - 0.5);
              return {
                question: `Correct this sentence: "${incorrect}"`,
                options,
                correct: options.indexOf(correct),
                type: 'grammar',
              };
            }
          }
        }
        break;
      case 'letters':
        if (content.vocabulary?.words?.length > 0) {
          const word =
            content.vocabulary.words[
              Math.floor(Math.random() * content.vocabulary.words.length)
            ];
          const correctLetter = word.word[0];
          const otherLetters = content.vocabulary.words
            .map(w => w.word[0])
            .filter(l => l !== correctLetter);
          const wrongOptions = Array.from(new Set(otherLetters)).slice(0, 3);
          const alphabet =
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
          while (wrongOptions.length < 3) {
            const rand = alphabet[Math.floor(Math.random() * alphabet.length)];
            if (!wrongOptions.includes(rand) && rand !== correctLetter)
              wrongOptions.push(rand);
          }
          const options = [correctLetter, ...wrongOptions].slice(0, 4);
          const shuffled = options.sort(() => Math.random() - 0.5);
          return {
            question: `What is the first letter of "${word.word}"?`,
            options: shuffled,
            correct: shuffled.indexOf(correctLetter),
            type: 'letters',
          };
        }
        break;
    }
    return {
      question: 'Oops! No content for this question type. Moving on!',
      options: ['OK'],
      correct: 0,
      type: 'oops',
    };
  };

  const generateEnemy = () => {
    // Only include enemy types for which we have content
    const availableTypes = enemyTypes.filter(type => {
      const content = availableContent.find(
        content => content.type === type.type
      );
      if (!content) return false;
      if (type.type === 'vocabulary' && content.vocabulary?.words?.length > 0)
        return true;
      if (type.type === 'spelling' && content.words?.length > 0) return true;
      if (type.type === 'grammar' && content.grammar?.rules?.length > 0)
        return true;
      if (type.type === 'letters' && content.vocabulary?.words?.length > 0)
        return true;
      return false;
    });
    if (availableTypes.length === 0) {
      return {
        ...enemyTypes[0],
        currentHealth: enemyTypes[0].health,
        question: {
          question: 'Oops! No suitable content for this world. Try another!',
          options: ['OK'],
          correct: 0,
          type: 'oops',
        },
      };
    }
    let tries = 0;
    let enemyTemplate, contentForType, questionObj;
    do {
      enemyTemplate =
        availableTypes[Math.floor(Math.random() * availableTypes.length)];
      contentForType = availableContent.find(
        c => c.type === enemyTemplate.type
      );
      questionObj = generateQuestionFromContent(contentForType);
      tries++;
    } while (
      lastQuestion &&
      questionObj &&
      questionObj.question === lastQuestion &&
      tries < 5
    );
    setLastQuestion(questionObj ? questionObj.question : null);
    return {
      ...enemyTemplate,
      currentHealth: enemyTemplate.health,
      question: questionObj,
    };
  };

  const startQuest = async () => {
    setGameState('playing');
    setBattlePhase('question');
    setQuestProgress(0);
    setCombo(0);
    setLastQuestion(null);
    const contentTypes = ['vocabulary', 'grammar', 'spelling', 'letters'];
    const loadedContent = [];
    for (const type of contentTypes) {
      const data = await loadGameContent(
        type,
        currentWorld.language,
        currentWorld.grade
      );
      if (data) {
        loadedContent.push({ type, ...data });
      }
    }
    setAvailableContent(loadedContent);
    setEnemy(generateEnemy());
    setTimeLeft(15);
  };

  const handleAnswer = answerIndex => {
    setSelectedAnswer(answerIndex);
    setBattlePhase('result');
    if (enemy.question.type === 'oops') {
      setTimeout(() => {
        setEnemy(generateEnemy());
        setBattlePhase('question');
        setSelectedAnswer(null);
        setTimeLeft(15);
      }, 1200);
      return;
    }
    const isCorrect = answerIndex === enemy.question.correct;
    if (isCorrect) {
      const damage = Math.min(20 + combo * 2, enemy.currentHealth);
      const newEnemyHealth = enemy.currentHealth - damage;
      setEnemy(prev => ({ ...prev, currentHealth: newEnemyHealth }));
      setCombo(prev => prev + 1);
      setPlayer(prev => ({
        ...prev,
        experience: prev.experience + 10 + combo,
        coins: prev.coins + 5 + Math.floor(combo / 2),
        streak: prev.streak + 1,
      }));
      if (newEnemyHealth <= 0) {
        setTimeout(() => {
          setQuestProgress(prev => prev + 1);
          if (questProgress + 1 >= 5) {
            setGameState('levelComplete');
          } else {
            setEnemy(generateEnemy());
            setBattlePhase('question');
            setSelectedAnswer(null);
            setTimeLeft(15);
          }
        }, 2000);
      } else {
        setTimeout(() => {
          setBattlePhase('question');
          setSelectedAnswer(null);
          setTimeLeft(15);
        }, 2000);
      }
    } else {
      const damage = enemy.attack;
      setPlayer(prev => ({
        ...prev,
        health: Math.max(0, prev.health - damage),
        streak: 0,
      }));
      setCombo(0);
      setTimeout(() => {
        if (player.health - damage <= 0) {
          setGameState('gameOver');
        } else {
          setBattlePhase('question');
          setSelectedAnswer(null);
          setTimeLeft(15);
        }
      }, 2000);
    }
  };

  useEffect(() => {
    if (battlePhase === 'question' && timeLeft > 0 && gameState === 'playing') {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && battlePhase === 'question') {
      handleAnswer(-1);
    }
  }, [timeLeft, battlePhase, gameState]);

  useEffect(() => {
    const expNeeded = player.level * 100;
    if (player.experience >= expNeeded) {
      setPlayer(prev => ({
        ...prev,
        level: prev.level + 1,
        experience: prev.experience - expNeeded,
        maxHealth: prev.maxHealth + 20,
        health: prev.maxHealth + 20,
        maxMana: prev.maxMana + 10,
        mana: prev.maxMana + 10,
      }));
    }
  }, [player.experience, player.level]);

  const resetGame = () => {
    setPlayer({
      level: 1,
      experience: 0,
      health: 100,
      maxHealth: 100,
      mana: 50,
      maxMana: 50,
      coins: 0,
      streak: 0,
      achievements: [],
    });
    setGameState('menu');
    setQuestProgress(0);
    setCombo(0);
  };

  // --- UI Components ---
  const WorldCard = ({ world }) => (
    <div
      className={
        'section world-card' +
        (currentWorld.language === world.code ? ' selected' : '')
      }
      style={
        currentWorld.language === world.code
          ? {
              border: '2px solid var(--accent)',
              background: 'var(--secondary-bg)',
            }
          : {}
      }
      onClick={() =>
        setCurrentWorld({ language: world.code, grade: currentWorld.grade })
      }
    >
      <div style={{ fontSize: '2em', marginBottom: 8 }}>{world.flag}</div>
      <h3>{world.name}</h3>
      <p style={{ color: 'var(--muted)' }}>{world.description}</p>
    </div>
  );

  // --- Render ---
  if (gameState === 'menu') {
    return (
      <div className="adventure-root">
        <div className="section menu-screen">
          <h1>⚔️ WordsIK Adventure ⚔️</h1>
          <p style={{ color: 'var(--muted)' }}>
            The Ultimate Educational RPG Experience!
          </p>
          <div className="section stats-section">
            <div>
              Level <b>{player.level}</b>
            </div>
            <div className="stats-bar">
              <div
                className="stats-bar-inner"
                style={{
                  width: (player.health / player.maxHealth) * 100 + '%',
                }}
              ></div>
            </div>
            <div>
              Health: {player.health}/{player.maxHealth}
            </div>
            <div>Coins: {player.coins}</div>
            <div>Streak: {player.streak}</div>
            <div className="exp-bar">
              <div
                className="exp-bar-inner"
                style={{
                  width: (player.experience / (player.level * 100)) * 100 + '%',
                }}
              ></div>
            </div>
            <div>
              Experience: {player.experience}/{player.level * 100}
            </div>
          </div>
          <div className="section world-select">
            <h2>Choose Your Kingdom</h2>
            <div>
              {gameWorlds.map(world => (
                <WorldCard key={world.code} world={world} />
              ))}
            </div>
            <div style={{ margin: '16px 0' }}>
              <h3>Select Grade</h3>
              {[1, 2, 3, 4, 5].map(grade => (
                <button
                  key={grade}
                  onClick={() => setCurrentWorld(prev => ({ ...prev, grade }))}
                  style={{
                    marginRight: 8,
                    marginBottom: 8,
                    background:
                      currentWorld.grade === grade
                        ? 'var(--accent)'
                        : 'var(--secondary-bg)',
                    color:
                      currentWorld.grade === grade ? '#232a36' : 'var(--text)',
                  }}
                >
                  Grade {grade}
                </button>
              ))}
            </div>
            <button className="action" onClick={startQuest} disabled={loading}>
              {loading ? 'Loading...' : 'Begin Quest!'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'playing') {
    return (
      <div className="adventure-root">
        <div className="section battle-screen">
          <div className="section stats-section">
            <div>
              Level <b>{player.level}</b>
            </div>
            <div className="stats-bar">
              <div
                className="stats-bar-inner"
                style={{
                  width: (player.health / player.maxHealth) * 100 + '%',
                }}
              ></div>
            </div>
            <div>
              Health: {player.health}/{player.maxHealth}
            </div>
            <div>Coins: {player.coins}</div>
            <div>Streak: {player.streak}</div>
          </div>
          <div className="section enemy-section">
            {enemy && (
              <>
                <div style={{ fontSize: '2em' }}>{enemy.emoji}</div>
                <div>
                  <b>{enemy.name}</b>
                </div>
                <div className="enemy-bar">
                  <div
                    className="enemy-bar-inner"
                    style={{
                      width: (enemy.currentHealth / enemy.health) * 100 + '%',
                    }}
                  ></div>
                </div>
                <div>
                  Health: {enemy.currentHealth}/{enemy.health}
                </div>
                <div style={{ color: 'var(--muted)' }}>{enemy.description}</div>
              </>
            )}
          </div>
          <div className="section question-section">
            {enemy && enemy.question && (
              <>
                <h2>{enemy.question.question}</h2>
                {battlePhase === 'question' && (
                  <div className="answer-group">
                    {enemy.question.options.map((option, index) => (
                      <button
                        key={index}
                        className="answer-btn"
                        onClick={() => handleAnswer(index)}
                      >
                        {String.fromCharCode(65 + index)}. {option}
                      </button>
                    ))}
                  </div>
                )}
                {battlePhase === 'result' && (
                  <div>
                    {selectedAnswer === enemy.question.correct ? (
                      <div className="success">
                        Correct! You dealt{' '}
                        {Math.min(20 + combo * 2, enemy.currentHealth)} damage!
                      </div>
                    ) : (
                      <div className="error">
                        Wrong! You took {enemy.attack} damage! Correct:{' '}
                        {String.fromCharCode(65 + enemy.question.correct)}.{' '}
                        {enemy.question.options[enemy.question.correct]}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
          <div style={{ marginTop: 16 }}>
            <b>Time Left:</b> {timeLeft}s
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'levelComplete') {
    return (
      <div className="adventure-root">
        <div className="section level-complete">
          <h2>🎉 Quest Complete! 🎉</h2>
          <div>Enemies Defeated: {questProgress}</div>
          <div>Best Combo: {combo}</div>
          <div>Streak: {player.streak}</div>
          <div>Level: {player.level}</div>
          <div>Coins: {player.coins}</div>
          <div>Experience: {player.experience}</div>
          <button
            onClick={() => {
              setGameState('menu');
              setPlayer(prev => ({
                ...prev,
                coins: prev.coins + 50,
                experience: prev.experience + 100,
              }));
            }}
          >
            Continue Adventure
          </button>
          <button onClick={resetGame}>New Game</button>
        </div>
      </div>
    );
  }

  if (gameState === 'gameOver') {
    return (
      <div className="adventure-root">
        <div className="section game-over">
          <h2>Game Over</h2>
          <div>Enemies Defeated: {questProgress}</div>
          <div>Best Streak: {player.streak}</div>
          <div>Coins Earned: {player.coins}</div>
          <div>Level Reached: {player.level}</div>
          <button onClick={resetGame}>Play Again</button>
          <button onClick={() => setGameState('menu')}>Main Menu</button>
        </div>
      </div>
    );
  }

  return null;
};

render(<WordsIKAdventure />, document.getElementById('app'));