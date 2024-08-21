//////////////监听点击，并且导航到detail page然后 更新detail page内iframe相应的路径 发送到detail page （detail page内需要接收器）/////////
///////需在元素标签内添加  class="clickable" data-path="caseStudy.html" ///////////////
document.addEventListener("DOMContentLoaded", function() {
    // 为所有带有 clickable 类的元素添加点击事件监听器
    document.querySelectorAll('.clickable').forEach(function(element) {
        element.addEventListener('click', function(event) {
            event.preventDefault();  // 阻止默认行为
            event.stopPropagation(); // 阻止事件冒泡

            const path = element.getAttribute('data-path');
            console.log("Element clicked:", element);
            console.log("Path:", path);

            if (path) {
                window.top.location.href = `../detail.html?path=${encodeURIComponent(path)}`;
            }
        });
    });

    // 为 iframe 元素单独添加事件监听器，确保点击事件被捕获
    const galleryIframes = document.querySelectorAll('iframe.clickable');
    galleryIframes.forEach(function(iframe) {
        iframe.contentWindow.addEventListener('click', function(event) {
            event.preventDefault();  // 阻止默认行为
            event.stopPropagation(); // 阻止事件冒泡

            const path = iframe.getAttribute('data-path');
            console.log("Iframe clicked:", iframe);
            console.log("Path:", path);

            if (path) {
                window.top.location.href = `../detail.html?path=${encodeURIComponent(path)}`;
            }
        });
    });
});


//////////////////// 动态拾取并且插入文件夹内文本 /////////////////////////////////////////////////////////////////////////////////////
    document.addEventListener("DOMContentLoaded", function() {
    // 加载 tittleText.txt 内容
    var xhrA = new XMLHttpRequest();
    xhrA.open('GET', 'text/tittleText.txt', true);  // 修改路径，指向 text 文件夹
    xhrA.onreadystatechange = function() {
        if (xhrA.readyState === 4 && xhrA.status === 200) {
            var contentA = xhrA.responseText;
            document.getElementById('tittleText').innerHTML = contentA.replace(/\n/g, "<br>");
        }
    };
    xhrA.send();

    // 加载 mobileText.txt 内容
    var xhrB = new XMLHttpRequest();
    xhrB.open('GET', 'text/mobileText.txt', true);  // 修改路径，指向 text 文件夹
    xhrB.onreadystatechange = function() {
        if (xhrB.readyState === 4 && xhrB.status === 200) {
            var contentB = xhrB.responseText;
            document.getElementById('mobileText').innerHTML = contentB.replace(/\n/g, "<br>");
        }
    };
    xhrB.send();

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

    // 加载 mobileConcept.txt 内容
    var xhrD = new XMLHttpRequest();
    xhrD.open('GET', 'text/mobileConcept.txt', true);  // 修改路径，指向 text 文件夹
    xhrD.onreadystatechange = function() {
        if (xhrD.readyState === 4 && xhrD.status === 200) {
            var contentD = xhrD.responseText;
            document.getElementById('mobileConcept').innerHTML = contentD.replace(/\n/g, "<br>");
        }
    };
    xhrD.send();

    // 加载 desktopConcept.txt 内容
    var xhrE = new XMLHttpRequest();
    xhrE.open('GET', 'text/desktopConcept.txt', true);  // 修改路径，指向 text 文件夹
    xhrE.onreadystatechange = function() {
        if (xhrE.readyState === 4 && xhrE.status === 200) {
            var contentE = xhrE.responseText;
            document.getElementById('desktopConcept').innerHTML = contentE.replace(/\n/g, "<br>");
        }
    };
    xhrE.send();
});