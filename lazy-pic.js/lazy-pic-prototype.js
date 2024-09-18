function lazyPic(setting) {
    this.emt = setting.emt;
    this.animeTime = setting.animeTime;
    this.tagType = setting.tagType;
    this.Gaussian = setting.Gaussian === undefined ? 1 : setting.Gaussian;

    this.lazyLoad = function () {
        if (this.tagType === "data-src") {
            new lazyonePic(this.emt, this.animeTime, this.Gaussian).lazyLoad();
        } else if (this.tagType === "2img") {
            new lazy2Pic(this.emt, this.animeTime, this.Gaussian).lazyLoad();
        } else if (this.tagType === "background") {
            new lazyPicBackground(this.emt, this.animeTime, this.Gaussian).lazyLoad();
        }
    };
}

function lazy2Pic(emt, animeTime, Gaussian) {
    this.emt = emt;
    this.animeTime = animeTime;
    this.Gaussian = Gaussian;

    this.lazyLoad = function () {
        var finalImages = document.querySelectorAll(this.emt);
        var observer = new IntersectionObserver(this.callback.bind(this));
        [].slice.call(finalImages).forEach(function (image) {
            observer.observe(image);
        });
    };

    this.callback = function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                this.handleImageIntersection(entry);
            }
        }, this);
    };

    this.handleImageIntersection = function (entry) {
        if (entry.target.complete) {
            this.fadeOutThumbnail(entry);
        } else {
            entry.target.addEventListener('load', function () {
                if (entry.target.complete) {
                    this.fadeOutThumbnail(entry);
                }
            }.bind(this));
        }
    };

    this.fadeOutThumbnail = function (entry) {
        var target = entry.target;
        var thumbnail = target.previousElementSibling || target.nextElementSibling;
        if (thumbnail) {
            thumbnail.style.opacity = '0';
            thumbnail.style.transition = `opacity ${this.animeTime}ms`;
            setTimeout(function () {
                thumbnail.style.display = 'none';
            }, this.animeTime);
        } else {
            console.log("no thumbnail");
        }
    };
}

function lazyonePic(emt, animeTime, Gaussian) {
    this.emt = emt;
    this.animeTime = animeTime;
    this.Gaussian = Gaussian;

    this.lazyLoad = function () {
        this.style();
        var finalImages = document.querySelectorAll(this.emt);
        var observer = new IntersectionObserver(this.callback.bind(this));
        [].slice.call(finalImages).forEach(function (image) {
            observer.observe(image);
        });
    };

    this.callback = function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                this.fadeOutThumbnail(entry);
            }
        }, this);
    };

    this.fadeOutThumbnail = function (entry) {
        var img = entry.target;
        var trueSrc = img.getAttribute("data-src");
        var observer = new IntersectionObserver(this.callback.bind(this));
        if (trueSrc.match(/\/([^\/]+)\.*$/)[0] !== img.src.match(/\/([^\/]+)\.*$/)[0]) {
            let newImg = new Image();
            newImg.src = trueSrc;
            if (this.Gaussian) {
                img.classList.add("img-blur");
            }
            newImg.onload = function () {
                img.src = newImg.src;
                observer.unobserve(img);
                let sleepTime=(Date.now()-startTime<200)?0:(this.animeTime/(this.animeTime/1000));
                if (this.Gaussian && trueSrc.match(/\/([^\/]+)\.*$/)[0] == img.src.match(/\/([^\/]+)\.*$/)[0]) {
                    setTimeout(function () {
                        img.classList.remove("img-blur");
                        img.classList.add("img-unblur");
                    }, sleepTime);
                }
            }.bind(this);
        }
    };

    this.style = function () {
        let style = document.createElement("style");
        style.innerHTML = `.img-blur {filter: blur(5px);transition: filter ${this.animeTime/1000}s ease;}.img-unblur {filter: blur(0px);transition: filter ${this.animeTime/1000}s ease;}`;
        document.head.appendChild(style);
    }
}