import Head from "next/head";
import { useEffect } from "react";

const APP_HTML = `
<div class="bg-blob blob-1"></div>
<div class="bg-blob blob-2"></div>
<div class="bg-blob blob-3"></div>

<header class="tc-header">
  <button class="tc-brand tc-brand-btn" id="openTeacher" type="button">
    <div class="tc-logo">QC</div>
    <div>
      <div class="tc-title" id="appTitle">Quiz de Mme Cryshtale</div>
      <div class="tc-subtitle">5 tours par jour · note sur 5</div>
    </div>
  </button>
  <div class="tc-header-right">
    <div class="tc-user" id="activeUserLabel"></div>
    <div class="tc-date" id="activeDateLabel"></div>
    <div class="tc-class-actions">
      <div class="tc-class" id="activeClassLabel"></div>
      <button class="ghost small" id="switchClassBtn" type="button">Mes classes</button>
      <button class="ghost small" id="logoutBtn" type="button">Déconnexion</button>
    </div>
  </div>
</header>
<nav class="tc-nav" aria-label="Navigation">
  <button class="tab-btn nav-tab active" data-nav="calendar" type="button">Calendrier</button>
  <button class="tab-btn nav-tab" data-nav="quizz" type="button">Quizz</button>
  <button class="tab-btn nav-tab" data-nav="questions" type="button">Questions</button>
  <button class="tab-btn nav-tab" data-nav="ai" type="button">IA</button>
  <button class="tab-btn nav-tab" data-nav="stats" type="button">Statistiques</button>
  <button class="tab-btn nav-tab" data-nav="rewards" type="button">Récompenses</button>
</nav>

<main class="tc-app">
  <section class="screen active" data-screen="auth">
    <div class="auth-layout">
      <div class="card auth-card">
        <div class="auth-tabs">
          <button class="tab-btn active" data-auth-tab="login" type="button">Connexion</button>
          <button class="tab-btn" data-auth-tab="signup" type="button">Créer un compte</button>
        </div>
        <div class="auth-panel active" data-auth-panel="login">
          <div class="form-row">
            <label>Nom d'utilisateur (pas d'e-mail)</label>
            <input id="loginUsername" autocomplete="username" />
          </div>
          <div class="form-row">
            <label>Mot de passe</label>
            <input type="password" id="loginPassword" autocomplete="current-password" />
          </div>
          <button class="primary" id="loginBtn" type="button">Se connecter</button>
        </div>
        <div class="auth-panel" data-auth-panel="signup">
          <div class="form-row">
            <label>Nom d'utilisateur (pas d'e-mail)</label>
            <input id="signupUsername" autocomplete="username" />
          </div>
          <div class="form-row">
            <label>Mot de passe</label>
            <input type="password" id="signupPassword" autocomplete="new-password" />
          </div>
          <button class="primary" id="signupBtn" type="button">Créer le compte</button>
        </div>
        <div class="note" id="authMessage"></div>
      </div>
    </div>
  </section>

  <section class="screen" data-screen="classes">
    <div class="class-layout">
      <div class="card class-card">
        <h3>Mes classes</h3>
        <div class="class-list" id="classList"></div>
        <div class="note" id="classMessage"></div>
      </div>
      <div class="card class-card">
        <h3 id="classFormTitle">Créer une classe</h3>
        <div class="form-row">
          <label>Nom de la classe</label>
          <input id="classNameInput" placeholder="Ex: 5e B" />
        </div>
        <div class="form-row">
          <label>Niveau (optionnel)</label>
          <select id="classLevelInput">
            <option value="">Choisir un niveau</option>
            <option value="Maternelle">Maternelle</option>
            <option value="1ère année">1ère année</option>
            <option value="2ème année">2ème année</option>
            <option value="3ème année">3ème année</option>
            <option value="4ème année">4ème année</option>
            <option value="5ème année">5ème année</option>
            <option value="6ème année">6ème année</option>
          </select>
        </div>
        <div class="class-form-actions">
          <button class="primary" id="createClassBtn" type="button">Créer la classe</button>
          <button class="ghost hidden" id="cancelEditClassBtn" type="button">Annuler</button>
        </div>
      </div>
    </div>
  </section>

  <section class="screen" data-screen="calendar">
    <div class="calendar-layout">
      <div class="card calendar-card">
        <div class="calendar-top">
          <button class="icon-btn" id="prevMonth" aria-label="Mois precedent">‹</button>
          <div class="month-label" id="monthLabel"></div>
          <button class="icon-btn" id="nextMonth" aria-label="Mois suivant">›</button>
        </div>
        <div class="weekdays" id="calendarWeekdays"></div>
        <div class="calendar-grid" id="calendarGrid"></div>
      </div>

      <div class="calendar-side">
        <div class="card day-panel day-panel-compact">
          <div class="day-title" id="dayTitle"></div>
        </div>

        <div class="card xp-panel xp-panel-calendar" data-xp-panel>
          <div class="xp-title">Progression EXP</div>
          <div class="xp-balloon">
            <div class="xp-fill" data-xp-fill></div>
            <div class="xp-text" data-xp-text>0 EXP / 200 EXP</div>
          </div>
          <div class="xp-bar">
            <div class="xp-bar-balloon" aria-hidden="true"></div>
            <div class="xp-bar-track">
              <div class="xp-bar-fill"></div>
              <div class="xp-bar-text" data-xp-bar-text>0 / 200</div>
            </div>
          </div>
          <div class="xp-meta">
            <div class="xp-level" data-xp-level>Niveau 1</div>
            <div class="xp-gain" data-xp-gain>+0 EXP</div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="screen" data-screen="game">
    <div class="game-top">
      <button class="ghost" id="backToCalendar">Calendrier</button>
      <div class="pill" id="roundPill">Ronde 1/5</div>
      <div class="pill" id="scorePill">Score 0/5</div>
    </div>

    <div class="game-grid">
      <div class="card wheel-card">
        <div class="section-title">Tourne la roue</div>
        <div class="wheel-wrap">
          <div class="pointer"></div>
          <div class="wheel" id="wheel">
            <svg class="wheel-svg" id="wheelSvg" viewBox="0 0 100 100" aria-hidden="true"></svg>
            <div class="wheel-labels" id="wheelLabels"></div>
          </div>
          <button class="spin-btn" id="spinBtn">SPIN</button>
        </div>
        <div class="progress-dots" id="progressDots"></div>
        <div class="wheel-note" id="wheelNote">Tourne la roue pour commencer.</div>
      </div>

      <div class="card question-card">
        <div class="wrong-x" id="wrongX" aria-hidden="true">X</div>
        <div class="question-category" id="questionCategory">Catégorie</div>
        <div class="question-text" id="questionText">Sélectionne un jour et tourne la roue.</div>
        <div class="choice-list" id="choiceList"></div>
        <div class="answer-feedback" id="answerFeedback"></div>
      </div>
    </div>

    <div class="finish-banner" id="finishBanner">
      <div>
        <div class="finish-title">Journée terminée !</div>
        <div class="finish-score" id="finishScore">Note finale: 0/5</div>
      </div>
      <div class="xp-panel xp-panel-compact" data-xp-panel>
        <div class="xp-title">Progression EXP</div>
        <div class="xp-balloon">
          <div class="xp-fill" data-xp-fill></div>
          <div class="xp-text" data-xp-text>0 EXP / 200 EXP</div>
        </div>
        <div class="xp-bar">
          <div class="xp-bar-balloon" aria-hidden="true"></div>
          <div class="xp-bar-track">
            <div class="xp-bar-fill"></div>
            <div class="xp-bar-text" data-xp-bar-text>0 / 200</div>
          </div>
        </div>
        <div class="xp-meta">
          <div class="xp-level" data-xp-level>Niveau 1</div>
          <div class="xp-gain" data-xp-gain>+0 EXP</div>
        </div>
      </div>
      <button class="primary" id="finishBack">Retour au calendrier</button>
    </div>
  </section>

  <section class="screen" data-screen="teacher">
    <div class="teacher-top">
      <button class="ghost" id="backToCalendarFromTeacher">Calendrier</button>
      <div class="teacher-tabs">
        <button class="tab-btn" data-teacher-tab="quizz" type="button">Quizz</button>
        <button class="tab-btn active" data-teacher-tab="questions" type="button">Questions</button>
        <button class="tab-btn" data-teacher-tab="ai" type="button">IA</button>
        <button class="tab-btn" data-teacher-tab="stats" type="button">Statistiques</button>
        <button class="tab-btn" data-teacher-tab="rewards" type="button">Récompenses</button>
      </div>
    </div>

    <div class="teacher-section" data-teacher-panel="quizz">
      <div class="card teacher-card">
        <h3>Tous les quizz</h3>
        <div class="form-row">
          <label>Recherche</label>
          <input id="quizSearchInput" placeholder="Titre ou date" />
        </div>
        <div class="quiz-list" id="quizList"></div>
        <div class="quiz-list-footer" id="quizMore">
          <button class="secondary" id="quizMoreBtn">Voir plus</button>
        </div>
      </div>
      <div class="quiz-grid">
        <div class="card teacher-card">
          <h3>Questions</h3>
          <div class="quiz-questions-layout">
            <div class="quiz-questions">
              <div class="quiz-bank-header">
                <div class="quiz-search-row">
                  <label>Recherche</label>
                  <input id="quizBankSearchInput" placeholder="Question, matière ou sous-thème" />
                </div>
                <div class="quiz-filters-row">
                  <div class="quiz-filter">
                    <label>Matière</label>
                    <div class="select" data-select="quizBankSubjectFilter">
                      <button class="select-trigger" type="button" aria-haspopup="listbox" aria-expanded="false">
                        <span class="select-value" data-placeholder="Toutes les matières">Toutes les matières</span>
                        <span class="select-caret">▾</span>
                      </button>
                      <div class="select-menu" role="listbox"></div>
                      <input type="hidden" id="quizBankSubjectFilter" value="all" />
                    </div>
                  </div>
                  <div class="quiz-filter">
                    <label>Sous-thème</label>
                    <div class="select" data-select="quizBankSubthemeFilter">
                      <button class="select-trigger" type="button" aria-haspopup="listbox" aria-expanded="false">
                        <span class="select-value" data-placeholder="Tous les sous-thèmes">Tous les sous-thèmes</span>
                        <span class="select-caret">▾</span>
                      </button>
                      <div class="select-menu" role="listbox"></div>
                      <input type="hidden" id="quizBankSubthemeFilter" value="all" />
                    </div>
                  </div>
                  <div class="quiz-filter">
                    <label>Difficulté</label>
                    <div class="select" data-select="quizBankDifficultyFilter">
                      <button class="select-trigger" type="button" aria-haspopup="listbox" aria-expanded="false">
                        <span class="select-value" data-placeholder="Toutes les difficultés">Toutes les difficultés</span>
                        <span class="select-caret">▾</span>
                      </button>
                      <div class="select-menu" role="listbox"></div>
                      <input type="hidden" id="quizBankDifficultyFilter" value="all" />
                    </div>
                  </div>
                </div>
              </div>
              <div class="note">Glisse les questions vers le quiz.</div>
              <div class="question-list compact drag-list" id="quizBankList"></div>
              <div class="quiz-bank-footer" id="quizBankMore">
                <button class="secondary" id="quizBankMoreBtn">Voir plus</button>
              </div>
            </div>
          </div>
        </div>
        <div class="card teacher-card">
          <h3>Créer un quiz</h3>
          <div class="form-row">
            <label>Titre du quiz</label>
            <input id="quizTitleInput" placeholder="Ex: Les fractions" />
          </div>
          <div class="form-row">
            <label>Date du quiz</label>
            <input type="date" id="quizDateInput" />
          </div>
          <div class="note">Questions sélectionnées</div>
          <div class="question-list compact drag-list" id="selectedQuestionList"></div>
          <div class="drop-zone" id="quizDropZone">
            Glisse plusieurs questions ici pour composer le quiz.
          </div>
          <button class="primary" id="saveQuizBtn">Enregistrer le quiz</button>
          <div class="note" id="quizMessage"></div>
        </div>
      </div>
    </div>

    <div class="teacher-section" data-teacher-panel="rewards">
      <div class="rewards-layout">
        <div class="card rewards-card">
          <h3>Progression globale</h3>
          <div class="xp-bar rewards-global-bar">
            <div class="xp-bar-balloon" aria-hidden="true"></div>
            <div class="xp-bar-track">
              <div class="xp-bar-fill"></div>
              <div class="xp-bar-text" id="rewardsGlobalText">0 / 0 EXP</div>
            </div>
          </div>
          <div class="form-row">
            <label>Filtrer</label>
            <select id="rewardsFilter">
              <option value="all">Tous les niveaux</option>
              <option value="unlocked">Niveaux actifs</option>
              <option value="locked">Niveaux verrouillés</option>
              <option value="reward">Avec récompense</option>
              <option value="special">Récompenses spéciales</option>
            </select>
          </div>
          <div class="rewards-grid" id="rewardsGrid"></div>
        </div>

        <div class="card rewards-card">
          <h3>Configuration du niveau</h3>
          <div class="rewards-editor">
            <div class="rewards-header">
              <div class="rewards-level" id="rewardsLevelLabel">Niveau 1</div>
              <div class="rewards-status" id="rewardsStatusLabel">En cours</div>
            </div>

            <div class="form-row">
              <label>Récompense active</label>
              <label class="switch">
                <input type="checkbox" id="rewardsEnabled" />
                <span class="switch-track"></span>
              </label>
            </div>

            <div class="form-row">
              <label>Type de récompense</label>
              <select id="rewardsType">
                <option value="badge">Badge</option>
                <option value="message">Message de félicitations</option>
                <option value="animation">Animation visuelle</option>
                <option value="privilege">Privilège en classe</option>
              </select>
            </div>

            <div class="form-row">
              <label>Texte de récompense</label>
              <input id="rewardsText" placeholder="Ex: Badge Or" />
            </div>

            <div class="form-row">
              <label>Récompense spéciale</label>
              <label class="switch">
                <input type="checkbox" id="rewardsSpecial" />
                <span class="switch-track"></span>
              </label>
            </div>

            <div class="form-row">
              <label>Message personnalisé</label>
              <textarea id="rewardsMessage" placeholder="Bravo pour ce niveau !" ></textarea>
            </div>

            <div class="form-row">
              <label>Audio (lien optionnel)</label>
              <input id="rewardsAudio" placeholder="https://..." />
            </div>

            <div class="form-row two-cols">
              <div>
                <label>Thème</label>
                <input id="rewardsTheme" placeholder="Ex: Fractions" />
              </div>
              <div>
                <label>Compétence</label>
                <input id="rewardsSkill" placeholder="Ex: Addition" />
              </div>
            </div>

            <div class="form-row">
              <label>Objectif pédagogique</label>
              <input id="rewardsObjective" placeholder="Ex: Maitriser les conversions" />
            </div>

            <div class="rewards-preview">
              <div class="rewards-preview-title">Prévisualisation</div>
              <div class="rewards-preview-card">
                <div class="rewards-preview-header">Niveau supérieur</div>
                <div class="rewards-preview-level" id="rewardsPreviewLevel">Niveau 1</div>
                <div class="rewards-preview-reward" id="rewardsPreviewReward"></div>
                <div class="rewards-preview-meta" id="rewardsPreviewMeta"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="teacher-section active" data-teacher-panel="questions">
      <div class="card teacher-card">
        <h3>Toutes les questions</h3>
        <div class="form-row actions-row">
          <button class="primary" id="openCreateQuestionBtn">Créer une question</button>
          <button class="secondary" id="openSubjectModalBtn">Créer matière / sous-thème</button>
        </div>
        <div class="question-header">
          <div class="question-left">
            <span class="question-header-title">Questions</span>
          </div>
          <div class="question-right">
            <div class="question-inline header-grid">
              <div class="header-cell">
                <button class="header-filter-toggle" type="button" data-filter="quizDifficultyFilter">
                  Difficulté
                </button>
                <div class="select select-compact" data-select="quizDifficultyFilter">
                  <button class="select-trigger" type="button" aria-haspopup="listbox" aria-expanded="false">
                    <span class="select-value" data-placeholder="Toutes les difficultés">Toutes les difficultés</span>
                    <span class="select-caret">▾</span>
                  </button>
                  <div class="select-menu" role="listbox"></div>
                  <input type="hidden" id="quizDifficultyFilter" value="all" />
                </div>
              </div>
              <div class="header-cell">
                <button class="header-filter-toggle" type="button" data-filter="quizSubthemeFilter">
                  Sous-thème
                </button>
                <div class="select select-compact" data-select="quizSubthemeFilter">
                  <button class="select-trigger" type="button" aria-haspopup="listbox" aria-expanded="false">
                    <span class="select-value" data-placeholder="Tous les sous-thèmes">Tous les sous-thèmes</span>
                    <span class="select-caret">▾</span>
                  </button>
                  <div class="select-menu" role="listbox"></div>
                  <input type="hidden" id="quizSubthemeFilter" value="all" />
                </div>
              </div>
              <div class="header-cell">
                <button class="header-filter-toggle" type="button" data-filter="quizSubjectFilter">
                  Matière
                </button>
                <div class="select select-compact" data-select="quizSubjectFilter">
                  <button class="select-trigger" type="button" aria-haspopup="listbox" aria-expanded="false">
                    <span class="select-value" data-placeholder="Toutes les matières">Toutes les matières</span>
                    <span class="select-caret">▾</span>
                  </button>
                  <div class="select-menu" role="listbox"></div>
                  <input type="hidden" id="quizSubjectFilter" value="all" />
                </div>
              </div>
              <div class="header-cell header-actions" aria-hidden="true"></div>
            </div>
          </div>
        </div>
        <div class="note">Utilise "Modifier" pour corriger, la poubelle pour supprimer.</div>
        <div class="question-list compact" id="bankList"></div>
      </div>
    </div>

    <div class="teacher-section" data-teacher-panel="ai">
      <div class="ai-layout">
        <div class="card teacher-card ai-card">
          <h3>Générateur IA</h3>
          <div class="form-row">
            <label>Matière</label>
            <div class="select" data-select="aiSubjectSelect">
              <button class="select-trigger" type="button" aria-haspopup="listbox" aria-expanded="false">
                <span class="select-value placeholder" data-placeholder="Choisir une matière">Choisir une matière</span>
                <span class="select-caret">▾</span>
              </button>
              <div class="select-menu" role="listbox"></div>
              <input type="hidden" id="aiSubjectSelect" value="" />
            </div>
          </div>
          <div class="form-row">
            <label>Sous-thème</label>
            <div class="select" data-select="aiSubthemeSelect">
              <button class="select-trigger" type="button" aria-haspopup="listbox" aria-expanded="false">
                <span class="select-value placeholder" data-placeholder="Choisir un sous-thème">Choisir un sous-thème</span>
                <span class="select-caret">▾</span>
              </button>
              <div class="select-menu" role="listbox"></div>
              <input type="hidden" id="aiSubthemeSelect" value="" />
            </div>
          </div>
          <div class="form-row">
            <label>Décris ce que tu as vu en classe</label>
            <textarea id="aiPromptInput" placeholder="Ex: Nous avons vu les fractions simples et les parts d’un tout."></textarea>
          </div>
          <button class="secondary" id="aiGenerateBtn" type="button">Générer 10 questions</button>
          <div class="note" id="aiMessage"></div>
        </div>

        <div class="card teacher-card ai-card">
          <h3>Propositions</h3>
          <div class="ai-actions">
            <button class="ghost small" id="aiSelectAll" type="button">Tout sélectionner</button>
            <button class="ghost small" id="aiSelectNone" type="button">Tout désélectionner</button>
          </div>
          <div class="ai-list" id="aiResults"></div>
          <button class="primary" id="aiAddBtn" type="button">Ajouter à la banque</button>
        </div>
      </div>
    </div>

    <div class="teacher-section" data-teacher-panel="stats">
      <div class="stats-layout">
        <div class="card stats-filters" id="statsFilters">
          <h3>Période</h3>
          <div class="stats-filter-grid">
            <div class="form-row">
              <label>Période</label>
              <div class="select" data-select="statsPeriodSelect">
                <button class="select-trigger" type="button" aria-haspopup="listbox" aria-expanded="false">
                  <span class="select-value placeholder" data-placeholder="Choisir">Choisir</span>
                  <span class="select-caret">▾</span>
                </button>
                <div class="select-menu" role="listbox"></div>
                <input type="hidden" id="statsPeriodSelect" value="last7" />
              </div>
            </div>
          </div>

          <div class="stats-filter-grid" id="statsCustomRow" style="display:none;">
            <div class="form-row">
              <label>Début</label>
              <input type="date" id="statsCustomStart" />
            </div>
            <div class="form-row">
              <label>Fin</label>
              <input type="date" id="statsCustomEnd" />
            </div>
          </div>

        </div>

        <div class="stats-kpis" id="statsKpiRow"></div>

        <div class="card stats-card">
          <div class="stats-card-header">
            <h3>Forces vs faiblesses</h3>
            <div class="stats-toggle">
              <button class="tab-btn small active" data-stats-toggle="accuracy" type="button">Réussite</button>
              <button class="tab-btn small" data-stats-toggle="weighted" type="button">Score pondéré</button>
            </div>
          </div>
          <div class="stats-radar-wrap">
            <svg id="statsRadarChart"></svg>
            <div class="stats-radar-tooltip" id="statsRadarTooltip" aria-hidden="true"></div>
          </div>
          <div class="stats-radar-summary">
            <div>
              <h4>Top 3 forces</h4>
              <ul id="statsTopStrengths"></ul>
            </div>
            <div>
              <h4>Top 3 à travailler</h4>
              <ul id="statsTopWeaknesses"></ul>
            </div>
            <div class="stats-summary-tooltip" id="statsSummaryTooltip" aria-hidden="true"></div>
          </div>
        </div>

        <div class="card stats-card stats-insights">
          <div class="stats-insights-header">
            <div>
              <h3>Diagnostic pédagogique</h3>
              <p class="note">Lecture rapide des points forts et des priorités pour la prochaine séance.</p>
            </div>
          </div>
          <div class="stats-insight-grid">
            <div class="insight-card">
              <div class="insight-card-header">
                <span class="insight-icon">✨</span>
                <div>
                  <h4>Forces</h4>
                  <p class="note">Ce qui fonctionne déjà bien.</p>
                </div>
              </div>
              <ul id="statsStrengthList"></ul>
              <div class="insight-actions">
                <button class="ghost small" id="statsRevisionBtn" type="button">Lancer révision ciblée</button>
              </div>
            </div>
            <div class="insight-card">
              <div class="insight-card-header">
                <span class="insight-icon">🎯</span>
                <div>
                  <h4>À renforcer</h4>
                  <p class="note">Priorités pour progresser.</p>
                </div>
              </div>
              <ul id="statsWeakList"></ul>
              <div class="insight-actions">
                <button class="ghost small" id="statsWeakBtn" type="button">Générer mini-quiz</button>
              </div>
            </div>
            <div class="insight-card">
              <div class="insight-card-header">
                <span class="insight-icon">🧠</span>
                <div>
                  <h4>Notions fragiles</h4>
                  <p class="note">Notions à retravailler.</p>
                </div>
              </div>
              <ul id="statsCommonMistakes"></ul>
              <div class="insight-actions">
                <button class="ghost small" id="statsMistakesBtn" type="button">Recommander activité</button>
              </div>
            </div>
            <div class="insight-card">
              <div class="insight-card-header">
                <span class="insight-icon">🧩</span>
                <div>
                  <h4>Questions difficiles</h4>
                  <p class="note">Questions qui posent problème.</p>
                </div>
              </div>
              <ul id="statsHardQuestions"></ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</main>

<div class="modal" id="editModal" aria-hidden="true">
  <div class="modal-backdrop" data-action="close-edit"></div>
  <div class="modal-card">
    <div class="modal-header">
      <h3>Modifier la question</h3>
      <button class="icon-button" data-action="close-edit" aria-label="Fermer">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18.3 5.71L12 12l6.3 6.29-1.41 1.42L10.59 13.4 4.3 19.7 2.89 18.3 9.17 12 2.89 5.7 4.3 4.29l6.29 6.3 6.3-6.3z"/>
        </svg>
      </button>
    </div>
    <div class="form-row">
      <label>Matière</label>
      <div class="select" data-select="editSubjectSelect">
        <button class="select-trigger" type="button" aria-haspopup="listbox" aria-expanded="false">
          <span class="select-value" data-placeholder="Choisir une matière">Choisir une matière</span>
          <span class="select-caret">▾</span>
        </button>
        <div class="select-menu" role="listbox"></div>
        <input type="hidden" id="editSubjectSelect" value="" />
      </div>
    </div>
    <div class="form-row">
      <label>Sous-thème</label>
      <div class="select" data-select="editSubthemeSelect">
        <button class="select-trigger" type="button" aria-haspopup="listbox" aria-expanded="false">
          <span class="select-value" data-placeholder="Choisir un sous-thème">Choisir un sous-thème</span>
          <span class="select-caret">▾</span>
        </button>
        <div class="select-menu" role="listbox"></div>
        <input type="hidden" id="editSubthemeSelect" value="" />
      </div>
    </div>
    <div class="form-row">
      <label>Question</label>
      <textarea id="editQuestionInput" placeholder="Enonce de la question"></textarea>
    </div>
    <div class="form-row two-cols">
      <div class="choice-block">
        <label class="choice-label" for="editCorrectA">
          <input type="radio" name="editCorrect" id="editCorrectA" value="0" />
          <span class="radio-dot" aria-hidden="true"></span>
          <span>Choix A</span>
        </label>
        <input id="editChoiceAInput" placeholder="Reponse A" />
      </div>
      <div class="choice-block">
        <label class="choice-label" for="editCorrectB">
          <input type="radio" name="editCorrect" id="editCorrectB" value="1" />
          <span class="radio-dot" aria-hidden="true"></span>
          <span>Choix B</span>
        </label>
        <input id="editChoiceBInput" placeholder="Reponse B" />
      </div>
    </div>
    <div class="form-row two-cols">
      <div class="choice-block">
        <label class="choice-label" for="editCorrectC">
          <input type="radio" name="editCorrect" id="editCorrectC" value="2" />
          <span class="radio-dot" aria-hidden="true"></span>
          <span>Choix C</span>
        </label>
        <input id="editChoiceCInput" placeholder="Reponse C" />
      </div>
      <div class="choice-block">
        <label class="choice-label" for="editCorrectD">
          <input type="radio" name="editCorrect" id="editCorrectD" value="3" />
          <span class="radio-dot" aria-hidden="true"></span>
          <span>Choix D</span>
        </label>
        <input id="editChoiceDInput" placeholder="Reponse D" />
      </div>
    </div>
    <div class="modal-actions">
      <button class="ghost" type="button" data-action="close-edit">Annuler</button>
      <button class="primary" id="saveEditBtn">Enregistrer</button>
    </div>
  </div>
</div>

<div class="modal" id="aiConfirmModal" aria-hidden="true">
  <div class="modal-backdrop" data-ai-confirm="close"></div>
  <div class="modal-card">
    <div class="modal-header">
      <h3>Questions ajoutées</h3>
    </div>
    <div class="modal-section">
      <p id="aiConfirmText">Questions ajoutées à la banque.</p>
    </div>
    <div class="modal-actions">
      <button class="primary" id="aiConfirmOk" type="button">OK</button>
    </div>
  </div>
</div>

<div class="modal" id="statsDetailModal" aria-hidden="true">
  <div class="modal-backdrop" data-stats-detail="close"></div>
  <div class="modal-card">
    <div class="modal-header">
      <h3 id="statsDetailTitle">Détail</h3>
    </div>
    <div class="modal-section">
      <div class="note" id="statsDetailFormula"></div>
      <div class="stats-detail-value" id="statsDetailValue"></div>
      <div class="note" id="statsDetailTrend"></div>
    </div>
    <div class="modal-section">
      <h4>Ventilation par matière</h4>
      <ul id="statsDetailBreakdown"></ul>
    </div>
    <div class="modal-actions">
      <button class="primary" id="statsDetailOk" type="button">OK</button>
    </div>
  </div>
</div>

<div class="modal" id="statsScheduleModal" aria-hidden="true">
  <div class="modal-backdrop" data-stats-schedule="close"></div>
  <div class="modal-card">
    <div class="modal-header">
      <h3 id="statsScheduleTitle">Planifier une révision</h3>
    </div>
    <div class="modal-section">
      <p class="note" id="statsScheduleSubtitle">Choisis une date pour la planification.</p>
    </div>
    <div class="form-row">
      <label>Date</label>
      <input type="date" id="statsScheduleDate" />
    </div>
    <div class="modal-actions">
      <button class="ghost" id="statsScheduleCancel" type="button">Annuler</button>
      <button class="primary" id="statsScheduleConfirm" type="button">Planifier</button>
    </div>
  </div>
</div>

<div class="modal" id="subjectModal" aria-hidden="true">
  <div class="modal-backdrop" data-action="close-subject"></div>
  <div class="modal-card">
    <div class="modal-header">
      <h3>Matières & sous-thèmes</h3>
      <button class="icon-button" data-action="close-subject" aria-label="Fermer">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18.3 5.71L12 12l6.3 6.29-1.41 1.42L10.59 13.4 4.3 19.7 2.89 18.3 9.17 12 2.89 5.7 4.3 4.29l6.29 6.3 6.3-6.3z"/>
        </svg>
      </button>
    </div>
    <div class="modal-section">
      <h4>Créer une matière</h4>
      <div class="form-row">
        <label>Matière</label>
        <input id="newSubjectInput" placeholder="Ex: Arts plastiques" />
      </div>
      <div class="form-row">
        <label>Premier sous-thème</label>
        <input id="newSubjectSubthemeInput" placeholder="Ex: Couleurs" />
      </div>
      <button class="primary" id="createSubjectBtn">Créer la matière</button>
    </div>
    <div class="modal-divider"></div>
    <div class="modal-section">
      <h4>Ajouter un sous-thème</h4>
      <div class="form-row">
        <label>Matière</label>
        <div class="select" data-select="addSubthemeSubjectSelect">
          <button class="select-trigger" type="button" aria-haspopup="listbox" aria-expanded="false">
            <span class="select-value" data-placeholder="Choisir une matière">Choisir une matière</span>
            <span class="select-caret">▾</span>
          </button>
          <div class="select-menu" role="listbox"></div>
          <input type="hidden" id="addSubthemeSubjectSelect" value="" />
        </div>
      </div>
      <div class="form-row">
        <label>Nouveau sous-thème</label>
        <input id="newSubthemeInput" placeholder="Ex: Lecture" />
      </div>
      <button class="primary" id="addSubthemeBtn">Ajouter le sous-thème</button>
    </div>
    <div class="note" id="subjectModalMessage"></div>
  </div>
</div>

<div class="confetti-layer" id="confettiLayer" aria-hidden="true"></div>
<div class="xp-transfer-layer" id="xpTransferLayer" aria-hidden="true"></div>
<div class="levelup-modal" id="levelUpModal" aria-hidden="true">
  <div class="levelup-backdrop" data-levelup-close></div>
  <div class="levelup-card" role="dialog" aria-modal="true" aria-labelledby="levelUpTitle">
    <div class="levelup-glow"></div>
    <div class="levelup-crown">★</div>
    <div class="levelup-title" id="levelUpTitle">Niveau supérieur</div>
    <div class="levelup-level" id="levelUpValue">Niveau 1</div>
    <div class="levelup-reward" id="levelUpReward"></div>
    <div class="levelup-meta" id="levelUpMeta"></div>
    <div class="levelup-sub">Bravo ! Tu passes au niveau suivant.</div>
    <button class="primary" type="button" id="levelUpClose">Continuer</button>
  </div>
</div>
`;

export default function Home() {
  useEffect(() => {
    const load = async () => {
      await import("../src/client/data");
      if (window.DataStore?.ready) {
        await window.DataStore.ready;
      }
      await import("../src/client/app");
    };
    load();
  }, []);

  return (
    <>
      <Head>
        <title>Classe de Mme Cryshtale - Quiz du Jour</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="stylesheet" href="/styles.css" />
      </Head>
      <div dangerouslySetInnerHTML={{ __html: APP_HTML }} />
    </>
  );
}
