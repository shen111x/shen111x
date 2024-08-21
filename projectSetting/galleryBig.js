let scrollNeed = 0;
let intervalId;

// 自动检测图片文件类型并生成HTML结构
const imageFolder = './images/';
const galleryContainer = document.querySelector('.gallery');

// 支持的文件类型
const supportedFormats = ['jpeg', 'jpg', 'gif', 'mp4'];

// 获取图片数量
let imageQuantity = 0;

// Function to check if a file exists
function fileExists(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('HEAD', url, false);
    xhr.send();
    return xhr.status !== 404;
}

for (let i = 1; i <= 10; i++) { // 假设最多10张图片
    supportedFormats.forEach(format => {
        const imgPath = `${imageFolder}${i}.${format}`;
        
        if (fileExists(imgPath)) {
            let element;
            if (format === 'mp4') {
                element = document.createElement('video');
                element.src = imgPath;
                element.loop = true; // 自动循环播放
                element.muted = true; // 自动静音
                element.autoplay = true; // 自动播放
                element.style.width = '100%'; // 使视频宽度填满容器
                //element.style.height = '100%'; // 使视频高度填满容器
                //element.style.objectFit = 'cover'; // 保持比例并填充容器
            } else {
                element = document.createElement('img');
                element.src = imgPath;
                element.style.width = '100%';
                //element.style.height = '100%';
                //element.style.objectFit = 'cover';
            }

            const div = document.createElement('div');
            div.className = 'single';
            div.appendChild(element);
            galleryContainer.appendChild(div);
            imageQuantity++; // 增加图片数量
        }
    });
}

/////////////////////////////////////////////////////////////////

// 保证图片加载完毕后再更新滚动逻辑
window.onload = () => {
    updateInfo();
    restartInterval();
};

function updateInfo() {
    const container = document.querySelector('.container');
    const scrollLeft = container.scrollLeft;

    // Reset the interval when the user scrolls
    restartInterval();

    const scrollWidth = container.scrollWidth;

    scrollNeed = (scrollWidth / imageQuantity) - (scrollLeft % (scrollWidth / imageQuantity));

    if (scrollNeed < 3) {
        scrollNeed = scrollWidth / imageQuantity;
    }
}

function nextSlide() {
    const container = document.querySelector('.container');
    const maxScrollLeft = container.scrollWidth - container.clientWidth;

    if (container.scrollLeft + container.clientWidth >= container.scrollWidth) {
        container.scrollLeft = 0;
    } else {
        container.scrollLeft += scrollNeed;
    }

    updateInfo();
}

// 自动播放倒计时刷新
function restartInterval() {
    clearInterval(intervalId);
    intervalId = setInterval(() => {
        nextSlide();
    }, 4000);
}

// 初次启动时自动播放
intervalId = setInterval(() => {
    nextSlide();
}, 3000);