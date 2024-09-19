;
function lazyPic(setting) {
    this.emt = setting.emt;
    this.animeTime = setting.animeTime;
    this.tagType = setting.tagType;
    this.Gaussian = setting.Gaussian === undefined ? 1 : setting.Gaussian;
    this.width = setting.width;
    this.height = setting.height;
    this.backgroundColor = setting.backgroundColor;
    this.lazyLoad = function () {
        if (this.tagType == "data-src") {
            new lazyonePic(this.emt, this.animeTime, this.Gaussian).lazyLoad();
        } else if (this.tagType == "2img") {
            new lazy2Pic(this.emt, this.animeTime, this.Gaussian).lazyLoad();
        } else if (this.tagType == "anime") {
            new lazyPicAnimes(this.emt, this.animeTime, this.Gaussian, this.width, this.height, this.backgroundColor).lazyLoad();
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


function lazyPicAnimes(emt, animeTime, Gaussian, width, height, backgroundColor) {
    const self = this;
    this.emt = emt;
    this.animeTime = animeTime;
    this.Gaussian = Gaussian;
    this.width = width;
    this.height = height;
    this.backgroundColor = backgroundColor;

    this.lazyLoad = function () {
        this.style();
        const finalImages = document.querySelectorAll(this.emt);
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    self.fadeOutThumbnail(entry);
                }
            });
        });
        finalImages.forEach(image => {
            observer.observe(image);
        });
    };

    this.callback = function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                self.fadeOutThumbnail(entry);
            }
        });
    };

    this.fadeOutThumbnail = function (entry) {
        const target = entry.target;
        const thumbnail = target.previousElementSibling ? entry.target.previousElementSibling : entry.target.nextElementSibling;
        target.parentElement.style.position = "relative";
        if (thumbnail) {
            thumbnail.classList.add("lazyload-jumping");
        } else {
            console.log("no thumbnail");
        }

        if (target.src === "") {
            let newImage = new Image();
            newImage.src = target.getAttribute("data-src");
            newImage.onload = function () {
                target.src = newImage.src;
                if (thumbnail) {
                    thumbnail.style.opacity = '0';
                    thumbnail.style.transition = "opacity 0.5s ease";
                }
            };
        }
    };
    this.style = function () {
        let style = document.createElement("style");
        style.innerHTML = `
        .lazyload-jumping{
            position: absolute;
            flex-direction: column;
            justify-content: center;
            height:${this.height};
            width:${this.width};
            text-align: center;
        }
            
        .lazyload-jumping, .lazyload-jumping * {
            box-sizing: border-box;
        }

        .lazyload-jumping span {
            display: inline-block;
            height: 15px;
            width: 15px;
            Animes: rgb(18,180,255);
            border-radius: 487px;
            background-color: rgb(0, 153, 255);
            Animes-clip: padding-box;
                -o-Animes-clip: padding-box;
                -ms-Animes-clip: padding-box;
                -webkit-Animes-clip: padding-box;
                -moz-Animes-clip: padding-box;
        }

        .lazyload-jumping span:nth-child(1) {
            animation: scale 1.15s 0.12s infinite cubic-bezier(0.6, -0.28, 0.735, 0.045);
                -o-animation: scale 1.15s 0.12s infinite cubic-bezier(0.6, -0.28, 0.735, 0.045);
                -ms-animation: scale 1.15s 0.12s infinite cubic-bezier(0.6, -0.28, 0.735, 0.045);
                -webkit-animation: scale 1.15s 0.12s infinite cubic-bezier(0.6, -0.28, 0.735, 0.045);
                -moz-animation: scale 1.15s 0.12s infinite cubic-bezier(0.6, -0.28, 0.735, 0.045);
        }
        .lazyload-jumping span:nth-child(2) {
            animation: scale 1.15s 0.23s infinite cubic-bezier(0.6, -0.28, 0.735, 0.045);
                -o-animation: scale 1.15s 0.23s infinite cubic-bezier(0.6, -0.28, 0.735, 0.045);
                -ms-animation: scale 1.15s 0.23s infinite cubic-bezier(0.6, -0.28, 0.735, 0.045);
                -webkit-animation: scale 1.15s 0.23s infinite cubic-bezier(0.6, -0.28, 0.735, 0.045);
                -moz-animation: scale 1.15s 0.23s infinite cubic-bezier(0.6, -0.28, 0.735, 0.045);
        }
        .lazyload-jumping span:nth-child(3) {
            animation: scale 1.15s 0.35s infinite cubic-bezier(0.6, -0.28, 0.735, 0.045);
                -o-animation: scale 1.15s 0.35s infinite cubic-bezier(0.6, -0.28, 0.735, 0.045);
                -ms-animation: scale 1.15s 0.35s infinite cubic-bezier(0.6, -0.28, 0.735, 0.045);
                -webkit-animation: scale 1.15s 0.35s infinite cubic-bezier(0.6, -0.28, 0.735, 0.045);
                -moz-animation: scale 1.15s 0.35s infinite cubic-bezier(0.6, -0.28, 0.735, 0.045);
        }
        .lazyload-jumping span:nth-child(4) {
            animation: scale 1.15s 0.46s infinite cubic-bezier(0.6, -0.28, 0.735, 0.045);
                -o-animation: scale 1.15s 0.46s infinite cubic-bezier(0.6, -0.28, 0.735, 0.045);
                -ms-animation: scale 1.15s 0.46s infinite cubic-bezier(0.6, -0.28, 0.735, 0.045);
                -webkit-animation: scale 1.15s 0.46s infinite cubic-bezier(0.6, -0.28, 0.735, 0.045);
                -moz-animation: scale 1.15s 0.46s infinite cubic-bezier(0.6, -0.28, 0.735, 0.045);
        }
        .lazyload-jumping span:nth-child(5) {
            animation: scale 1.15s 0.58s infinite cubic-bezier(0.6, -0.28, 0.735, 0.045);
                -o-animation: scale 1.15s 0.58s infinite cubic-bezier(0.6, -0.28, 0.735, 0.045);
                -ms-animation: scale 1.15s 0.58s infinite cubic-bezier(0.6, -0.28, 0.735, 0.045);
                -webkit-animation: scale 1.15s 0.58s infinite cubic-bezier(0.6, -0.28, 0.735, 0.045);
                -moz-animation: scale 1.15s 0.58s infinite cubic-bezier(0.6, -0.28, 0.735, 0.045);
        }



        @keyframes scale {
            0% {
                transform: scale(0);
            }
            25% {
                transform: scale(0.9, 0.9);
                Animes: rgb(40,173,235);
            }
            50% {
                transform: scale(1, 1);
                margin: 0 3px;
                Animes: rgb(30,152,245);
            }
            100% {
                transform: scale(0);
            }
        }

        @-o-keyframes scale {
            0% {
                -o-transform: scale(0);
            }
            25% {
                -o-transform: scale(0.9, 0.9);
                Animes: rgb(40,173,235);
            }
            50% {
                -o-transform: scale(1, 1);
                margin: 0 3px;
                Animes: rgb(30,152,245);
            }
            100% {
                -o-transform: scale(0);
            }
        }

        @-ms-keyframes scale {
            0% {
                -ms-transform: scale(0);
            }
            25% {
                -ms-transform: scale(0.9, 0.9);
                Animes: rgb(40,173,235);
            }
            50% {
                -ms-transform: scale(1, 1);
                margin: 0 3px;
                Animes: rgb(30,152,245);
            }
            100% {
                -ms-transform: scale(0);
            }
        }

        @-webkit-keyframes scale {
            0% {
                -webkit-transform: scale(0);
            }
            25% {
                -webkit-transform: scale(0.9, 0.9);
                Animes: rgb(40,173,235);
            }
            50% {
                -webkit-transform: scale(1, 1);
                margin: 0 3px;
                Animes: rgb(30,152,245);
            }
            100% {
                -webkit-transform: scale(0);
            }
        }

        @-moz-keyframes scale {
            0% {
                -moz-transform: scale(0);
            }
            25% {
                -moz-transform: scale(0.9, 0.9);
                Animes: rgb(40,173,235);
            }
            50% {
                -moz-transform: scale(1, 1);
                margin: 0 3px;
                Animes: rgb(30,152,245);
            }
            100% {
                -moz-transform: scale(0);
            }
        }
        `;
        document.head.appendChild(style);
    }

}