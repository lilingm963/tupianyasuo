// 获取DOM元素
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const compressionControls = document.getElementById('compressionControls');
const previewContainer = document.getElementById('previewContainer');
const originalPreview = document.getElementById('originalPreview');
const compressedPreview = document.getElementById('compressedPreview');
const originalSize = document.getElementById('originalSize');
const compressedSize = document.getElementById('compressedSize');
const originalDimensions = document.getElementById('originalDimensions');
const compressionRatio = document.getElementById('compressionRatio');
const qualitySlider = document.getElementById('quality');
const qualityValue = document.getElementById('qualityValue');
const compressBtn = document.getElementById('compressBtn');
const downloadBtn = document.getElementById('downloadBtn');

// 压缩质量预设
const qualityPresets = {
    high: 80,    // 高质量，适合照片
    medium: 60,  // 中等质量，适合一般图片
    low: 40      // 低质量，适合缩略图
};

// 当前处理的图片数据
let currentFile = null;
let originalImage = null;
let compressedDataUrl = null;

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 处理文件上传
function handleFileUpload(file) {
    if (!file.type.match('image.*')) {
        alert('请上传图片文件！');
        return;
    }

    currentFile = file;
    originalSize.textContent = formatFileSize(file.size);
    compressedDataUrl = null; // 重置压缩状态

    const reader = new FileReader();
    reader.onload = (e) => {
        originalImage = new Image();
        originalImage.onload = () => {
            originalPreview.src = e.target.result;
            originalDimensions.textContent = `${originalImage.width} x ${originalImage.height}`;
            compressionControls.style.display = 'block';
            previewContainer.style.display = 'grid';
            compressImage(); // 直接进行压缩
        };
        originalImage.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// 压缩图片
function compressImage() {
    if (!originalImage || !currentFile) {
        console.log('缺少必要的图片数据');
        return;
    }

    console.log('开始压缩图片...');
    console.log('当前压缩质量:', qualitySlider.value);

    // 创建新的 canvas 元素
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // 计算新的尺寸
    let newWidth = originalImage.width;
    let newHeight = originalImage.height;
    
    // 如果图片尺寸较大，进行尺寸压缩
    const maxDimension = 1920;
    if (newWidth > maxDimension || newHeight > maxDimension) {
        const ratio = Math.min(maxDimension / newWidth, maxDimension / newHeight);
        newWidth = Math.floor(newWidth * ratio);
        newHeight = Math.floor(newHeight * ratio);
    }
    
    // 设置 canvas 尺寸
    canvas.width = newWidth;
    canvas.height = newHeight;
    
    // 绘制图片
    ctx.drawImage(originalImage, 0, 0, newWidth, newHeight);
    
    // 获取压缩质量（限制最小值为15%）
    const quality = Math.max(qualitySlider.value, 15) / 100;
    
    try {
        // 根据图片类型选择最佳压缩策略
        let mimeType = currentFile.type;
        let outputQuality = quality;
        
        // 对于 PNG 图片，转换为 JPEG 格式以获得更好的压缩效果
        if (mimeType === 'image/png') {
            mimeType = 'image/jpeg';
            // 设置白色背景
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            // 重新绘制图片
            ctx.drawImage(originalImage, 0, 0, newWidth, newHeight);
        }
        
        // 压缩图片
        compressedDataUrl = canvas.toDataURL(mimeType, outputQuality);
        
        // 更新预览
        compressedPreview.src = compressedDataUrl;
        
        // 计算压缩后的大小
        const base64Data = compressedDataUrl.split(',')[1];
        const compressedBytes = Math.ceil(base64Data.length * 0.75);
        
        // 更新显示信息
        compressedSize.textContent = formatFileSize(compressedBytes);
        const ratio = ((1 - compressedBytes / currentFile.size) * 100).toFixed(1);
        compressionRatio.textContent = `${ratio}%`;
        
        console.log('压缩完成:');
        console.log('- 压缩质量:', outputQuality);
        console.log('- 图片类型:', mimeType);
        console.log('- 原始大小:', formatFileSize(currentFile.size));
        console.log('- 压缩后大小:', formatFileSize(compressedBytes));
        console.log('- 压缩比例:', ratio + '%');
        console.log('- 原始尺寸:', `${originalImage.width}x${originalImage.height}`);
        console.log('- 压缩后尺寸:', `${newWidth}x${newHeight}`);
    } catch (error) {
        console.error('压缩失败:', error);
        alert('图片压缩失败，请重试！');
    }
}

// 设置压缩质量预设
function setQualityPreset(preset) {
    qualitySlider.value = qualityPresets[preset];
    qualityValue.textContent = `${qualityPresets[preset]}%`;
    compressImage();
}

// 下载压缩后的图片
function downloadCompressedImage() {
    if (!compressedDataUrl) {
        alert('请先压缩图片！');
        return;
    }
    const link = document.createElement('a');
    link.download = `compressed_${currentFile.name}`;
    link.href = compressedDataUrl;
    link.click();
}

// 事件监听
uploadArea.addEventListener('click', () => fileInput.click());

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#007AFF';
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.borderColor = '#E5E5E5';
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#E5E5E5';
    const file = e.dataTransfer.files[0];
    handleFileUpload(file);
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    handleFileUpload(file);
});

// 滑块事件处理
qualitySlider.addEventListener('input', (e) => {
    const newValue = e.target.value;
    qualityValue.textContent = `${newValue}%`;
    console.log('滑块值改变:', newValue);
    
    if (originalImage) {
        compressImage();
    } else {
        console.log('没有可压缩的图片');
    }
});

compressBtn.addEventListener('click', compressImage);
downloadBtn.addEventListener('click', downloadCompressedImage); 