document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const uploadSection = document.getElementById('upload-section');
    const previewSection = document.getElementById('preview-section');
    const fileInput = document.getElementById('file-input');
    const dropArea = document.getElementById('drop-area');
    const originalImage = document.getElementById('original-image');
    const coloredImage = document.getElementById('colored-image');
    const viewOriginalBtn = document.getElementById('view-original');
    const viewColoredBtn = document.getElementById('view-colored');
    const suggestedColorsContainer = document.getElementById('suggested-colors');
    const paletteColorsContainer = document.getElementById('palette-colors');
    const complementaryColorsContainer = document.getElementById('complementary-colors');
    const selectedColorDisplay = document.getElementById('selected-color-display');
    const selectedColorHex = document.getElementById('selected-color-hex');
    const applyColorBtn = document.getElementById('apply-color-btn');
    const backBtn = document.getElementById('back-btn');
    const loadingOverlay = document.getElementById('loading-overlay');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const cameraBtn = document.getElementById('camera-btn');
    const cameraPreview = document.getElementById('camera-preview');
    const cameraCanvas = document.getElementById('camera-canvas');

    // App State
    let currentFileName = '';
    let selectedColor = '#FFFFFF';
    let suggestedColors = [];
    let stream = null;

    // Initialize
    initializeApp();

    function initializeApp() {
        // Setup event listeners
        setupEventListeners();
        // Setup drag and drop
        setupDragAndDrop();
        // Setup camera functionality
        setupCamera();
    }

    function setupEventListeners() {
        // File input change
        fileInput.addEventListener('change', handleFileSelect);

        // Upload button click
        document.querySelector('.upload-btn').addEventListener('click', () => {
            fileInput.click();
        });

        // View original/colored toggle
        viewOriginalBtn.addEventListener('click', () => toggleImageView('original'));
        viewColoredBtn.addEventListener('click', () => toggleImageView('colored'));

        // Apply color button
        applyColorBtn.addEventListener('click', applySelectedColor);

        // Back button
        backBtn.addEventListener('click', goBackToUpload);

        // Tab switching
        tabButtons.forEach(button => {
            button.addEventListener('click', () => switchTab(button.dataset.tab));
        });
    }

    function setupDragAndDrop() {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        ['dragenter', 'dragover'].forEach(eventName => {
            dropArea.addEventListener(eventName, highlight, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, unhighlight, false);
        });

        function highlight() {
            dropArea.classList.add('highlight');
        }

        function unhighlight() {
            dropArea.classList.remove('highlight');
        }

        dropArea.addEventListener('drop', handleDrop, false);
    }

    function setupCamera() {
        cameraBtn.addEventListener('click', toggleCamera);
    }

    async function toggleCamera() {
        try {
            if (cameraPreview.style.display === 'none') {
                // Start camera
                stream = await navigator.mediaDevices.getUserMedia({ video: true });
                cameraPreview.srcObject = stream;
                cameraPreview.style.display = 'block';
                cameraBtn.innerHTML = '<i class="fas fa-camera"></i> Take Photo';
                cameraBtn.classList.add('active');
            } else if (cameraBtn.classList.contains('active')) {
                // Take photo
                takePhoto();
                cameraBtn.innerHTML = '<i class="fas fa-camera"></i> Retake Photo';
                cameraBtn.classList.remove('active');
            } else {
                // Retake photo
                cameraPreview.style.display = 'block';
                cameraCanvas.style.display = 'none';
                cameraBtn.innerHTML = '<i class="fas fa-camera"></i> Take Photo';
                cameraBtn.classList.add('active');
            }
        } catch (error) {
            console.error('Error accessing camera:', error);
            alert('Could not access camera. Please make sure camera permissions are enabled.');
        }
    }

    function takePhoto() {
        const context = cameraCanvas.getContext('2d');
        
        // Set canvas dimensions to match video
        cameraCanvas.width = cameraPreview.videoWidth;
        cameraCanvas.height = cameraPreview.videoHeight;
        
        // Draw video frame to canvas
        context.drawImage(cameraPreview, 0, 0, cameraCanvas.width, cameraCanvas.height);
        
        // Hide video, show canvas
        cameraPreview.style.display = 'none';
        cameraCanvas.style.display = 'block';
        
        // Convert canvas to file and upload
        cameraCanvas.toBlob(blob => {
            const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
            uploadImage(file);
        }, 'image/jpeg');
    }

    function handleDrop(e) {
        const files = e.dataTransfer.files;
        if (files.length) {
            fileInput.files = files;
            handleFileSelect(e);
        }
    }

    function handleFileSelect(e) {
        const files = fileInput.files;
        if (files.length) {
            uploadImage(files[0]);
        }
    }

    function uploadImage(file) {
        if (!file || !file.type.match('image.*')) {
            alert('Please select an image file.');
            return;
        }

        showLoading();

        const formData = new FormData();
        formData.append('file', file);

        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                currentFileName = data.filename;
                originalImage.src = data.filepath;
                originalImage.onload = () => {
                    suggestedColors = data.suggested_colors;
                    displaySuggestedColors();
                    showPreviewSection();
                    hideLoading();
                };
            } else {
                alert(data.error || 'Error uploading image.');
                hideLoading();
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred during upload.');
            hideLoading();
        });
    }

    function displaySuggestedColors() {
        suggestedColorsContainer.innerHTML = '';
        
        suggestedColors.forEach(color => {
            const colorSwatch = document.createElement('div');
            colorSwatch.className = 'color-swatch';
            colorSwatch.style.backgroundColor = color;
            colorSwatch.dataset.color = color;
            colorSwatch.addEventListener('click', () => selectColor(color, colorSwatch));
            suggestedColorsContainer.appendChild(colorSwatch);
        });

        // Select the first color by default
        if (suggestedColors.length > 0) {
            selectColor(suggestedColors[0], suggestedColorsContainer.querySelector('.color-swatch'));
        }

        // Generate complementary colors
        if (suggestedColors.length > 0) {
            displayComplementaryColors(suggestedColors[0]);
        }

        // Display predefined palette colors
        displayPaletteColors();
    }

    function displayPaletteColors() {
        const paletteColors = [
            '#FFFFFF', // White
            '#F5F5F5', // White Smoke
            '#DCDCDC', // Gainsboro
            '#D3D3D3', // Light Gray
            '#C0C0C0', // Silver
            '#A9A9A9', // Dark Gray
            '#808080', // Gray
            '#696969', // Dim Gray
            '#000000', // Black
            '#FFFAF0', // Floral White
            '#FAF0E6', // Linen
            '#FDF5E6', // Old Lace
            '#FAEBD7', // Antique White
            '#FFE4C4', // Bisque
            '#FFEBCD', // Blanched Almond
            '#F5DEB3', // Wheat
            '#DEB887', // Burlywood
            '#D2B48C', // Tan
            '#BC8F8F', // Rosy Brown
            '#F08080', // Light Coral
            '#CD5C5C', // Indian Red
            '#8B0000', // Dark Red
            '#800000', // Maroon
            '#B22222', // Firebrick
            '#A52A2A', // Brown
        ];

        paletteColorsContainer.innerHTML = '';
        
        paletteColors.forEach(color => {
            const colorSwatch = document.createElement('div');
            colorSwatch.className = 'color-swatch';
            colorSwatch.style.backgroundColor = color;
            colorSwatch.dataset.color = color;
            colorSwatch.addEventListener('click', () => selectColor(color, colorSwatch));
            paletteColorsContainer.appendChild(colorSwatch);
        });
    }

    function displayComplementaryColors(baseColor) {
        // Simple algorithm to generate complementary colors
        const rgb = hexToRgb(baseColor);
        const complementary = [
            rgbToHex(255 - rgb.r, 255 - rgb.g, rgb.b),
            rgbToHex(rgb.r, 255 - rgb.g, 255 - rgb.b),
            rgbToHex(255 - rgb.r, rgb.g, 255 - rgb.b),
            rgbToHex(255 - rgb.r, rgb.g, rgb.b),
            rgbToHex(rgb.r, 255 - rgb.g, rgb.b),
            rgbToHex(rgb.r, rgb.g, 255 - rgb.b)
        ];

        complementaryColorsContainer.innerHTML = '';
        
        complementary.forEach(color => {
            const colorSwatch = document.createElement('div');
            colorSwatch.className = 'color-swatch';
            colorSwatch.style.backgroundColor = color;
            colorSwatch.dataset.color = color;
            colorSwatch.addEventListener('click', () => selectColor(color, colorSwatch));
            complementaryColorsContainer.appendChild(colorSwatch);
        });
    }

    function hexToRgb(hex) {
        hex = hex.replace(/^#/, '');
        const bigint = parseInt(hex, 16);
        return {
            r: (bigint >> 16) & 255,
            g: (bigint >> 8) & 255,
            b: bigint & 255
        };
    }

    function rgbToHex(r, g, b) {
        return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
    }

    function selectColor(color, swatch) {
        // Remove selection from all swatches
        document.querySelectorAll('.color-swatch').forEach(el => {
            el.classList.remove('selected');
        });

        // Add selection to clicked swatch
        if (swatch) {
            swatch.classList.add('selected');
        }

        // Update selected color display
        selectedColor = color;
        selectedColorDisplay.style.backgroundColor = color;
        selectedColorHex.textContent = color;
    }

    function applySelectedColor() {
        if (!currentFileName) {
            alert('Please upload an image first.');
            return;
        }

        showLoading();

        fetch('/apply_color', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                filename: currentFileName,
                color: selectedColor
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                coloredImage.src = data.result_path;
                coloredImage.onload = () => {
                    toggleImageView('colored');
                    hideLoading();
                };
            } else {
                alert(data.error || 'Error applying color.');
                hideLoading();
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while applying the color.');
            hideLoading();
        });
    }

    function toggleImageView(view) {
        if (view === 'original') {
            originalImage.style.display = 'block';
            coloredImage.style.display = 'none';
            viewOriginalBtn.classList.add('active');
            viewColoredBtn.classList.remove('active');
        } else {
            originalImage.style.display = 'none';
            coloredImage.style.display = 'block';
            viewOriginalBtn.classList.remove('active');
            viewColoredBtn.classList.add('active');
        }
    }

    function switchTab(tabName) {
        // Hide all tab contents
        tabContents.forEach(content => {
            content.classList.remove('active');
        });

        // Show selected tab content
        document.getElementById(`${tabName}-tab`).classList.add('active');

        // Update tab buttons
        tabButtons.forEach(button => {
            button.classList.remove('active');
            if (button.dataset.tab === tabName) {
                button.classList.add('active');
            }
        });
    }

    function showPreviewSection() {
        uploadSection.style.display = 'none';
        previewSection.style.display = 'block';

        // Stop camera if active
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
            cameraPreview.style.display = 'none';
            cameraCanvas.style.display = 'none';
        }
    }

    function goBackToUpload() {
        uploadSection.style.display = 'block';
        previewSection.style.display = 'none';
    }

    function showLoading() {
        loadingOverlay.style.display = 'flex';
    }

    function hideLoading() {
        loadingOverlay.style.display = 'none';
    }
}); 