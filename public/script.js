class DebateApp {
    constructor() {
        this.currentPhase = 0;
        this.speeches = [];
        this.debaters = {};
        this.currentSpeaker = '';
        this.topic = '';

        this.phases = [
            {name: "Team A Constructive", time: 4},
            {name: "Team B Constructive", time: 4},
            {name: "Crossfire", time: 3},
            {name: "Team A Rebuttal", time: 4},
            {name: "Team B Rebuttal", time: 4},
            {name: "Second Crossfire", time: 3},
            {name: "Team A Summary", time: 2},
            {name: "Team B Summary", time: 2},
            {name: "Final Focus A", time: 2},
            {name: "Final Focus B", time: 2}
        ];

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        document.getElementById('startDebate').addEventListener('click', () => this.startDebate());
        document.getElementById('submitSpeech').addEventListener('click', () => this.submitSpeech());
        document.getElementById('newDebate').addEventListener('click', () => this.resetDebate());
    }

    async startDebate() {
        const debater1 = document.getElementById('debater1').value;
        const debater2 = document.getElementById('debater2').value;

        if (!debater1 || !debater2) {
            alert('Please enter names for both debaters');
            return;
        }

        this.debaters = { A: debater1, B: debater2 };

        this.topic = await this.getTopicFromAI();

        document.getElementById('setup').classList.add('hidden');
        document.getElementById('debate').classList.remove('hidden');
        document.getElementById('topic').textContent = `Topic: ${this.topic}`;

        this.startPhase();
    }

    async getTopicFromAI() {
        try {
            const response = await fetch('/api/get-topic', { method: 'POST' });
            const data = await response.json();
            return data.topic;
        } catch (error) {
            console.error(error);
            return 'Resolved: Social media is beneficial to democratic societies.';
        }
    }

    startPhase() {
        const phase = this.phases[this.currentPhase];
        document.getElementById('currentSpeaker').textContent =
            `Current Speaker: ${phase.name} (${phase.time} minutes)`;
        this.startTimer(phase.time * 60);
    }

    startTimer(seconds) {
        const timerElement = document.getElementById('timer');
        let timeLeft = seconds;
        const timer = setInterval(() => {
            const minutes = Math.floor(timeLeft / 60);
            const secs = timeLeft % 60;
            timerElement.textContent = `${minutes}:${secs.toString().padStart(2, '0')}`;
            if (timeLeft === 0) {
                clearInterval(timer);
                alert('Time is up!');
            }
            timeLeft--;
        }, 1000);
    }

    async submitSpeech() {
        const speech = document.getElementById('speechInput').value;
        if (!speech) return;

        this.speeches.push({
            phase: this.phases[this.currentPhase].name,
            content: speech
        });

        document.getElementById('speechInput').value = '';
        this.updateDebateHistory();

        this.currentPhase++;
        if (this.currentPhase >= this.phases.length) {
            await this.endDebate();
        } else {
            this.startPhase();
        }
    }

    updateDebateHistory() {
        const history = document.getElementById('debateHistory');
        history.innerHTML = this.speeches.map(speech => `
            <div class="speech">
                <h3>${speech.phase}</h3>
                <p>${speech.content}</p>
            </div>
        `).join('');
    }

    async endDebate() {
        document.getElementById('debate').classList.add('hidden');
        document.getElementById('results').classList.remove('hidden');

        const feedback = await this.getAIFeedback();
        document.getElementById('judgement').innerHTML = feedback.decision;
        document.getElementById('feedback').innerHTML = feedback.feedback;
    }

    async getAIFeedback() {
        try {
            const response = await fetch('/api/get-feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic: this.topic,
                    speeches: this.speeches,
                    debaters: this.debaters
                })
            });
            return await response.json();
        } catch (error) {
            console.error(error);
            return {
                decision: 'Error getting AI feedback',
                feedback: 'Please try again later.'
            };
        }
    }

    resetDebate() {
        this.currentPhase = 0;
        this.speeches = [];
        this.topic = '';
        document.getElementById('results').classList.add('hidden');
        document.getElementById('setup').classList.remove('hidden');
        document.getElementById('debateHistory').innerHTML = '';
    }
}

new DebateApp();
