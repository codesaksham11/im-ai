const promptInput = document.getElementById('promptInput');
const generateBtn = document.getElementById('generateBtn');
const resultImage = document.getElementById('resultImage');
const loading = document.getElementById('loading');

generateBtn.addEventListener('click', async () => {
    const prompt = promptInput.value;
    if (!prompt) {
        alert('Please enter a prompt.');
        return;
    }

    // Show loading indicator and hide old image
    loading.classList.remove('hidden');
    resultImage.classList.add('hidden');
    generateBtn.disabled = true;

    try {
        // THIS IS THE KEY: We fetch from OUR own API endpoint, not Perchance
        const response = await fetch(`/api/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt: prompt }),
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.statusText}`);
        }

        const data = await response.json();
        
        // The serverless function will return the image as a Base64 string
        resultImage.src = data.imageUrl;
        resultImage.classList.remove('hidden');

    } catch (error) {
        console.error('Error:', error);
        alert('Failed to generate image. Check the console for details.');
    } finally {
        // Hide loading indicator and re-enable button
        loading.classList.add('hidden');
        generateBtn.disabled = false;
    }
});
