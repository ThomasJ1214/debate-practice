// public/script.js

document.addEventListener('DOMContentLoaded', () => {
    // Fetch a random debate topic when the page loads
    fetch('/api/topic')
        .then(response => response.json())
        .then(data => {
            const topic = data.topic;
            document.getElementById('debate-topic').textContent = topic;
        })
        .catch(error => {
            console.error('Error fetching debate topic:', error);
            document.getElementById('debate-topic').textContent = 'Failed to load topic.';
        });

    // Handle speech submission
    document.getElementById('submit-speech').addEventListener('click', () => {
        const speech = document.getElementById('speech').value;

        if (!speech) {
            alert('Please enter a speech!');
            return;
        }

        // Send the speech to the server for feedback
        fetch('/api/debate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ speech })
        })
        .then(response => response.json())
        .then(data => {
            document.getElementById('feedback').textContent = data.feedback;
            document.getElementById('score').textContent = data.score;
            document.getElementById('suggestions').textContent = data.suggestions;
        })
        .catch(error => {
            console.error('Error submitting speech:', error);
            alert('There was an error submitting your speech.');
        });
    });
});
