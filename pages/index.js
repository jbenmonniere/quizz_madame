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
      <button class="ghost small" id="logoutBtn" type="button">Deconnexion</button>
    </div>
  </div>
</header>
<nav class="tc-nav" aria-label="Navigation">
  <button class="tab-btn nav-tab active" data-nav="calendar" type="button">Calendrier</button>
  <button class="tab-btn nav-tab" data-nav="builder" type="button">Portail enseignante</button>
  <button class="tab-btn nav-tab" data-nav="quizz" type="button">Quizz</button>
  <button class="tab-btn nav-tab" data-nav="questions" type="button">Questions</button>
  <button class="tab-btn nav-tab" data-nav="rewards" type="button">Recompenses</button>
</nav>

<main class="tc-app">
  <section class="screen active" data-screen="auth">
    <div class="auth-layout">
      <div class="card auth-card">
        <div class="auth-tabs">
          <button class="tab-btn active" data-auth-tab="login" type="button">Connexion</button>
          <button class="tab-btn" data-auth-tab="signup" type="button">Creer un compte</button>
        </div>
        <div class="auth-panel active" data-auth-panel="login">
          <div class="form-row">
            <label>Nom d'utilisateur (pas d'email)</label>
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
            <label>Nom d'utilisateur (pas d'email)</label>
            <input id="signupUsername" autocomplete="username" />
          </div>
          <div class="form-row">
            <label>Mot de passe</label>
            <input type="password" id="signupPassword" autocomplete="new-password" />
          </div>
          <button class="primary" id="signupBtn" type="button">Creer le compte</button>
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
        <h3>Creer une classe</h3>
        <div class="form-row">
          <label>Nom de la classe</label>
          <input id="classNameInput" placeholder="Ex: 5e B" />
        </div>
        <div class="form-row">
          <label>Niveau (optionnel)</label>
          <input id="classLevelInput" placeholder="Ex: 5e" />
        </div>
        <button class="primary" id="createClassBtn" type="button">Creer la classe</button>
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
      <div class="pill" id="questionTimerPill">Question: 00:30</div>
      <div class="pill" id="totalTimerPill">Total: 02:30</div>
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
        <div class="question-category" id="questionCategory">Categorie</div>
        <div class="question-text" id="questionText">Selectionne un jour et tourne la roue.</div>
        <div class="choice-list" id="choiceList"></div>
        <div class="answer-feedback" id="answerFeedback"></div>
      </div>
    </div>

    <div class="finish-banner" id="finishBanner">
      <div>
        <div class="finish-title">Journee terminee !</div>
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
        <button class="tab-btn active" data-teacher-tab="builder" type="button">Portail enseignante</button>
        <button class="tab-btn" data-teacher-tab="quizz" type="button">Quizz</button>
        <button class="tab-btn" data-teacher-tab="questions" type="button">Questions</button>
        <button class="tab-btn" data-teacher-tab="rewards" type="button">Recompenses</button>
      </div>
    </div>

    <div class="teacher-section active" data-teacher-panel="builder">
      <div class="teacher-grid">
      <div class="card teacher-card">
        <h3>Banque de questions</h3>
        <div class="form-row">
          <label>Matiere</label>
          <div class="select" data-select="bankSubjectSelect">
            <button class="select-trigger" type="button" aria-haspopup="listbox" aria-expanded="false">
              <span class="select-value placeholder" data-placeholder="Choisir une matiere">Choisir une matiere</span>
              <span class="select-caret">▾</span>
            </button>
            <div class="select-menu" role="listbox"></div>
            <input type="hidden" id="bankSubjectSelect" value="" />
          </div>
        </div>
        <div class="form-row">
          <label>Sous-theme</label>
          <div class="select" data-select="bankSubthemeSelect">
            <button class="select-trigger" type="button" aria-haspopup="listbox" aria-expanded="false">
              <span class="select-value placeholder" data-placeholder="Choisir un sous-theme">Choisir un sous-theme</span>
              <span class="select-caret">▾</span>
            </button>
            <div class="select-menu" role="listbox"></div>
            <input type="hidden" id="bankSubthemeSelect" value="" />
          </div>
        </div>
        <div class="form-row">
          <label>Question</label>
          <textarea id="bankQuestionInput" placeholder="Enonce de la question"></textarea>
        </div>
        <div class="form-row two-cols">
          <div class="choice-block">
            <label class="choice-label" for="bankCorrectA">
              <input type="radio" name="bankCorrect" id="bankCorrectA" value="0" checked />
              <span class="radio-dot" aria-hidden="true"></span>
              <span>Choix A</span>
            </label>
            <input id="bankChoiceAInput" placeholder="Reponse A" />
          </div>
          <div class="choice-block">
            <label class="choice-label" for="bankCorrectB">
              <input type="radio" name="bankCorrect" id="bankCorrectB" value="1" />
              <span class="radio-dot" aria-hidden="true"></span>
              <span>Choix B</span>
            </label>
            <input id="bankChoiceBInput" placeholder="Reponse B" />
          </div>
        </div>
        <div class="form-row two-cols">
          <div class="choice-block">
            <label class="choice-label" for="bankCorrectC">
              <input type="radio" name="bankCorrect" id="bankCorrectC" value="2" />
              <span class="radio-dot" aria-hidden="true"></span>
              <span>Choix C</span>
            </label>
            <input id="bankChoiceCInput" placeholder="Reponse C" />
          </div>
          <div class="choice-block">
            <label class="choice-label" for="bankCorrectD">
              <input type="radio" name="bankCorrect" id="bankCorrectD" value="3" />
              <span class="radio-dot" aria-hidden="true"></span>
              <span>Choix D</span>
            </label>
            <input id="bankChoiceDInput" placeholder="Reponse D" />
          </div>
        </div>
        <button class="secondary" id="addBankQuestionBtn">Ajouter a la banque</button>
      </div>

      <div class="note" id="teacherMessage"></div>

      <div class="card teacher-card stats-card">
        <h3>Parametres & statistiques</h3>
        <div class="form-row two-cols">
          <div>
            <label>Temps par question (sec)</label>
            <input type="number" id="questionTimeInput" min="5" max="120" value="30" />
          </div>
          <div>
            <label>Temps total (sec)</label>
            <input type="number" id="totalTimeInput" min="30" max="900" value="150" />
          </div>
        </div>
        <button class="secondary" id="saveSettingsBtn">Enregistrer les temps</button>
        <div class="assignment-list" id="weeklyStats"></div>
      </div>
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
                  <input id="quizBankSearchInput" placeholder="Question, matiere ou sous-theme" />
                </div>
                <div class="quiz-filters-row">
                  <div class="quiz-filter">
                    <label>Matiere</label>
                    <div class="select" data-select="quizBankSubjectFilter">
                      <button class="select-trigger" type="button" aria-haspopup="listbox" aria-expanded="false">
                        <span class="select-value" data-placeholder="Toutes les matieres">Toutes les matieres</span>
                        <span class="select-caret">▾</span>
                      </button>
                      <div class="select-menu" role="listbox"></div>
                      <input type="hidden" id="quizBankSubjectFilter" value="all" />
                    </div>
                  </div>
                  <div class="quiz-filter">
                    <label>Sous-theme</label>
                    <div class="select" data-select="quizBankSubthemeFilter">
                      <button class="select-trigger" type="button" aria-haspopup="listbox" aria-expanded="false">
                        <span class="select-value" data-placeholder="Tous les sous-themes">Tous les sous-themes</span>
                        <span class="select-caret">▾</span>
                      </button>
                      <div class="select-menu" role="listbox"></div>
                      <input type="hidden" id="quizBankSubthemeFilter" value="all" />
                    </div>
                  </div>
                  <div class="quiz-filter">
                    <label>Difficulte</label>
                    <div class="select" data-select="quizBankDifficultyFilter">
                      <button class="select-trigger" type="button" aria-haspopup="listbox" aria-expanded="false">
                        <span class="select-value" data-placeholder="Toutes les difficultes">Toutes les difficultes</span>
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
          <h3>Creer un quiz</h3>
          <div class="form-row">
            <label>Titre du quiz</label>
            <input id="quizTitleInput" placeholder="Ex: Les fractions" />
          </div>
          <div class="form-row">
            <label>Date du quiz</label>
            <input type="date" id="quizDateInput" />
          </div>
          <div class="note">Questions selectionnees</div>
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
              <option value="locked">Niveaux verrouilles</option>
              <option value="reward">Avec recompense</option>
              <option value="special">Recompenses speciales</option>
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
              <label>Recompense active</label>
              <label class="switch">
                <input type="checkbox" id="rewardsEnabled" />
                <span class="switch-track"></span>
              </label>
            </div>

            <div class="form-row">
              <label>Type de recompense</label>
              <select id="rewardsType">
                <option value="badge">Badge</option>
                <option value="message">Message de felicitations</option>
                <option value="animation">Animation visuelle</option>
                <option value="privilege">Privilege en classe</option>
              </select>
            </div>

            <div class="form-row">
              <label>Texte de recompense</label>
              <input id="rewardsText" placeholder="Ex: Badge Or" />
            </div>

            <div class="form-row">
              <label>Recompense speciale</label>
              <label class="switch">
                <input type="checkbox" id="rewardsSpecial" />
                <span class="switch-track"></span>
              </label>
            </div>

            <div class="form-row">
              <label>Message personnalise</label>
              <textarea id="rewardsMessage" placeholder="Bravo pour ce niveau !" ></textarea>
            </div>

            <div class="form-row">
              <label>Audio (lien optionnel)</label>
              <input id="rewardsAudio" placeholder="https://..." />
            </div>

            <div class="form-row two-cols">
              <div>
                <label>Theme</label>
                <input id="rewardsTheme" placeholder="Ex: Fractions" />
              </div>
              <div>
                <label>Competence</label>
                <input id="rewardsSkill" placeholder="Ex: Addition" />
              </div>
            </div>

            <div class="form-row">
              <label>Objectif pedagogique</label>
              <input id="rewardsObjective" placeholder="Ex: Maitriser les conversions" />
            </div>

            <div class="rewards-preview">
              <div class="rewards-preview-title">Previsualisation</div>
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

    <div class="teacher-section" data-teacher-panel="questions">
      <div class="card teacher-card">
        <h3>Toutes les questions</h3>
        <div class="form-row actions-row">
          <button class="primary" id="openCreateQuestionBtn">Creer une question</button>
          <button class="secondary" id="openSubjectModalBtn">Creer matiere / sous-theme</button>
        </div>
        <div class="question-header">
          <div class="question-left">
            <span class="question-header-title">Questions</span>
          </div>
          <div class="question-right">
            <div class="question-inline header-grid">
              <div class="header-cell">
                <button class="header-filter-toggle" type="button" data-filter="quizDifficultyFilter">
                  Difficulte
                </button>
                <div class="select select-compact" data-select="quizDifficultyFilter">
                  <button class="select-trigger" type="button" aria-haspopup="listbox" aria-expanded="false">
                    <span class="select-value" data-placeholder="Toutes les difficultes">Toutes les difficultes</span>
                    <span class="select-caret">▾</span>
                  </button>
                  <div class="select-menu" role="listbox"></div>
                  <input type="hidden" id="quizDifficultyFilter" value="all" />
                </div>
              </div>
              <div class="header-cell">
                <button class="header-filter-toggle" type="button" data-filter="quizSubthemeFilter">
                  Sous-theme
                </button>
                <div class="select select-compact" data-select="quizSubthemeFilter">
                  <button class="select-trigger" type="button" aria-haspopup="listbox" aria-expanded="false">
                    <span class="select-value" data-placeholder="Tous les sous-themes">Tous les sous-themes</span>
                    <span class="select-caret">▾</span>
                  </button>
                  <div class="select-menu" role="listbox"></div>
                  <input type="hidden" id="quizSubthemeFilter" value="all" />
                </div>
              </div>
              <div class="header-cell">
                <button class="header-filter-toggle" type="button" data-filter="quizSubjectFilter">
                  Matiere
                </button>
                <div class="select select-compact" data-select="quizSubjectFilter">
                  <button class="select-trigger" type="button" aria-haspopup="listbox" aria-expanded="false">
                    <span class="select-value" data-placeholder="Toutes les matieres">Toutes les matieres</span>
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
      <label>Matiere</label>
      <div class="select" data-select="editSubjectSelect">
        <button class="select-trigger" type="button" aria-haspopup="listbox" aria-expanded="false">
          <span class="select-value" data-placeholder="Choisir une matiere">Choisir une matiere</span>
          <span class="select-caret">▾</span>
        </button>
        <div class="select-menu" role="listbox"></div>
        <input type="hidden" id="editSubjectSelect" value="" />
      </div>
    </div>
    <div class="form-row">
      <label>Sous-theme</label>
      <div class="select" data-select="editSubthemeSelect">
        <button class="select-trigger" type="button" aria-haspopup="listbox" aria-expanded="false">
          <span class="select-value" data-placeholder="Choisir un sous-theme">Choisir un sous-theme</span>
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

<div class="modal" id="subjectModal" aria-hidden="true">
  <div class="modal-backdrop" data-action="close-subject"></div>
  <div class="modal-card">
    <div class="modal-header">
      <h3>Matieres & sous-themes</h3>
      <button class="icon-button" data-action="close-subject" aria-label="Fermer">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18.3 5.71L12 12l6.3 6.29-1.41 1.42L10.59 13.4 4.3 19.7 2.89 18.3 9.17 12 2.89 5.7 4.3 4.29l6.29 6.3 6.3-6.3z"/>
        </svg>
      </button>
    </div>
    <div class="modal-section">
      <h4>Creer une matiere</h4>
      <div class="form-row">
        <label>Matiere</label>
        <input id="newSubjectInput" placeholder="Ex: Arts plastiques" />
      </div>
      <div class="form-row">
        <label>Premier sous-theme</label>
        <input id="newSubjectSubthemeInput" placeholder="Ex: Couleurs" />
      </div>
      <button class="primary" id="createSubjectBtn">Creer la matiere</button>
    </div>
    <div class="modal-divider"></div>
    <div class="modal-section">
      <h4>Ajouter un sous-theme</h4>
      <div class="form-row">
        <label>Matiere</label>
        <div class="select" data-select="addSubthemeSubjectSelect">
          <button class="select-trigger" type="button" aria-haspopup="listbox" aria-expanded="false">
            <span class="select-value" data-placeholder="Choisir une matiere">Choisir une matiere</span>
            <span class="select-caret">▾</span>
          </button>
          <div class="select-menu" role="listbox"></div>
          <input type="hidden" id="addSubthemeSubjectSelect" value="" />
        </div>
      </div>
      <div class="form-row">
        <label>Nouveau sous-theme</label>
        <input id="newSubthemeInput" placeholder="Ex: Lecture" />
      </div>
      <button class="primary" id="addSubthemeBtn">Ajouter le sous-theme</button>
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
