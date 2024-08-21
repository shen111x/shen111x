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

// 动态加载文本内容
function loadTextContent() {
    var xhrA = new XMLHttpRequest();
    xhrA.open('GET', 'text/tittleText.txt', true);
    xhrA.onreadystatechange = function() {
        if (xhrA.readyState === 4 && xhrA.status === 200) {
            var contentA = xhrA.responseText;
            document.getElementById('tittleText').innerHTML = contentA.replace(/\n/g, "<br>");
            // 文本加载完成后调整iframe高度
            notifyParentToResizeIframe();
        }
    };
    xhrA.send();

    // 加载 desktopText.txt 内容
    var xhrC = new XMLHttpRequest();
    xhrC.open('GET', 'text/desktopText.txt', true);  // 修改路径，指向 text 文件夹
    xhrC.onreadystatechange = function() {
        if (xhrC.readyState === 4 && xhrC.status === 200) {
            var contentC = xhrC.responseText;
            document.getElementById('desktopText').innerHTML = contentC.replace(/\n/g, "<br>");
            // 文本加载完成后调整iframe高度
            notifyParentToResizeIframe();
        }
    };
    xhrC.send();


     // 加载 desktopConcept.txt 内容
     var xhrE = new XMLHttpRequest();
     xhrE.open('GET', 'text/desktopConcept.txt', true);  // 修改路径，指向 text 文件夹
     xhrE.onreadystatechange = function() {
         if (xhrE.readyState === 4 && xhrE.status === 200) {
             var contentE = xhrE.responseText;
             document.getElementById('desktopConcept').innerHTML = contentE.replace(/\n/g, "<br>");
             // 文本加载完成后调整iframe高度
            notifyParentToResizeIframe();
         }
     };
     xhrE.send();
}



// 加载 desktopText.txt 内容
    var xhrC = new XMLHttpRequest();
    xhrC.open('GET', 'text/desktopText.txt', true);  // 修改路径，指向 text 文件夹
    xhrC.onreadystatechange = function() {
        if (xhrC.readyState === 4 && xhrC.status === 200) {
            var contentC = xhrC.responseText;
            document.getElementById('desktopText').innerHTML = contentC.replace(/\n/g, "<br>");
        }
    };
    xhrC.send();

// 动态加载图片内容
function loadImages() {
    let imagesLoaded = 0;

    for (let i = 1; i <= 10; i++) { // 假设最多10张图片
        supportedFormats.forEach(format => {
            const imgPath = `${imageFolder}${i}.${format}`;
            
            if (fileExists(imgPath)) {
                let element;
                if (format === 'mp4') {
                    element = document.createElement('video');
                    element.src = imgPath;
                    element.loop = true;
                    element.muted = true;
                    element.autoplay = true;
                    element.style.width = '100%';
                } else {
                    element = document.createElement('img');
                    element.src = imgPath;
                    element.style.width = '100%';
                }

                const div = document.createElement('div');
                div.className = 'single';
                div.appendChild(element);
                galleryContainer.appendChild(div);
                imageQuantity++; // 增加图片数量

                // 图片加载事件监听
                element.onload = element.onloadeddata = function() {
                    imagesLoaded++;
                    if (imagesLoaded === imageQuantity) {
                        notifyParentToResizeIframe();  // 所有图片加载完成后调整iframe高度
                    }
                };
            }
        });
    }
}

// 通知父窗口调整 iframe 高度
function notifyParentToResizeIframe() {
    if (window.parent && window.parent.resizeIframe) {
        window.parent.resizeIframe(document.getElementById('caseStudyIframe'));
    }
}

// 页面加载完成后执行
document.addEventListener("DOMContentLoaded", function() {
    loadTextContent();  // 加载文本
    loadImages();       // 加载图片
});