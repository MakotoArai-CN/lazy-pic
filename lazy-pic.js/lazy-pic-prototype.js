function lazyPic(setting) {
    this.emt = setting.emt;
    this.animeTime = setting.animeTime;
    this.tagType = setting.tagType;
    this.Gaussian = setting.Gaussian=1;
}

lazyPic.prototype.lazyLoad = function () {
    if (this.tagType == "data-src") {
        new lazyonePic(this.emt, this.animeTime, this.Gaussian).lazyLoad();
    } else if (this.tagType == "2img") {
        new lazy2Pic(this.emt, this.animeTime, this.Gaussian).lazyLoad();
    } else if (this.tagType == "background") {
        new lazyPicBackground(this.emt, this.animeTime, this.Gaussian).lazyLoad();
    }
};

function lazy2Pic(emt, animeTime, Gaussian) {
    this.emt = emt;
    this.animeTime = animeTime;
    this.Gaussian = Gaussian;
}

lazy2Pic.prototype.lazyLoad = function () {
    const $finalImages = $(this.emt);
    const observer = new IntersectionObserver(this.callback.bind(this));
    $finalImages.each((index, image) => {
        observer.observe(image);
    });
};

lazy2Pic.prototype.callback = function (entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            this.handleImageIntersection(entry);
        }
    }, this);
};

lazy2Pic.prototype.handleImageIntersection = function (entry) {
    if (entry.target.complete) {
        this.fadeOutThumbnail(entry);
    } else {
        $(entry.target).on('load', () => {
            if (entry.target.complete) {
                this.fadeOutThumbnail(entry);
            }
        });
    }
};

lazy2Pic.prototype.fadeOutThumbnail = function (entry) {
    const $target = entry.target;
    const $thumbnail = $target.previousElementSibling ? $(entry.target.previousElementSibling) : $(entry.target.nextElementSibling);
    if ($thumbnail.length > 0) {
        $thumbnail.css('opacity', '0').fadeOut(this.animeTime);
    } else {
        console.log("no thumbnail");
    }
};

function lazyonePic(emt, animeTime, Gaussian) {
    this.emt = emt;
    this.animeTime = animeTime;
    this.Gaussian = Gaussian;
}

lazyonePic.prototype.lazyLoad = function () {
    this.style();
    const $finalImages = $(this.emt);
    const observer = new IntersectionObserver(this.callback.bind(this));
    $finalImages.each((index, image) => {
        observer.observe(image);
    });
};

lazyonePic.prototype.callback = function (entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            this.fadeOutThumbnail(entry);
        }
    }, this);
};

lazyonePic.prototype.fadeOutThumbnail = function (entry) {
    let img = entry.target;
    let trueSrc = img.getAttribute("data-src");
    let observer = new IntersectionObserver(this.callback.bind(this));
    img.onload = function () {}

    if (trueSrc.match(/\/([^\/]+)\.*$/)[0] !== img.src.match(/\/([^\/]+)\.*$/)[0]) {
        let newImg = new Image();
        newImg.src = trueSrc;
        newImg.onload = function () {
            if (this.Gaussian) {
                img.classList.add("img-blur");
            }
            img.src = newImg.src;
            observer.unobserve(img);
            if (this.Gaussian) {
                setTimeout(() => {
                    img.classList.remove("img-blur");
                    img.classList.add("img-unblur");
                }, this.animeTime);
            }
        }.bind(this);
    }
};

lazyonePic.prototype.style = function () {
    let style = document.createElement("style");
    style.innerHTML = '.img-blur {filter: blur(5px);transition: filter 0.5s ease;}.img-unblur {filter: blur(0px);transition: filter 1s ease;}';
    document.head.appendChild(style);
};